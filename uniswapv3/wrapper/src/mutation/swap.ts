import {
  ChainId,
  Ethereum_Mutation,
  Ethereum_TxResponse,
  GasOptions,
  getChainIdKey,
  Input_approve,
  Input_execCall,
  Input_execPool,
  Input_execSwap,
  Input_pool,
  Input_swap,
  MethodParameters,
  Pool,
  Trade,
  TradeType,
} from "./w3";
import {
  createCallParameters,
  createPool,
  fetchPoolFromTokens,
  swapCallParameters,
  toHex,
  bestTradeExactIn,
  bestTradeExactOut,
  getSqrtRatioAtTick,
} from "../query";
import {
  MAX_UINT_256,
  ROUTER_ADDRESS,
  FACTORY_ADDRESS,
} from "../utils/constants";

import { BigInt, Nullable } from "@web3api/wasm-as";

export function swap(input: Input_swap): Ethereum_TxResponse {
  const pool: Pool = fetchPoolFromTokens({
    tokenA: input.tokenIn,
    tokenB: input.tokenOut,
    fee: input?.feeAmount,
    fetchTicks: true,
  });

  let trade: Trade;
  if (input.tradeType == TradeType.EXACT_INPUT) {
    trade = bestTradeExactIn({
      pools: [pool],
      amountIn: {
        token: input.tokenIn,
        amount: input.amount,
      },
      tokenOut: input.tokenOut,
      options: null,
    })[0];
  } else {
    trade = bestTradeExactOut({
      pools: [pool],
      amountOut: {
        token: input.tokenOut,
        amount: input.amount,
      },
      tokenIn: input.tokenIn,
      options: null,
    })[0];
  }

  return execSwap({
    trades: [trade],
    swapOptions: input.swapOptions,
    gasOptions: input.gasOptions,
  });
}

export function execSwap(input: Input_execSwap): Ethereum_TxResponse {
  const swapParameters: MethodParameters = swapCallParameters({
    trades: input.trades,
    options: input.swapOptions,
  });
  return execCall({
    parameters: swapParameters,
    address: ROUTER_ADDRESS,
    chainId: input.trades[0].inputAmount.token.chainId,
    gasOptions: input.gasOptions,
  });
}

export function pool(input: Input_pool): Ethereum_TxResponse {
  const pool: Pool = createPool({
    tokenA: input.tokenA,
    tokenB: input.tokenB,
    fee: input.feeAmount,
    sqrtRatioX96: getSqrtRatioAtTick({ tick: 0 }),
    liquidity: BigInt.ZERO,
    tickCurrent: 0,
    ticks: null,
  });
  return execPool({
    pool: pool,
    gasOptions: input.gasOptions,
  });
}

export function execPool(input: Input_execPool): Ethereum_TxResponse {
  const createPoolParams: MethodParameters = createCallParameters({
    pool: input.pool,
  });
  return execCall({
    parameters: createPoolParams,
    address: FACTORY_ADDRESS,
    chainId: input.pool.token0.chainId,
    gasOptions: input.gasOptions,
  });
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
      nonce: Nullable.fromNull<u32>(),
      gasLimit: gasOptions.gasLimit,
      gasPrice: gasOptions.gasPrice,
      data: methodParameters.calldata,
      value: BigInt.fromString(methodParameters.value),
      chainId: Nullable.fromNull<u32>(),
      type: Nullable.fromNull<u32>(),
    },
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
}

export function approve(input: Input_approve): Ethereum_TxResponse {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const amount: BigInt = input.amount === null ? MAX_UINT_256 : input.amount!;
  const gasOptions: GasOptions = input.gasOptions;

  return Ethereum_Mutation.callContractMethod({
    address: input.token.address,
    method:
      "function approve(address spender, uint value) external returns (bool)",
    args: [ROUTER_ADDRESS, toHex({ value: amount })],
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
}
