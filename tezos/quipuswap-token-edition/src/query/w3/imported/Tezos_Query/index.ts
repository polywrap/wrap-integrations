import {
  w3_subinvoke,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializegetPublicKeyArgs,
  deserializegetPublicKeyResult,
  Input_getPublicKey,
  serializegetPublicKeyHashArgs,
  deserializegetPublicKeyHashResult,
  Input_getPublicKeyHash,
  serializegetRevealEstimateArgs,
  deserializegetRevealEstimateResult,
  Input_getRevealEstimate,
  serializegetTransferEstimateArgs,
  deserializegetTransferEstimateResult,
  Input_getTransferEstimate,
  serializegetOriginateEstimateArgs,
  deserializegetOriginateEstimateResult,
  Input_getOriginateEstimate,
  serializecheckAddressArgs,
  deserializecheckAddressResult,
  Input_checkAddress,
  serializegetBalanceArgs,
  deserializegetBalanceResult,
  Input_getBalance,
  serializegetContractStorageArgs,
  deserializegetContractStorageResult,
  Input_getContractStorage,
  serializeexecuteTzip16ViewArgs,
  deserializeexecuteTzip16ViewResult,
  Input_executeTzip16View,
  serializegetWalletPKHArgs,
  deserializegetWalletPKHResult,
  Input_getWalletPKH,
  serializegetOperationStatusArgs,
  deserializegetOperationStatusResult,
  Input_getOperationStatus,
  serializeencodeMichelsonExpressionToBytesArgs,
  deserializeencodeMichelsonExpressionToBytesResult,
  Input_encodeMichelsonExpressionToBytes
} from "./serialization";
import * as Types from "../..";

export class Tezos_Query {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  public static getPublicKey(input: Input_getPublicKey): string {
    const args = serializegetPublicKeyArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getPublicKey",
      args
    );
    return deserializegetPublicKeyResult(result);
  }

  public static getPublicKeyHash(input: Input_getPublicKeyHash): string {
    const args = serializegetPublicKeyHashArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getPublicKeyHash",
      args
    );
    return deserializegetPublicKeyHashResult(result);
  }

  public static getRevealEstimate(input: Input_getRevealEstimate): Types.Tezos_EstimateResult {
    const args = serializegetRevealEstimateArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getRevealEstimate",
      args
    );
    return deserializegetRevealEstimateResult(result);
  }

  public static getTransferEstimate(input: Input_getTransferEstimate): Types.Tezos_EstimateResult {
    const args = serializegetTransferEstimateArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getTransferEstimate",
      args
    );
    return deserializegetTransferEstimateResult(result);
  }

  public static getOriginateEstimate(input: Input_getOriginateEstimate): Types.Tezos_EstimateResult {
    const args = serializegetOriginateEstimateArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getOriginateEstimate",
      args
    );
    return deserializegetOriginateEstimateResult(result);
  }

  public static checkAddress(input: Input_checkAddress): bool {
    const args = serializecheckAddressArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "checkAddress",
      args
    );
    return deserializecheckAddressResult(result);
  }

  public static getBalance(input: Input_getBalance): string {
    const args = serializegetBalanceArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getBalance",
      args
    );
    return deserializegetBalanceResult(result);
  }

  public static getContractStorage(input: Input_getContractStorage): string {
    const args = serializegetContractStorageArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getContractStorage",
      args
    );
    return deserializegetContractStorageResult(result);
  }

  public static executeTzip16View(input: Input_executeTzip16View): string {
    const args = serializeexecuteTzip16ViewArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "executeTzip16View",
      args
    );
    return deserializeexecuteTzip16ViewResult(result);
  }

  public static getWalletPKH(input: Input_getWalletPKH): string {
    const args = serializegetWalletPKHArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getWalletPKH",
      args
    );
    return deserializegetWalletPKHResult(result);
  }

  public static getOperationStatus(input: Input_getOperationStatus): Types.Tezos_OperationStatus {
    const args = serializegetOperationStatusArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "getOperationStatus",
      args
    );
    return deserializegetOperationStatusResult(result);
  }

  public static encodeMichelsonExpressionToBytes(input: Input_encodeMichelsonExpressionToBytes): string {
    const args = serializeencodeMichelsonExpressionToBytesArgs(input);
    const result = w3_subinvoke(
      "w3://ens/tezos.web3api.eth",
      "query",
      "encodeMichelsonExpressionToBytes",
      args
    );
    return deserializeencodeMichelsonExpressionToBytesResult(result);
  }
}
