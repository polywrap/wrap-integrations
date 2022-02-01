import {
  ChainId,
  Ethereum_Mutation,
  Ethereum_TxResponse,
  FeeAmount,
  GasOptions,
  getChainIdKey,
  Input_approve,
  Input_execCall,
  Input_execPool,
  Input_execSwap,
  Input_pool,
  Input_swap,
  Input_swapWithTokens,
  MethodParameters,
  Pool,
  SwapOptions,
  Token,
  TokenAmount,
  Trade,
  TradeType,
} from "./w3";
import {
  createCallParameters,
  createPool,
  fetchPoolFromTokens,
  swapCallParameters,
  toHex,
  getSqrtRatioAtTick,
  createTradeExactIn,
  createRoute,
  createTradeExactOut,
  fetchPoolFromAddress,
  tokenEquals,
  poolChainId,
} from "../query";
import {
  MAX_UINT_256,
  ROUTER_ADDRESS,
  FACTORY_ADDRESS,
} from "../utils/constants";

import { BigInt, Nullable } from "@web3api/wasm-as";

export function swapWithTokens(
  input: Input_swapWithTokens
): Ethereum_TxResponse {
  const tokenIn: Token = input.tokenIn;
  const tokenOut: Token = input.tokenOut;
  const amount: BigInt = input.amount;
  const tradeType: TradeType = input.tradeType;
  const feeAmount: FeeAmount = input.feeAmount;
  const swapOptions: SwapOptions = input.swapOptions;
  const gasOptions: GasOptions | null = input.gasOptions;

  const pool: Pool = fetchPoolFromTokens({
    tokenA: tokenIn,
    tokenB: tokenOut,
    fee: feeAmount,
    fetchTicks: true,
  });

  let trade: Trade;
  if (tradeType == TradeType.EXACT_INPUT) {
    trade = createTradeExactIn({
      tradeRoute: {
        route: createRoute({
          pools: [pool],
          inToken: tokenIn,
          outToken: tokenOut,
        }),
        amount: {
          token: tokenIn,
          amount: amount,
        },
      },
    });
  } else {
    trade = createTradeExactOut({
      tradeRoute: {
        route: createRoute({
          pools: [pool],
          inToken: tokenIn,
          outToken: tokenOut,
        }),
        amount: {
          token: tokenOut,
          amount: amount,
        },
      },
    });
  }

  return execSwap({
    trades: [trade],
    swapOptions: swapOptions,
    gasOptions: gasOptions,
  });
}

export function swap(input: Input_swap): Ethereum_TxResponse {
  const address: string = input.address;
  const amount: TokenAmount = input.amount;
  const tradeType: TradeType = input.tradeType;
  const swapOptions: SwapOptions = input.swapOptions;
  const gasOptions: GasOptions | null = input.gasOptions;

  const pool: Pool = fetchPoolFromAddress({
    chainId: amount.token.chainId,
    address: address,
    fetchTicks: true,
  });
  const dependentToken = tokenEquals({
    tokenA: amount.token,
    tokenB: pool.token0,
  })
    ? pool.token1
    : pool.token0;

  let trade: Trade;
  if (tradeType == TradeType.EXACT_INPUT) {
    trade = createTradeExactIn({
      tradeRoute: {
        route: createRoute({
          pools: [pool],
          inToken: amount.token,
          outToken: dependentToken,
        }),
        amount,
      },
    });
  } else {
    trade = createTradeExactOut({
      tradeRoute: {
        route: createRoute({
          pools: [pool],
          inToken: dependentToken,
          outToken: amount.token,
        }),
        amount,
      },
    });
  }

  return execSwap({
    trades: [trade],
    swapOptions: swapOptions,
    gasOptions: gasOptions,
  });
}

export function execSwap(input: Input_execSwap): Ethereum_TxResponse {
  const trades: Trade[] = input.trades;
  const swapOptions: SwapOptions = input.swapOptions;
  const gasOptions: GasOptions | null = input.gasOptions;

  const parameters: MethodParameters = swapCallParameters({
    trades,
    options: swapOptions,
  });
  return execCall({
    parameters,
    address: ROUTER_ADDRESS,
    chainId: input.trades[0].inputAmount.token.chainId,
    gasOptions,
  });
}

export function pool(input: Input_pool): Ethereum_TxResponse {
  const tokenA: Token = input.tokenA;
  const tokenB: Token = input.tokenB;
  const fee: FeeAmount = input.feeAmount;
  const gasOptions: GasOptions | null = input.gasOptions;

  const pool: Pool = createPool({
    tokenA,
    tokenB,
    fee,
    sqrtRatioX96: getSqrtRatioAtTick({ tick: 0 }),
    liquidity: BigInt.ZERO,
    tickCurrent: 0,
    ticks: null,
  });
  return execPool({ pool, gasOptions });
}

export function execPool(input: Input_execPool): Ethereum_TxResponse {
  const pool: Pool = input.pool;
  const gasOptions: GasOptions | null = input.gasOptions;

  const parameters: MethodParameters = createCallParameters({ pool });
  return execCall({
    parameters,
    address: FACTORY_ADDRESS,
    chainId: poolChainId({ pool }),
    gasOptions,
  });
}

export function execCall(input: Input_execCall): Ethereum_TxResponse {
  const methodParameters: MethodParameters = input.parameters;
  const chainId: ChainId = input.chainId;
  const address: string = input.address;
  const gasOptions: GasOptions | null = input.gasOptions;

  return Ethereum_Mutation.sendTransaction({
    tx: {
      to: address,
      from: null,
      nonce: Nullable.fromNull<u32>(),
      gasLimit: gasOptions === null ? null : gasOptions.gasLimit,
      gasPrice: gasOptions === null ? null : gasOptions.gasPrice,
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
  const gasOptions: GasOptions | null = input.gasOptions;

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
      gasLimit: gasOptions === null ? null : gasOptions.gasLimit,
      gasPrice: gasOptions === null ? null : gasOptions.gasPrice,
    },
  });
}
