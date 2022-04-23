/* eslint-disable @typescript-eslint/naming-convention */
import {
  TxOperation,
  OperationError,
  Estimate,
  RevealParams,
  SendParams,
  OriginateParams,
  SignResult,
  TransferConfirmation,
  Block,
  OriginationOperation,
  OperationStatus,
  TransferParams
} from "./w3";
import * as Taquito from "./taquito-types";
import * as Types from "./types"

import taquito from "@taquito/taquito";
import taquitoRpc, { OpKind } from "@taquito/rpc";

export const toTransferParamsWithTransactionKind = (
  response: TransferParams
): Taquito.TransferParamsWithTransactionKind => ({
  ...fromTransferParams(response),
  kind: OpKind.TRANSACTION
})

export const fromTransferParams = (
  receipt: TransferParams
): Taquito.TransferParams => ({
  to: receipt.to,
  amount: receipt.amount,
  source: receipt.source ? receipt.source : undefined,
  fee: receipt.fee ? receipt.fee : undefined,
  gasLimit: receipt.gasLimit ? receipt.gasLimit : undefined,
  storageLimit: receipt.storageLimit ? receipt.storageLimit : undefined,
  mutez: receipt.mutez ? receipt.mutez : undefined,
  parameter: receipt.parameter ? JSON.parse(receipt.parameter) : undefined,
});

export const toTransferParams = (
  receipt: Taquito.TransferParams
): TransferParams => ({
  to: receipt.to,
  amount: receipt.amount,
  source: receipt.source,
  fee: receipt.fee,
  gasLimit: receipt.gasLimit,
  storageLimit: receipt.storageLimit,
  mutez: receipt.mutez,
  parameter: JSON.stringify(receipt.parameter)
})

export const toOperationStatus = (
  response: Types.OperationStatus
): OperationStatus => ({
  hash: response.hash,
  type: response.type,
  block: response.block,
  time: response.time,
  height: response.hash,
  cycle: response.cycle,
  counter: response.counter,
  status: response.status,
  is_success: response.is_success,
  is_contract: response.is_contract,
  gas_limit: response.gas_limit,
  gas_used: response.gas_used,
  gas_price: response.gas_price,
  storage_limit: response.storage_limit,
  storage_size: response.storage_size,
  storage_paid: response.storage_paid,
  volume: response.volume,
  fee: response.fee,
  days_destroyed: response.days_destroyed,
  sender: response.sender,
  receiver: response.receiver,
  confirmations: response.confirmations
})

export const toOriginationOperation = (
  receipt: taquito.OriginationOperation
): OriginationOperation => ({
  contractAddress: receipt.contractAddress,
  hash: receipt.hash,
  consumedGas: receipt.consumedGas ? receipt.consumedGas : undefined,
  errors: receipt.errors
    ? receipt.errors.map((err) => toOperationError(err))
    : [],
  fee: receipt.fee,
  gasLimit: receipt.gasLimit,
  includedInBlock: receipt.includedInBlock,
  revealStatus: receipt.revealStatus,
  status: receipt.status,
  storageDiff: receipt.storageDiff ? receipt.storageDiff : undefined,
  storageLimit: receipt.storageLimit,
  storageSize: receipt.storageSize ? receipt.storageSize : undefined,
});

export const toTransferConfirmation = (
  receipt: Taquito.TransferConfirmationResponse
): TransferConfirmation => ({
  completed: receipt.completed,
  currentConfirmation: receipt.currentConfirmation,
  expectedConfirmation: receipt.expectedConfirmation,
  block: toBlock(receipt.block),
});

export const toBlock = (receipt: Taquito.BlockResponse): Block => ({
  chainId: receipt.chain_id,
  hash: receipt.hash,
  protocol: receipt.protocol,
});

export const toSignResult = (receipt: Taquito.Sign): SignResult => ({
  bytes: receipt.bytes,
  sig: receipt.sig,
  prefixSig: receipt.prefixSig,
  sbytes: receipt.sbytes,
});

export const toEstimate = (receipt: Taquito.Estimate): Estimate => ({
  burnFeeMutez: receipt.burnFeeMutez,
  gasLimit: receipt.gasLimit,
  minimalFeeMutez: receipt.minimalFeeMutez,
  opSize: receipt.opSize.toString(),
  storageLimit: receipt.storageLimit,
  suggestedFeeMutez: receipt.suggestedFeeMutez,
  totalCost: receipt.totalCost,
  usingBaseFeeMutez: receipt.usingBaseFeeMutez,
  consumedMilligas: receipt.consumedMilligas,
});

export const fromEstimate = (receipt: Estimate): Taquito.Estimate => ({
  burnFeeMutez: receipt.burnFeeMutez,
  gasLimit: receipt.gasLimit,
  minimalFeeMutez: receipt.minimalFeeMutez,
  opSize: receipt.opSize,
  storageLimit: receipt.storageLimit,
  suggestedFeeMutez: receipt.suggestedFeeMutez,
  totalCost: receipt.totalCost,
  usingBaseFeeMutez: receipt.usingBaseFeeMutez,
  consumedMilligas: receipt.consumedMilligas,
});

export const toRevealParams = (
  receipt: Taquito.RevealParams
): RevealParams => ({
  fee: receipt.fee ? receipt.fee : undefined,
  gasLimit: receipt.gasLimit ? receipt.gasLimit : undefined,
  storageLimit: receipt.storageLimit ? receipt.storageLimit : undefined,
});

export const fromRevealParams = (
  receipt: RevealParams
): Taquito.RevealParams => ({
  fee: receipt.fee ? receipt.fee : undefined,
  gasLimit: receipt.gasLimit ? receipt.gasLimit : undefined,
  storageLimit: receipt.storageLimit ? receipt.storageLimit : undefined,
});

export const toSendParams = (
  receipt: Taquito.SendParams
): SendParams => ({
  to: receipt.to,
  amount: receipt.amount,
  source: receipt.source,
  fee: receipt.fee,
  gasLimit: receipt.gasLimit,
  storageLimit: receipt.storageLimit,
  mutez: receipt.mutez,
});

export const fromSendParams = (
  receipt: SendParams
): Taquito.SendParams => ({
  to: receipt.to,
  amount: receipt.amount,
  source: receipt.source ? receipt.source : undefined,
  fee: receipt.fee ? receipt.fee : undefined,
  gasLimit: receipt.gasLimit ? receipt.gasLimit : undefined,
  storageLimit: receipt.storageLimit ? receipt.storageLimit : undefined,
  mutez: receipt.mutez ? receipt.mutez : undefined,
});

export const toOriginateParams = (
  receipt: Taquito.OriginateParams
): OriginateParams => ({
  code: receipt.code,
  storage: receipt.storage,
  balance: receipt.balance,
  delegate: receipt.delegate,
  fee: receipt.fee,
  gasLimit: receipt.gasLimit,
  storageLimit: receipt.storageLimit,
  mutez: receipt.mutez,
});

export const fromOriginateParams = (
  receipt: OriginateParams
): Taquito.OriginateParams => ({
  code: receipt.code,
  storage: receipt.storage,
  balance: receipt.balance ? receipt.balance : undefined,
  delegate: receipt.delegate ? receipt.delegate : undefined,
  fee: receipt.fee ? receipt.fee : undefined,
  gasLimit: receipt.gasLimit ? receipt.gasLimit : undefined,
  storageLimit: receipt.storageLimit ? receipt.storageLimit : undefined,
  mutez: receipt.mutez ? receipt.mutez : undefined,
  init: receipt.init ? receipt.init : undefined,
});

export const toTxOperation = (
  receipt: taquito.TransactionOperation
): TxOperation => ({
  hash: receipt.hash,
  source: receipt.source || "",
  amount: receipt.amount.toString(),
  consumedGas: receipt.consumedGas,
  destination: receipt.destination,
  errors: receipt.errors.map(toOperationError),
  fee: receipt.fee,
  gasLimit: receipt.gasLimit,
  includedInBlock: receipt.includedInBlock.toString(),
  status: receipt.status.toString(),
  storageDiff: receipt.storageDiff,
  storageLimit: receipt.storageLimit,
  storageSize: receipt.storageSize,
});

export const fromTxOperation = (
  receipt: TxOperation
): taquito.TransactionOperation =>
  new taquito.TransactionOperation(
    receipt.hash,
    toRPCTransferOperation(receipt),
    receipt.source as string,
    ({} as unknown) as taquito.ForgedBytes,
    ([] as unknown) as taquitoRpc.OperationContentsAndResult[],
    (undefined as unknown) as taquito.Context
  );

export const toRPCTransferOperation = (
  receipt: TxOperation
): taquito.RPCTransferOperation => ({
  amount: receipt.amount || "",
  destination: receipt.destination,
  fee: receipt.fee,
  gas_limit: receipt.gasLimit,
  kind: taquito.OpKind.TRANSACTION,
  source: receipt.source || "",
  storage_limit: receipt.storageLimit,
});

export const toOperationError = (
  error: taquitoRpc.TezosGenericOperationError
): OperationError => ({
  id: error.id,
  kind: error.kind,
});

export const fromOperationError = (
  error: OperationError
): taquitoRpc.TezosGenericOperationError => ({
  id: error.id,
  kind: error.kind,
});

