import { Web3ApiClient } from "@web3api/client-js";
import {
  BigInt,
  FeeAmount,
  FeeAmountEnum,
  FeeOptions,
  Int32, MethodParameters,
  Pool,
  Route, SwapOptions,
  Tick,
  Token, Trade,
  TradeRoute,
  TradeType
} from "./types";

type BigIntish = BigInt | number;

export async function constant<T>(client: Web3ApiClient, ensUri: string, method: string): Promise<T> {
  const query = await client.invoke<T>({
    uri: ensUri,
    module: "query",
    method: method,
    input: {},
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function createPool(client: Web3ApiClient, ensUri: string, tokenA: Token, tokenB: Token, fee: FeeAmount, sqrtRatioX96: BigIntish, liquidity: BigIntish, tickCurrent: Int32, ticks: Tick[]): Promise<Pool> {
  const query = await client.invoke<Pool>({
    uri: ensUri,
    module: "query",
    method: "createPool",
    input: {
      tokenA,
      tokenB,
      fee: typeof fee === "string" ? fee : FeeAmountEnum[fee],
      sqrtRatioX96: sqrtRatioX96.toString(),
      liquidity: liquidity.toString(),
      tickCurrent,
      ticks: { ticks },
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function encodeSqrtRatioX96(client: Web3ApiClient, ensUri: string, amount1: BigIntish, amount0: BigIntish): Promise<BigInt> {
  const query = await client.invoke<BigInt>({
    uri: ensUri,
    module: "query",
    method: "encodeSqrtRatioX96",
    input: {
      amount1: amount1.toString(),
      amount0: amount0.toString(),
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function createRoute(client: Web3ApiClient, ensUri: string, pools: Pool[], inToken: Token, outToken: Token): Promise<Route> {
  const query = await client.invoke<Route>({
    uri: ensUri,
    module: "query",
    method: "createRoute",
    input: {
      pools,
      inToken,
      outToken,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function encodeRouteToPath(client: Web3ApiClient, ensUri: string, route: Route, exactOutput: boolean): Promise<string> {
  const query = await client.invoke<string>({
    uri: ensUri,
    module: "query",
    method: "encodeRouteToPath",
    input: {
      route,
      exactOutput,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function encodeUnwrapWETH9(client: Web3ApiClient, ensUri: string, amountMinimum: BigIntish, recipient: string, feeOptions?: FeeOptions): Promise<string> {
  const query = await client.invoke<string>({
    uri: ensUri,
    module: "query",
    method: "encodeUnwrapWETH9",
    input: {
      amountMinimum,
      recipient,
      feeOptions: feeOptions ?? null,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function encodeSweepToken(client: Web3ApiClient, ensUri: string, token: Token, amountMinimum: BigIntish, recipient: string, feeOptions?: FeeOptions): Promise<string> {
  const query = await client.invoke<string>({
    uri: ensUri,
    module: "query",
    method: "encodeSweepToken",
    input: {
      token,
      amountMinimum,
      recipient,
      feeOptions: feeOptions ?? null,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function encodeRefundETH(client: Web3ApiClient, ensUri: string): Promise<string> {
  const query = await client.invoke<string>({
    uri: ensUri,
    module: "query",
    method: "encodeRefundETH",
    input: {},
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function encodeMulticall(client: Web3ApiClient, ensUri: string, calldatas: string[]): Promise<string> {
  const query = await client.invoke<string>({
    uri: ensUri,
    module: "query",
    method: "encodeMulticall",
    input: {
      calldatas,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function getTickAtSqrtRatio(client: Web3ApiClient, ensUri: string, sqrtRatioX96: BigIntish): Promise<number> {
  const query = await client.invoke<number>({
    uri: ensUri,
    module: "query",
    method: "getTickAtSqrtRatio",
    input: {
      sqrtRatioX96: sqrtRatioX96.toString(),
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function nearestUsableTick(client: Web3ApiClient, ensUri: string, tick: number, tickSpacing: number): Promise<number> {
  const query = await client.invoke<number>({
    uri: ensUri,
    module: "query",
    method: "nearestUsableTick",
    input: {
      tick,
      tickSpacing,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function feeAmountToTickSpacing(client: Web3ApiClient, ensUri: string, feeAmount: FeeAmount): Promise<number> {
  const query = await client.invoke<number>({
    uri: ensUri,
    module: "query",
    method: "feeAmountToTickSpacing",
    input: {
      feeAmount: typeof feeAmount === "string" ? feeAmount : FeeAmountEnum[feeAmount],
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function createTradeFromRoute(client: Web3ApiClient, ensUri: string, tradeRoute: TradeRoute, tradeType: TradeType): Promise<Trade> {
  const query = await client.invoke<Trade>({
    uri: ensUri,
    module: "query",
    method: "createTradeFromRoute",
    input: {
      tradeRoute,
      tradeType,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function createTradeFromRoutes(client: Web3ApiClient, ensUri: string, tradeRoutes: TradeRoute[], tradeType: TradeType): Promise<Trade> {
  const query = await client.invoke<Trade>({
    uri: ensUri,
    module: "query",
    method: "createTradeFromRoutes",
    input: {
      tradeRoutes,
      tradeType,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}

export async function swapCallParameters(client: Web3ApiClient, ensUri: string, trades: Trade[], options: SwapOptions): Promise<MethodParameters> {
  const query = await client.invoke<MethodParameters>({
    uri: ensUri,
    module: "query",
    method: "swapCallParameters",
    input: {
      trades,
      options,
    },
    decode: true,
  });
  if (query.error) {
    throw query.error;
  }
  return query.data!;
}