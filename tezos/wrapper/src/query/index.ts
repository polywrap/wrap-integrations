import {
  Tezos_Query,
  Input_getPublicKey,
  Input_getPublicKeyHash,
  Input_getRevealEstimate,
  Input_getTransferEstimate,
  Tezos_EstimateResult,
  Input_getOriginateEstimate,
  Input_checkAddress,
  Input_getBalance,
  Input_getContractStorage
} from "./w3";

export function getPublicKey(input: Input_getPublicKey): string {
  return Tezos_Query.getPublicKey({
    connection: input.connection
  });
}

export function getPublicKeyHash(input: Input_getPublicKeyHash): string {
  return Tezos_Query.getPublicKeyHash({
    connection: input.connection
  });
}

export function getRevealEstimate(input: Input_getRevealEstimate): Tezos_EstimateResult {
  return Tezos_Query.getRevealEstimate({
    connection: input.connection,
    params: input.params
  });
}

export function getTransferEstimate(input: Input_getTransferEstimate): Tezos_EstimateResult {
  return Tezos_Query.getTransferEstimate({
    connection: input.connection,
    params: input.params
  });
}

export function getOriginateEstimate(input: Input_getOriginateEstimate): Tezos_EstimateResult {
  return Tezos_Query.getOriginateEstimate({
    connection: input.connection,
    params: input.params
  });
}

export function checkAddress(input: Input_checkAddress): boolean {
  return Tezos_Query.checkAddress({
    connection: input.connection,
    address: input.address
  });
}

export function getBalance(input: Input_getBalance): string {
  return Tezos_Query.getBalance({
    connection: input.connection,
    address: input.address
  });
} 

export function getContractStorage(input: Input_getContractStorage): string {
  return Tezos_Query.getContractStorage({
    connection: input.connection,
    address: input.address,
    key: input.key,
    field: input.field
  });
} 