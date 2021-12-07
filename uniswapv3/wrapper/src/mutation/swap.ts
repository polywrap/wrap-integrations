/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UNISWAP_ROUTER_CONTRACT } from "../utils/constants";
import { SwapParameters } from "../__tests__/e2e/types";
import {
  Ethereum_TxResponse,
  Input_swap,
  Input_createPool,
  Input_execSwap,
  Input_execCall,
  PoolArgs,
  Pool,
  Input_withdraw,
  MethodParameters,
  ChainId,
  GasOptions,
  Input_approve,
  Ethereum_Mutation,
  getChainIdKey,
  // Input_execCallWithdraw
} from "./w3";
import {
  toHex,
} from "../query";


import { BigInt } from "@web3api/wasm-as";

const MAX_UINT_256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  
// export function exec(input: Input_exec): Ethereum_TxResponse {
//   // we need the router query to finish this
//   const methodParameters: MethodParameters = swapCallParameters({
//     trade: input.trade,
//     tradeOptions: input.tradeOptions,
//   });
//   return execCall({
//     parameters: MethodParameters,
//     chainId: input.trade.inputAmount.token.chainId,
//     txOverrides: input.txOverrides,
//   });
// }




// export function execCall(input: Input_execCall): Ethereum_TxResponse {
//   const methodParameters: MethodParameters = input.parameters;
//   const chainId: ChainId = input.chainId;
//   const txOverrides: TxOverrides =
//     input.txOverrides === null
//       ? { gasLimit: null, gasPrice: null }
//       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//       : input.txOverrides!;

//   const txResponse: Ethereum_TxResponse = Ethereum_Mutation.callContractMethod({
//     address: UNISWAP_ROUTER_CONTRACT,
//     method: getSwapMethodAbi(swapParameters.methodName),
//     args: swapParameters.args,
//     connection: {
//       node: null,
//       networkNameOrChainId: getChainIdKey(chainId),
//     },
//     txOverrides: {
//       value: BigInt.fromString(swapParameters.value.substring(2), 16),
//       gasPrice: txOverrides.gasPrice,
//       gasLimit: txOverrides.gasLimit,
//     },
//   });
  
//   return txResponse;
// }

// export function swap(input: Input_swap): Ethereum_TxResponse {
//   let trade: Trade;
//   const pair: Pair = fetchPairData({
//     token0: input.tokenIn,
//     token1: input.tokenOut,
//   });

//   if (input.tradeType == TradeType.EXACT_INPUT) {
//     trade = bestTradeExactIn({
//       pairs: [pair],
//       amountIn: {
//         token: input.tokenIn,
//         amount: input.amount,
//       },
//       tokenOut: input.tokenOut,
//       options: null,
//     })[0];
//   } else {
//     trade = bestTradeExactOut({
//       pairs: [pair],
//       amountOut: {
//         token: input.tokenOut,
//         amount: input.amount,
//       },
//       tokenIn: input.tokenIn,
//       options: null,
//     })[0];
//   }

//   return exec({
//     trade: trade,
//     tradeOptions: input.tradeOptions,
//     txOverrides: input.txOverrides,
//   });
// }

export function approve(input: Input_approve): Ethereum_TxResponse {
  const amount: BigInt =
    input.amount === null ? BigInt.fromString(MAX_UINT_256) : input.amount!;
  const gasOptions: GasOptions =
    input.gasOptions === null
      ? { gasLimit: null, gasPrice: null }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      : input.gasOptions!;

  const txResponse: Ethereum_TxResponse = Ethereum_Mutation.callContractMethod({
    address: input.token.address,
    method:
      "function approve(address spender, uint value) external returns (bool)",
    args: [UNISWAP_ROUTER_CONTRACT, toHex(amount)],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(input.token.chainId),
    },
    txOverrides: {
      value: null,
      gasPrice: gasOptions.gasPrice,
      gasLimit: gasOptions.gasLimit,
    },
  });
  return txResponse;
}
