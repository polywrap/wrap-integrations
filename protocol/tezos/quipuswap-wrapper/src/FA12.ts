import { Tezos_Connection, Tezos_Module, Tezos_TransferParams } from "./wrap";

import { JSON, BigInt } from "@polywrap/wasm-as";

export function generateFA12AllowOperationArg(operator: string, amount: BigInt): string {
  return `["${operator}", ${amount}]`;
}

export class FA12 {
  address: string;

  constructor(contractAddress: string) {
    this.address =  contractAddress;
  }
  
  static parse(token: JSON.Value): FA12 {
    if (token.isNull && !token.isString) {
      throw new Error(`value '${token.stringify()}' is not a valid FA2 Token`);
    }
    return new FA12(token.toString());
  }

  generateAddOperation(connection: Tezos_Connection, operator: string, amount: BigInt): Tezos_TransferParams {
    return Tezos_Module.getContractCallTransferParams({
      address: this.address,
      method: "approve",
      args: generateFA12AllowOperationArg(operator, amount),
      params: null,
      connection: connection
    }).unwrap();
  }

  generateRemoveOperation(connection: Tezos_Connection, operator: string): Tezos_TransferParams {
    const amount = BigInt.fromUInt32(0);
    return Tezos_Module.getContractCallTransferParams({
      address: this.address,
      method: "approve",
      args: generateFA12AllowOperationArg(operator, amount),
      params: null,
      connection: connection
    }).unwrap();
  }
}