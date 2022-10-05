import {
  Args_accountChanges,
  ChangeResult,
  Args_accessKeyChanges,
  Args_txStatus,
  Args_txStatusReceipts,
  Args_blockChanges,
  Args_singleAccessKeyChanges,
  Args_contractCodeChanges,
  Args_contractStateChanges,
  Args_lightClientProof,
  Args_experimental_protocolConfig,
  NodeStatusResult,
  FinalExecutionOutcomeWithReceipts,
  ChunkResult,
  BlockChangeResult,
  LightClientProof,
  NearProtocolConfig,
  Args_chunk,
  Args_gasPrice,
  Args_status,
  Interface_FinalExecutionOutcome,
  Args_validators,
  EpochValidatorInfo,
  Args_sendJsonRpc,
} from "../wrap";
import JsonRpcProvider from "../utils/JsonRpcProvider";

import { BigInt, JSON } from "@polywrap/wasm-as";

import {
  toBlockChanges,
  toChangeResult,
  toChunkResult,
  toEpochValidatorInfo,
  toFinalExecutionOutcome,
  toFinalExecutionOutcomeWithReceipts,
  toLightClientProof,
  toNodeStatus,
} from "../utils/jsonMap";

export function lightClientProof(
  args: Args_lightClientProof
): LightClientProof {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const lightClientProof = provider.lightClientProof(args.request);
  return toLightClientProof(lightClientProof);
}

export function status(args: Args_status): NodeStatusResult {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const statusJson = provider.status();
  return toNodeStatus(statusJson);
}

export function txStatus(args: Args_txStatus): Interface_FinalExecutionOutcome {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const txStatus = provider.txStatus(args.txHash, args.accountId);
  return toFinalExecutionOutcome(txStatus);
}

export function txStatusReceipts(
  args: Args_txStatusReceipts
): FinalExecutionOutcomeWithReceipts {
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

export function experimental_protocolConfig(
  args: Args_experimental_protocolConfig
): NearProtocolConfig {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return provider.protocolConfig(args.blockReference);
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

export function sendJsonRpc(args: Args_sendJsonRpc): JSON.Obj {
  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  return <JSON.Obj>provider.sendJsonRpc(args.method, args.params as JSON.Obj);
}