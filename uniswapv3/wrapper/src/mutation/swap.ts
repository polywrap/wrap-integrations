import {
  Input_placeholder,
  Ethereum_TxResponse,
  Input_swap,
  Input_execCall,
  Input_pool,
  MethodParameters,
  ChainId,
  GasOptions,
  Input_approve,
  Ethereum_Mutation,
  getChainIdKey,
  Input_exec,
  Token,
  TickListDataProvider,
  Trade
} from "./w3";
import { BigInt } from "@web3api/wasm-as";
import { createCallParameters } from "../query/nonfungiblePositionManager";
import { createPool } from "../query/pool";
import { fetchToken } from "../query";


export function swap(input: Input_swap): Ethereum_TxResponse {
let trade: Trade;
const token: Token = fetchToken({
   token0: input.tokenIn,
   token1: input.tokenOut
  });
  return execSwap({
    trade: trade,
    swapOptions: input.swapOptions,
    gasOptions: input.gasOptions,
  })

}

function execSwap(input: Input_exec): Ethereum_TxRespinse {
 const swapParameters: SwapParameters = input.parameters;
return execCall({
     parameters: swapParameters,
     chainId: input.trade.inputAmount.token.chainId,
     gasOption: input.gasOptions,
})
}


export function pool(input: Input_pool): Ethereum_TxResponse {
const Tokens: Pool = createPool(
  tokenA = input.tokenA,
  tokenB = input.tokenB,
  gas = input.gasOptions.gasLimit | null,
  gasPrice =  input.gasOptions.gasPrice | null,
)
  return execPool({
    token: Tokens,
    trade: null,
    swapOptions: null,
    gasOptions: input.gasOptions,
  });
}


export function execPool(input: Input_exec): Ethereum_TxResponse {
  const createPoolParams: MethodParameters = createCallParameters({
   
  })
  return execCall({
    parameters: createPoolParams,
    chainId: input.tokenA?.chainId,
    gasOptions: input.gasOptions,
  })
}


export function execCall(input: Input_execCall): Ethereum_TxResponse {
  const methodParameters: MethodParameters = input.parameters;
  const chainId: ChainId = input.chainId;
  const address: string = input.address;
  const gasOptions: GasOptions = input.gasOptions;

  return Ethereum_Mutation.sendTransaction({
    tx: {
      to: address,
      from: null,
      nonce: null as any,
      gasLimit: gasOptions.gasLimit,
      gasPrice: gasOptions.gasPrice,
      data: methodParameters.calldata,
      value: BigInt.fromString(methodParameters.value),
      chainId: null as any,
      type: null as any,
    },
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
}


// export function approve(input: Input_approve): Ethereum_TxResponse {
//   const amount: BigInt =
//   input.amount === null ? BigInt.fromString(MAX_UINT_256) : input.amount!;
//   const gasOptions: GasOptions = input.gasOptions;

//   const txResponse: Ethereum_TxResponse = Ethereum_Mutation.callContractMethod({
//     address: input.token.address as any,
//     method:
//       "function approve(address spender, uint value) external returns (bool)",
//     args: [UNISWAP_ROUTER_CONTRACT, amount as any],
//     connection: {
//       node: null,
//       networkNameOrChainId: getChainIdKey(input.token.chainId),
//     },
//     txOverrides: {
//       value: null,
//       gasPrice: gasOptions.gasPrice,
//       gasLimit: gasOptions.gasLimit,
//     },
//   });
//   return txResponse;
// }


// export function placeholder(input: Input_placeholder): boolean {
//   return input.param;
// }

