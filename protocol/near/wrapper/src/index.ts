import {
  BlockResult,
  EpochValidatorInfo,
  Args_accountChanges,
  Args_getAccountState,
  Args_createTransaction,
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
  Args_viewContractState,
  ContractStateResult,
  ViewContractCode,
  Args_chunk,
  Args_gasPrice,
  Args_getAccessKeys,
  Args_getAccountDetails,
  Args_viewFunction,
  Args_viewContractCode,
  AccountAuthorizedApp,
  Near_AccessKey,
  Near_Action,
  Args_sendMoney,
  Args_signAndSendTransactionAsync,
  Args_deleteKey,
  Args_createAndDeployContract,
  Args_signAndSendTransaction,
  Args_createAccount,
  Args_deployContract,
  Args_functionCall,
  Args_addKey,
  Args_deleteAccount,
  Args_status
} from "./wrap";
import {
  Args_requestSignIn,
  Args_isSignedIn,
  Args_getAccountId,
  Args_signOut
} from "./wrap/imported/Near_Module/serialization"
import JsonRpcProvider from "./utils/JsonRpcProvider";
import * as bs58 from "as-base58";
import { BigInt, JSON, JSONEncoder } from "@polywrap/wasm-as";
import {fullAccessKey, functionCallAccessKey, publicKeyFromStr, publicKeyToStr} from "./utils/typeUtils";
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
import * as action from "./utils/actionCreators"

import {
  Args_requestSignTransactions,
  Args_sendJsonRpc,
  Args_sendTransaction,
  Args_sendTransactionAsync
} from "./wrap/imported/Near_Module/serialization";

export function requestSignIn(args: Args_requestSignIn): boolean {
  return Near_Module.requestSignIn({
    contractId: args.contractId,
    methodNames: args.methodNames,
    successUrl: args.successUrl,
    failureUrl: args.failureUrl,
  }).unwrap();
}

export function signOut(args: Args_signOut): boolean {
  return Near_Module.signOut(args).unwrap();
}

export function isSignedIn(args: Args_isSignedIn): boolean {
  return Near_Module.isSignedIn(args).unwrap();
}

export function getAccountId(args: Args_getAccountId): string | null {
  return Near_Module.getAccountId(args).unwrap();
}

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
  const result: JSON.Obj = provider.sendJsonRpc("query", params);
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
  args: Args_findAccessKey
): AccessKeyInfo | null {
  // get public key
  const publicKey: Near_PublicKey | null = getPublicKey({
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
  const result: JSON.Obj = provider.sendJsonRpc("query", params);
  return {
    accessKey: toAccessKey(result),
    publicKey: publicKeyToStr(publicKey),
  };
}

export function getPublicKey(args: Args_getPublicKey): Near_PublicKey | null {
  return Near_Module.getPublicKey({ accountId: args.accountId }).unwrap();
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
  const result: JSON.Obj = provider.sendJsonRpc("query", params);
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

export function viewFunction(args: Args_viewFunction): JSON.Obj {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.viewFunction(args.contractId, args.methodName, args.args);
}

export function createTransaction(
  args: Args_createTransaction
): Near_Transaction {
  if (args.signerId == null) {
    return Near_Module.createTransactionWithWallet({
      receiverId: args.receiverId,
      actions: args.actions,
    }).unwrap();
  }
  const signerId: string = args.signerId!;
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
    receiverId: args.receiverId,
    blockHash: blockHash,
    actions: args.actions,
    hash: null,
  };
}

export function lightClientProof(
  args: Args_lightClientProof
): LightClientProof {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const lightClientProof = provider.lightClientProof(args.request);
  return toLightClientProof(lightClientProof);
}

export function signTransaction(
  args: Args_signTransaction
): Near_SignTransactionResult {
  return Near_Module.signTransaction({
    transaction: args.transaction,
  }).unwrap();
}

export function status(args: Args_status): NodeStatusResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const statusJson = provider.status();
  return toNodeStatus(statusJson);
}

export function txStatus(args: Args_txStatus): Near_FinalExecutionOutcome {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const txStatus = provider.txStatus(args.txHash, args.accountId);
  return toFinalExecutionOutcome(txStatus);
}

export function txStatusReceipts(
  args: Args_txStatusReceipts
): Near_FinalExecutionOutcomeWithReceipts {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const txStatus = provider.txStatusReceipts(args.txHash, args.accountId);
  return toFinalExecutionOutcomeWithReceipts(txStatus);
}

export function chunk(args: Args_chunk): ChunkResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const chunk = provider.getChunk(args.chunkId);
  return toChunkResult(chunk);
}

export function gasPrice(args: Args_gasPrice): BigInt {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  let blockId: string | null = null;
  if (args.blockId !== null) {
    blockId = args.blockId!;
  }
  const gasPrice = provider.gasPrice(blockId);
  return BigInt.fromString(gasPrice.getString("gas_price")!.valueOf());
}

export function accessKeyChanges(args: Args_accessKeyChanges): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const accessKeyChanges = provider.accessKeyChanges(
    args.accountIdArray,
    args.blockQuery
  );
  return toChangeResult(accessKeyChanges);
}

export function accountChanges(args: Args_accountChanges): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const accountChanges = provider.accountChanges(
    args.accountIdArray,
    args.blockQuery
  );
  return toChangeResult(accountChanges);
}

export function blockChanges(args: Args_blockChanges): BlockChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);

  const blockChanges = provider.blockChanges(args.blockQuery);
  return toBlockChanges(blockChanges);
}

export function contractStateChanges(
  args: Args_contractStateChanges
): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);

  const contractStateChanges = provider.contractStateChanges(
    args.accountIdArray,
    args.blockQuery,
    args.keyPrefix!
  );
  return toChangeResult(contractStateChanges);
}

export function contractCodeChanges(
  args: Args_contractCodeChanges
): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);

  const contractCodeChanges = provider.contractCodeChanges(
    args.accountIdArray,
    args.blockQuery
  );
  return toChangeResult(contractCodeChanges);
}

export function singleAccessKeyChanges(
  args: Args_singleAccessKeyChanges
): ChangeResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const singleAccessKeyChanges = provider.singleAccessKeyChanges(
    args.accessKeyArray,
    args.blockQuery!
  );
  return toChangeResult(singleAccessKeyChanges);
}

export function validators(args: Args_validators): EpochValidatorInfo {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  let blockId: string | null = null;
  if (args.blockId !== null) {
    blockId = args.blockId!;
  }
  const validators = provider.validators(blockId);
  return toEpochValidatorInfo(validators);
}

export function experimental_protocolConfig(
  args: Args_experimental_protocolConfig
): NearProtocolConfig {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.protocolConfig(args.blockReference);
}

export function parseNearAmount(args: Args_parseNearAmount): String {
  return formatUtils.parseNearAmount(args.amount);
}

export function formatNearAmount(args: Args_formatNearAmount): String {
  return formatUtils.formatNearAmount(args.amount);
}



export function sendJsonRpc(args: Args_sendJsonRpc): JSON.Obj {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.sendJsonRpc(args.method, args.params as JSON.Obj);
}

export function requestSignTransactions(args: Args_requestSignTransactions): boolean {
  return Near_Module.requestSignTransactions({
    transactions: args.transactions,
    callbackUrl: args.callbackUrl,
    meta: args.meta,
  }).unwrap();
}

export function sendTransaction(args: Args_sendTransaction): Near_FinalExecutionOutcome {
  return Near_Module.sendTransaction({ signedTx: args.signedTx }).unwrap();
}

export function sendTransactionAsync(args: Args_sendTransactionAsync): string {
  return Near_Module.sendTransactionAsync({ signedTx: args.signedTx }).unwrap();
}

export function signAndSendTransaction(args: Args_signAndSendTransaction): Near_FinalExecutionOutcome {
  const transaction: Near_Transaction = createTransaction({
    receiverId: args.receiverId,
    actions: args.actions,
    signerId: args.signerId,
  });
  const signedTxResult: Near_SignTransactionResult = signTransaction({ transaction: transaction });
  return sendTransaction({ signedTx: signedTxResult.signedTx });
}

export function signAndSendTransactionAsync(args: Args_signAndSendTransactionAsync): string {
  const transaction: Near_Transaction = createTransaction({
    receiverId: args.receiverId,
    actions: args.actions,
    signerId: args.signerId,
  });
  const signedTxResult: Near_SignTransactionResult = signTransaction({ transaction: transaction });
  return sendTransactionAsync({ signedTx: signedTxResult.signedTx });
}

export function addKey(args: Args_addKey): Near_FinalExecutionOutcome {
  // https://github.com/near/near-api-js/blob/e29a41812ac79579cc12b051f8ef04d2f3606a75/src/account.ts#L445
  let methodNames: string[] = [];
  if (args.methodNames !== null) {
    methodNames = <string[]>args.methodNames;
  }
  let accessKey: Near_AccessKey;
  if (args.contractId !== null && args.amount !== null) {
    accessKey = functionCallAccessKey(<string>args.contractId, methodNames, <BigInt>args.amount);
  } else {
    accessKey = fullAccessKey();
  }
  return signAndSendTransaction({
    receiverId: args.signerId,
    signerId: args.signerId,
    actions: [{ publicKey: args.publicKey, accessKey: accessKey } as Near_Action],
  });
}

export function createAccount(args: Args_createAccount): Near_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.newAccountId,
    signerId: args.signerId,
    actions: [action.createAccount(), action.transfer(args.amount), action.addKey(args.publicKey, fullAccessKey())],
  });
}

export function deleteAccount(args: Args_deleteAccount): Near_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.accountId,
    signerId: args.signerId,
    actions: [action.deleteAccount(args.beneficiaryId)],
  });
}

export function deployContract(args: Args_deployContract): Near_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.contractId,
    signerId: args.signerId,
    actions: [action.deployContract(args.data)],
  });
}

export function sendMoney(args: Args_sendMoney): Near_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.receiverId,
    signerId: args.signerId,
    actions: [action.transfer(args.amount)],
  });
}

export function functionCall(args: Args_functionCall): Near_FinalExecutionOutcome {
  const actions = [action.functionCall(args.methodName, args.args, args.gas, args.deposit)];
  if (args.signerId !== null) {
    return signAndSendTransaction({ receiverId: args.contractId, signerId: args.signerId!, actions: actions });
  }
  const transaction = createTransaction({
    receiverId: args.contractId,
    actions: actions,
  } as Args_createTransaction);

  const signedTxResult: Near_SignTransactionResult = signTransaction({ transaction: transaction });
  return sendTransaction({ signedTx: signedTxResult.signedTx });
}

export function deleteKey(args: Args_deleteKey): Near_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.signerId,
    signerId: args.signerId,
    actions: [action.deleteKey(args.publicKey)],
  });
}

export function createAndDeployContract(args: Args_createAndDeployContract): Near_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.contractId,
    signerId: args.signerId,
    actions: [
      action.createAccount(),
      action.transfer(args.amount),
      action.addKey(args.publicKey, fullAccessKey()),
      action.deployContract(args.data),
    ],
  });
}


