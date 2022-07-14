import { BestTradeOptions, ChainId, Pair, Token, TokenAmount, Trade, TxResponse, TradeOptions } from "./e2e/types";
import { PolywrapClient } from "@polywrap/client-js";
import * as uni from "@uniswap/sdk";
import tokenList from "./e2e/testData/tokenList.json";

export async function getTokenList(): Promise<Token[]> {
  let tokens: Token[] = [];
  tokenList.forEach((token: {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  }) => tokens.push({
    chainId: ChainId.MAINNET,
    address: token.address,
    currency: {
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
    },
  }));
  return tokens;
}

export async function getPairData(token0: Token, token1: Token, client: PolywrapClient, ensUri: string): Promise<Pair | undefined> {
  const pairData = await client.invoke<Pair>({
    uri: ensUri,
    method: "fetchPairData",
    args: {
      token0: token0,
      token1: token1
    },
  });

  if (pairData.error) {
    throw pairData.error;
  }

  return pairData.data;
}

export function getUniPairs(pairs: Pair[], chainId: number): uni.Pair[] {
  return pairs.map(pair => {
    return new uni.Pair(
      new uni.TokenAmount(
        new uni.Token(
          chainId,
          pair.tokenAmount0.token.address,
          pair.tokenAmount0.token.currency.decimals,
          pair.tokenAmount0.token.currency.symbol || "",
          pair.tokenAmount0.token.currency.name || ""
        ),
        pair.tokenAmount0.amount
      ),
      new uni.TokenAmount(
        new uni.Token(
          chainId,
          pair.tokenAmount1.token.address,
          pair.tokenAmount1.token.currency.decimals,
          pair.tokenAmount1.token.currency.symbol || "",
          pair.tokenAmount1.token.currency.name || ""
        ),
        pair.tokenAmount1.amount
      ),
    );
  });
}

export async function getBestTradeExactIn(
  allowedPairs: Pair[],
  currencyAmountIn: TokenAmount,
  currencyOut: Token,
  bestTradeOptions: BestTradeOptions | null,
  client: PolywrapClient,
  ensUri: string
): Promise<Trade[]> {
  const invocation = await client.invoke<Trade[]>({
    uri: ensUri,
    method: "bestTradeExactIn",
    args: {
      pairs: allowedPairs,
      amountIn: currencyAmountIn,
      tokenOut: currencyOut,
      options: bestTradeOptions ?? null
    }
  })
  const result: Trade[] | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!
}

export async function getBestTradeExactOut(
  allowedPairs: Pair[],
  currencyIn: Token,
  currencyAmountOut: TokenAmount,
  bestTradeOptions: BestTradeOptions | null,
  client: PolywrapClient,
  ensUri: string
): Promise<Trade[]> {
  const invocation = await client.invoke<Trade[]>({
    uri: ensUri,
    method: "bestTradeExactOut",
    args: {
      pairs: allowedPairs,
      tokenIn: currencyIn,
      amountOut: currencyAmountOut,
      options: bestTradeOptions ?? null
    }
  })
  const result: Trade[] | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!
}

export async function approveToken(
  token: Token,
  client: PolywrapClient,
  ensUri: string
): Promise<TxResponse> {
  const invocation = await client.invoke<TxResponse>({
    uri: ensUri,
    method: "approve",
    args: {
      token,
    },
  });
  const result: TxResponse | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!;
}

export async function execTrade(
  trade: Trade,
  tradeOptions: TradeOptions,
  client: PolywrapClient,
  uri: string
): Promise<TxResponse> {
  const invocation = await client.invoke<TxResponse>({
    uri: uri,
    method: "exec",
    args: {
      trade,
      tradeOptions,
    },
  });
  const result: TxResponse | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!;
}

export async function execSwap(
  tokenIn: Token,
  tokenOut: Token,
  amount: string,
  tradeType: string,
  tradeOptions: TradeOptions,
  client: PolywrapClient,
  uri: string
): Promise<TxResponse> {
  const invocation = await client.invoke<TxResponse>({
    uri: uri,
    method: "swap",
    args: {
      token0: tokenIn,
      token1: tokenOut,
      amount: amount,
      tradeType: tradeType,
      tradeOptions: tradeOptions
    },
  });
  const result: TxResponse | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!;
}

export function getSwapMethodAbi(methodName: string): string {
  if (methodName == "swapExactTokensForTokens")
    return `function swapExactTokensForTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)`;
  else if (methodName == "swapTokensForExactTokens")
    return `function swapTokensForExactTokens(uint amountOut,uint amountInMax,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)`;
  else if (methodName == "swapExactETHForTokens")
    return `function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)`;
  else if (methodName == "swapTokensForExactETH")
    return `function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)`;
  else if (methodName == "swapExactTokensForETH")
    return `function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)`;
  else if (methodName == "swapETHForExactTokens")
    return `function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)`;
  else if (
    methodName == "swapExactTokensForTokensSupportingFeeOnTransferTokens"
  )
    return `function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external`;
  else if (methodName == "swapExactETHForTokensSupportingFeeOnTransferTokens")
    return `function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin,address[] calldata path,address to,uint deadline) external payable`;
  else if (methodName == "swapExactTokensForETHSupportingFeeOnTransferTokens")
    return `function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external`;
  else {
    throw new Error("Invalid method name " + methodName);
  }
}
