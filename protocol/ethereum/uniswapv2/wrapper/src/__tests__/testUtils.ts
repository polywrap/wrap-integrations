import { PolywrapClient } from "@polywrap/client-js";
import * as uni from "@uniswap/sdk";
import tokenList from "./e2e/testData/tokenList.json";
import * as App from "./e2e/types/wrap"

export async function getTokenList(): Promise<App.Token[]> {
  let tokens: App.Token[] = [];
  tokenList.forEach((token: {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  }) => tokens.push({
    chainId: App.ChainIdEnum.MAINNET,
    address: token.address,
    currency: {
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
    },
  }));
  return tokens;
}

export async function getPairData(token0: App.Token, token1: App.Token, client: PolywrapClient, ensUri: string): Promise<App.Pair | undefined> {
  const pairData = await client.invoke<App.Pair>({
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

export function getUniPairs(pairs: App.Pair[], chainId: number): uni.Pair[] {
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
  allowedPairs: App.Pair[],
  currencyAmountIn: App.TokenAmount,
  currencyOut: App.Token,
  bestTradeOptions: App.BestTradeOptions | null,
  client: PolywrapClient,
  ensUri: string
): Promise<App.Trade[]> {
  const invocation = await client.invoke<App.Trade[]>({
    uri: ensUri,
    method: "bestTradeExactIn",
    args: {
      pairs: allowedPairs,
      amountIn: currencyAmountIn,
      tokenOut: currencyOut,
      options: bestTradeOptions ?? null
    }
  })
  const result: App.Trade[] | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!
}

export async function getBestTradeExactOut(
  allowedPairs: App.Pair[],
  currencyIn: App.Token,
  currencyAmountOut: App.TokenAmount,
  bestTradeOptions: App.BestTradeOptions | null,
  client: PolywrapClient,
  ensUri: string
): Promise<App.Trade[]> {
  const invocation = await client.invoke<App.Trade[]>({
    uri: ensUri,
    method: "bestTradeExactOut",
    args: {
      pairs: allowedPairs,
      tokenIn: currencyIn,
      amountOut: currencyAmountOut,
      options: bestTradeOptions ?? null
    }
  })
  const result: App.Trade[] | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!
}

export async function approveToken(
  token: App.Token,
  client: PolywrapClient,
  ensUri: string
): Promise<App.Ethereum_TxResponse> {
  const invocation = await client.invoke<App.Ethereum_TxResponse>({
    uri: ensUri,
    method: "approve",
    args: {
      token,
    },
  });
  const result: App.Ethereum_TxResponse | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!;
}

export async function execTrade(
  trade: App.Trade,
  tradeOptions: App.TradeOptions,
  client: PolywrapClient,
  uri: string
): Promise<App.Ethereum_TxResponse> {
  const invocation = await client.invoke<App.Ethereum_TxResponse>({
    uri: uri,
    method: "exec",
    args: {
      trade,
      tradeOptions,
    },
  });
  const result: App.Ethereum_TxResponse | undefined = invocation.data
  if (invocation.error) {
    console.log(invocation.error)
  }
  return result!;
}

export async function execSwap(
  tokenIn: App.Token,
  tokenOut: App.Token,
  amount: string,
  tradeType: App.TradeType,
  tradeOptions: App.TradeOptions,
  client: PolywrapClient,
  uri: string
): Promise<App.Ethereum_TxResponse> {
  const invocation = await client.invoke<App.Ethereum_TxResponse>({
    uri: uri,
    method: "swap",
    args: {
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amount: amount,
      tradeType: tradeType,
      tradeOptions: tradeOptions
    },
  });
  const result: App.Ethereum_TxResponse | undefined = invocation.data
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
