/* eslint-disable @typescript-eslint/naming-convention */
import {
  ChainId,
  Ethereum_Module,
  Ethereum_TxResponse,
  GasOptions,
  getChainIdKey,
  Args_approve,
  Args_execCall,
  MethodParameters,
} from "./w3";
import { MAX_UINT_256, ROUTER_ADDRESS } from "../utils/constants";
import { toHex } from "../query";

import { BigInt, Nullable } from "@web3api/wasm-as";

export function execCall(args: Args_execCall): Ethereum_TxResponse {
  const methodParameters: MethodParameters = args.parameters;
  const chainId: ChainId = args.chainId;
  const address: string = args.address;
  const gasOptions: GasOptions | null = args.gasOptions;

  return Ethereum_Module.sendTransaction({
    tx: {
      to: address,
      m_from: null,
      nonce: Nullable.fromNull<u32>(),
      gasLimit: gasOptions === null ? null : gasOptions.gasLimit,
      gasPrice: gasOptions === null ? null : gasOptions.gasPrice,
      data: methodParameters.calldata,
      value: BigInt.fromString(methodParameters.value, 16),
      chainId: null,
      m_type: Nullable.fromNull<u32>(),
    },
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  }).unwrap();
}

export function approve(args: Args_approve): Ethereum_TxResponse {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const amount: BigInt = args.amount === null ? MAX_UINT_256 : args.amount!;
  const gasOptions: GasOptions | null = args.gasOptions;

  return Ethereum_Module.callContractMethod({
    address: args.token.address,
    method:
      "function approve(address spender, uint value) external returns (bool)",
    args: [ROUTER_ADDRESS, toHex({ value: amount })],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(args.token.chainId),
    },
    txOverrides: {
      value: null,
      gasLimit: gasOptions === null ? null : gasOptions.gasLimit,
      gasPrice: gasOptions === null ? null : gasOptions.gasPrice,
    },
  }).unwrap();
}
