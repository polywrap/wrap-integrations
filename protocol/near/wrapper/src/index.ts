import {
  BlockResult,
  EpochValidatorInfo,
  Args_accountChanges,
  Args_getAccountState,
  Args_createTransaction,
  Args_requestSignIn,
  Args_findAccessKey,
  Args_signTransaction,
  Args_getPublicKey,
  Args_getBlock,
  Near_PublicKey,
  Near_Module,
  Near_Transaction,
  Near_SignTransactionResult,
  Near_FinalExecutionOutcome,
  AccessKeyInfo,
  AccessKey,
  AccountView,
  ChangeResult,
  Args_accessKeyChanges,
  Args_getAccountBalance,
  Args_txStatus,
  Args_txStatusReceipts,
  Args_blockChanges,
  Args_singleAccessKeyChanges,
  Args_contractCodeChanges,
  Args_contractStateChanges,
  Args_lightClientProof,
  Args_validators,
  Args_experimental_protocolConfig,
  Args_parseNearAmount,
  Args_formatNearAmount,
  AccountBalance,
  NodeStatusResult,
  Near_FinalExecutionOutcomeWithReceipts,
  ChunkResult,
  BlockChangeResult,
  LightClientProof,
  NearProtocolConfig,
  KeyValuePair,
  Args_viewContractState,
  ContractStateResult,
  ViewContractCode,
  Args_chunk,
  Args_gasPrice,
  Args_getAccessKeys,
  Args_getAccountDetails,
  Args_viewFunction,
  Args_viewContractCode,
  AccountAuthorizedApp
} from "./wrap";
import JsonRpcProvider from "./utils/JsonRpcProvider";
import * as bs58 from "as-base58";
import { BigInt, JSON, JSONEncoder } from "@polywrap/wasm-as";
import { publicKeyFromStr, publicKeyToStr } from "./utils/typeUtils";
import {
  toAccessKey,
  toAccessKeyInfo,
  toBlockChanges,
  toChangeResult,
  toChunkResult,
  toContractStateResult,
  toEpochValidatorInfo,
  toFinalExecutionOutcome,
  toFinalExecutionOutcomeWithReceipts,
  toLightClientProof,
  toNodeStatus,
} from "./utils/jsonMap";
import * as formatUtils from "./utils/format";

export function requestSignIn(input: Args_requestSignIn): boolean {
  return Near_Module.requestSignIn({
    contractId: input.contractId,
    methodNames: input.methodNames,
    successUrl: input.successUrl,
    failureUrl: input.failureUrl,
  }).unwrap();
}

export function signOut(): boolean {
  return Near_Module.signOut({}).unwrap();
}

export function isSignedIn(): boolean {
  return Near_Module.isSignedIn({}).unwrap();
}

export function getAccountId(): string | null {
  return Near_Module.getAccountId({}).unwrap();
}

export function getBlock(input: Args_getBlock): BlockResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.block(input.blockQuery);
}

export function getAccountState(input: Args_getAccountState): AccountView {
  // prepare params
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_account");
  encoder.setString("account_id", input.accountId);
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = provider.sendJsonRpc("query", params);
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
  input: Args_viewContractState
): ContractStateResult {
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_state");
  // encoder.setString("account_id", '');
  if (input.blockQuery.block_id != null) {
    encoder.setString("block_id", input.blockQuery.block_id!);
  }
  if (input.blockQuery.finality != null) {
    encoder.setString("finality", input.blockQuery.finality!);
  }
  encoder.setString("account_id", input.accountId);
  encoder.setString("prefix_base64", "");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = provider.sendJsonRpc("query", params);
  return toContractStateResult(result);
}

export function viewContractCode(
  input: Args_viewContractCode
): ViewContractCode {
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_code");
  encoder.setString("account_id", input.accountId);
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = provider.sendJsonRpc("query", params);
  return {
    code_base64: result.getString("code_base64")!.valueOf(),
    hash: result.getString("hash")!.valueOf(),
    block_height: BigInt.fromString(
      result.getValue("block_height")!.stringify()
    ),
    block_hash: result.getString("block_hash")!.valueOf(),
  };
}

export function findAccessKey(
  input: Args_findAccessKey
): AccessKeyInfo | null {
  // get public key
  const publicKey: Near_PublicKey | null = getPublicKey({
    accountId: input.accountId,
  });
  if (publicKey == null) {
    return null;
  }
  // prepare params
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_access_key");
  encoder.setString("account_id", input.accountId);
  encoder.setString("public_key", publicKeyToStr(publicKey));
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = provider.sendJsonRpc("query", params);
  return {
    accessKey: toAccessKey(result),
    publicKey: publicKeyToStr(publicKey),
  };
}

export function getPublicKey(input: Args_getPublicKey): Near_PublicKey | null {
  return Near_Module.getPublicKey({ accountId: input.accountId }).unwrap();
}

export function getAccountBalance(
  input: Args_getAccountBalance
): AccountBalance {
  // prepare params
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_account");
  encoder.setString("account_id", input.accountId);
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = provider.sendJsonRpc("query", params);
  // parse and return result
  const state = getAccountState({ accountId: input.accountId });

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
  input: Args_getAccountDetails
): AccountAuthorizedApp[] {
  const accessKeys = getAccessKeys({ accountId: input.accountId });

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

export function getAccessKeys(input: Args_getAccessKeys): AccessKeyInfo[] {
  // prepare params
  const encoder = new JSONEncoder();
  encoder.pushObject(null);
  encoder.setString("request_type", "view_access_key_list");
  encoder.setString("account_id", input.accountId);
  encoder.setString("finality", "optimistic");
  encoder.popObject();
  const params: JSON.Obj = <JSON.Obj>JSON.parse(encoder.serialize());
  // send rpc
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = provider.sendJsonRpc("query", params);

  const keys = result.getArr("keys")!.valueOf();
  const accessKeysInfo: AccessKeyInfo[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key: JSON.Obj = <JSON.Obj>keys[i];
    const accessKeyInfo: AccessKeyInfo = toAccessKeyInfo(key);
    accessKeysInfo.push(accessKeyInfo);
  }
  return accessKeysInfo;
}

export function viewFunction(input: Args_viewFunction): JSON.Obj {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.viewFunction(input.contractId, input.methodName, input.args);
}

export function createTransaction(
  input: Args_createTransaction
): Near_Transaction {
  if (input.signerId == null) {
    return Near_Module.createTransactionWithWallet({
      receiverId: input.receiverId,
      actions: input.actions,
    }).unwrap();
  }
  const signerId: string = input.signerId!;
  const accessKeyInfo: AccessKeyInfo | null = findAccessKey({
    accountId: signerId,
  });
  if (accessKeyInfo == null) {
    throw new Error(
      `Can not sign transactions for account ${signerId} on requested network, no matching key pair found in signer.`
    );
  }
  const accessKey: AccessKey = accessKeyInfo.accessKey;
  const publicKey = accessKeyInfo.publicKey;
  const block: BlockResult = getBlock({
    blockQuery: {
      finality: "final",
      block_id: null,
      syncCheckpoint: null,
    },
  });
  const blockHash: ArrayBuffer = <ArrayBuffer>(
    bs58.decode(block.header.hash).buffer
  );
  const nonce = accessKey.nonce.addInt(1);
  return {
    signerId: signerId,
    publicKey: publicKeyFromStr(publicKey),
    nonce: nonce,
    receiverId: input.receiverId,
    blockHash: blockHash,
    actions: input.actions,
    hash: null,
  };
}

export function lightClientProof(
  input: Args_lightClientProof
): LightClientProof {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const lightClientProof = provider.lightClientProof(input.request);
  return toLightClientProof(lightClientProof);
}

export function signTransaction(
  input: Args_signTransaction
): Near_SignTransactionResult {
  return Near_Module.signTransaction({
    transaction: input.transaction,
  }).unwrap();
}

export function status(): NodeStatusResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const statusJson = provider.status();
  return toNodeStatus(statusJson);
}

export function txStatus(input: Args_txStatus): Near_FinalExecutionOutcome {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const txStatus = provider.txStatus(input.txHash, input.accountId);
  return toFinalExecutionOutcome(txStatus);
}

export function txStatusReceipts(
  input: Args_txStatusReceipts
): Near_FinalExecutionOutcomeWithReceipts {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const txStatus = provider.txStatusReceipts(input.txHash, input.accountId);
  return toFinalExecutionOutcomeWithReceipts(txStatus);
}

export function chunk(input: Args_chunk): ChunkResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const chunk = provider.getChunk(input.chunkId);
  return toChunkResult(chunk);
}

export function gasPrice(input: Args_gasPrice): BigInt {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  let blockId: string | null = null;
  if (input.blockId !== null) {
    blockId = input.blockId!;
  }
  const gasPrice = provider.gasPrice(blockId);
  return BigInt.fromString(gasPrice.getString("gas_price")!.valueOf());
}

export function accessKeyChanges(input: Args_accessKeyChanges): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const accessKeyChanges = provider.accessKeyChanges(
    input.accountIdArray,
    input.blockQuery
  );
  return toChangeResult(accessKeyChanges);
}

export function accountChanges(input: Args_accountChanges): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const accountChanges = provider.accountChanges(
    input.accountIdArray,
    input.blockQuery
  );
  return toChangeResult(accountChanges);
}

export function blockChanges(input: Args_blockChanges): BlockChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);

  const blockChanges = provider.blockChanges(input.blockQuery);
  return toBlockChanges(blockChanges);
}

export function contractStateChanges(
  input: Args_contractStateChanges
): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);

  const contractStateChanges = provider.contractStateChanges(
    input.accountIdArray,
    input.blockQuery,
    input.keyPrefix!
  );
  return toChangeResult(contractStateChanges);
}

export function contractCodeChanges(
  input: Args_contractCodeChanges
): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);

  const contractCodeChanges = provider.contractCodeChanges(
    input.accountIdArray,
    input.blockQuery
  );
  return toChangeResult(contractCodeChanges);
}

export function singleAccessKeyChanges(
  input: Args_singleAccessKeyChanges
): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const singleAccessKeyChanges = provider.singleAccessKeyChanges(
    input.accessKeyArray,
    input.blockQuery!
  );
  return toChangeResult(singleAccessKeyChanges);
}

export function validators(input: Args_validators): EpochValidatorInfo {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  let blockId: string | null = null;
  if (input.blockId !== null) {
    blockId = input.blockId!;
  }
  const validators = provider.validators(blockId);
  return toEpochValidatorInfo(validators);
}

export function experimental_protocolConfig(
  input: Args_experimental_protocolConfig
): NearProtocolConfig {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.protocolConfig(input.blockReference);
}

export function parseNearAmount(input: Args_parseNearAmount): String {
  return formatUtils.parseNearAmount(input.amount);
}

export function formatNearAmount(input: Args_formatNearAmount): String {
  return formatUtils.formatNearAmount(input.amount);
}
