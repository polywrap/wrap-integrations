import {
  BlockResult,
  Args_getAccountState,
  Args_findAccessKey,
  Args_getPublicKey,
  Args_getBlock,
  Near_Module,
  AccessKeyInfo,
  AccountView,
  Args_getAccountBalance,
  AccountBalance,
  Args_viewContractState,
  ContractStateResult,
  ViewContractCode,
  Args_getAccessKeys,
  Args_getAccountDetails,
  Args_viewFunction,
  Args_viewContractCode,
  AccountAuthorizedApp,
  Interface_PublicKey,
} from "../wrap";
import JsonRpcProvider from "../utils/JsonRpcProvider";
import { BigInt, JSON, JSONEncoder } from "@polywrap/wasm-as";
import { publicKeyToStr } from "../utils/typeUtils";
import {
  toAccessKey,
  toAccessKeyInfo,
  toContractStateResult,
} from "../utils/jsonMap";

export function getBlock(args: Args_getBlock): BlockResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.block(args.blockQuery);
}

export function getAccountState(args: Args_getAccountState): AccountView {
  // prepare params
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_account");
  encoder.setString("account_id", args.accountId);
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = <JSON.Obj>provider.sendJsonRpc("query", params);
  // parse and return result
  return {
    amount: result.getString("amount")!.valueOf(),
    locked: result.getString("locked")!.valueOf(),
    codeHash: result.getString("code_hash")!.valueOf(),
    storageUsage: BigInt.fromString(
      result.getValue("storage_usage")!.stringify()
    ),
    storagePaidAt: BigInt.fromString(
      result.getValue("storage_paid_at")!.stringify()
    ),
    blockHeight: BigInt.fromString(
      result.getValue("block_height")!.stringify()
    ),
    blockHash: result.getString("block_hash")!.valueOf(),
  };
}

export function viewContractState(
  args: Args_viewContractState
): ContractStateResult {
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_state");
  // encoder.setString("account_id", '');
  if (args.blockQuery.block_id != null) {
    encoder.setString("block_id", args.blockQuery.block_id!);
  }
  if (args.blockQuery.finality != null) {
    encoder.setString("finality", args.blockQuery.finality!);
  }
  encoder.setString("account_id", args.accountId);
  encoder.setString("prefix_base64", "");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = <JSON.Obj>provider.sendJsonRpc("query", params);
  return toContractStateResult(result);
}

export function viewContractCode(
  args: Args_viewContractCode
): ViewContractCode {
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_code");
  encoder.setString("account_id", args.accountId);
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = <JSON.Obj>provider.sendJsonRpc("query", params);
  return {
    code_base64: result.getString("code_base64")!.valueOf(),
    hash: result.getString("hash")!.valueOf(),
    block_height: BigInt.fromString(
      result.getValue("block_height")!.stringify()
    ),
    block_hash: result.getString("block_hash")!.valueOf(),
  };
}

export function findAccessKey(args: Args_findAccessKey): AccessKeyInfo | null {
  // get public key
  const publicKey: Interface_PublicKey | null = getPublicKey({
    accountId: args.accountId,
  });
  if (publicKey == null) {
    return null;
  }
  // prepare params
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_access_key");
  encoder.setString("account_id", args.accountId);
  encoder.setString("public_key", publicKeyToStr(publicKey));
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = <JSON.Obj>provider.sendJsonRpc("query", params);
  return {
    accessKey: toAccessKey(result),
    publicKey: publicKeyToStr(publicKey),
  };
}

export function getPublicKey(args: Args_getPublicKey): Interface_PublicKey | null {
  const publicKey = Near_Module.getPublicKey({
    accountId: args.accountId,
  }).unwrap();
  if (publicKey != null) {
    return { keyType: publicKey.keyType, data: publicKey.data };
  }
  return null;
}

export function getAccountBalance(
  args: Args_getAccountBalance
): AccountBalance {
  // prepare params
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_account");
  encoder.setString("account_id", args.accountId);
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  // parse and return result
  const state = getAccountState({ accountId: args.accountId });

  const protocolConfig = provider.protocolConfig();

  const costPerByte = protocolConfig.runtime_config.storage_amount_per_byte;

  const stateStaked = state.storageUsage.mul(BigInt.fromString(costPerByte));
  const staked = BigInt.fromString(state.locked);
  const totalBalance = BigInt.fromString(state.amount).add(staked);
  const minus = staked.gt(stateStaked) ? staked : stateStaked;
  const availableBalance = totalBalance.sub(minus);

  return {
    total: totalBalance.toString(),
    stateStaked: stateStaked.toString(),
    staked: staked.toString(),
    available: availableBalance.toString(),
  } as AccountBalance;
}

export function getAccountDetails(
  args: Args_getAccountDetails
): AccountAuthorizedApp[] {
  const accessKeys = getAccessKeys({ accountId: args.accountId });

  const authorizedApps: AccountAuthorizedApp[] = [];

  for (let i = 0; i < accessKeys.length; i++) {
    const key = accessKeys[i];
    if (key.accessKey.permission.isFullAccess === true) continue;
    const permission = key.accessKey.permission;
    const allowance: BigInt =
      permission.allowance !== null ? permission.allowance! : BigInt.ZERO;
    const contractId: string =
      permission.receiverId !== null ? permission.receiverId! : "";

    const app: AccountAuthorizedApp = {
      contractId: contractId,
      amount: allowance.toString(),
      publicKey: key.publicKey,
    };
    authorizedApps.push(app);
  }

  return authorizedApps;
}

export function getAccessKeys(args: Args_getAccessKeys): AccessKeyInfo[] {
  // prepare params
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_access_key_list");
  encoder.setString("account_id", args.accountId);
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = <JSON.Obj>provider.sendJsonRpc("query", params);

  const keys = result.getArr("keys")!.valueOf();
  const accessKeysInfo: AccessKeyInfo[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key: JSON.Obj = <JSON.Obj>keys[i];
    const accessKeyInfo: AccessKeyInfo = toAccessKeyInfo(key);
    accessKeysInfo.push(accessKeyInfo);
  }
  return accessKeysInfo;
}

export function viewFunction(args: Args_viewFunction): JSON.Obj {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.viewFunction(args.contractId, args.methodName, args.args);
}
