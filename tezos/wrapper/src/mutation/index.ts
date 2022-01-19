import {
  Tezos_Mutation,
  Tezos_TxOperation,
  Input_callContractMethod,
  Input_callContractMethodAndConfirmation,
  Tezos_CallContractMethodConfirmationResponse,
  Input_signMessage,
  Tezos_SignResult,
  Input_transfer,
  Tezos_TransferConfirmation,
  Input_transferAndConfirm,
  Input_originate,
  Input_originateAndConfirm,
  Tezos_OriginationResponse,
  Tezos_OriginationConfirmationResponse
} from "./w3";

export function callContractMethod(input: Input_callContractMethod): Tezos_TxOperation {
  return Tezos_Mutation.callContractMethod({
    address: input.address,
    method: input.method,
    args: input.args,
    connection: input.connection
  })
}

export function callContractMethodAndConfirmation(input: Input_callContractMethodAndConfirmation): Tezos_CallContractMethodConfirmationResponse {
  return Tezos_Mutation.callContractMethodAndConfirmation({
    address: input.address,
    method: input.method,
    args: input.args,
    connection: input.connection,
    confirmations: input.confirmations,
    interval: input.interval,
    timeout: input.timeout
  })
}

export function signMessage(input: Input_signMessage): Tezos_SignResult {
  return Tezos_Mutation.signMessage({
    message: input.message,
    connection: input.connection
  })
}

export function transfer(input: Input_transfer): string {
  return Tezos_Mutation.transfer({
    connection: input.connection,
    params: input.params
  })
}

export function transferAndConfirm(input: Input_transferAndConfirm): Tezos_TransferConfirmation {
  return Tezos_Mutation.transferAndConfirm({
    connection: input.connection,
    params: input.params,
    confirmations: input.confirmations
  })
}

export function originate(input: Input_originate): Tezos_OriginationResponse {
  return Tezos_Mutation.originate({
    connection: input.connection,
    params: input.params
  })
}

export function originateAndConfirm(input: Input_originateAndConfirm): Tezos_OriginationConfirmationResponse {
  return Tezos_Mutation.originateAndConfirm({
    connection: input.connection,
    params: input.params,
    confirmations: input.confirmations,
    interval: input.interval,
    timeout: input.timeout
  })
}