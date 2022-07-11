import { BestTradeOptions, ChainId, Pair, Token, TokenAmount, Trade, TxResponse, TradeOptions } from "./e2e/types";
import { ClientConfig, PolywrapClient } from "@polywrap/client-js";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { ipfsResolverPlugin } from "@polywrap/ipfs-resolver-plugin-js";
import { ensResolverPlugin }  from "@polywrap/ens-resolver-plugin-js";
import { initTestEnvironment as initPolywrapTestEnvironment, stopTestEnvironment as stopPolywrapTestEnvironment } from "@polywrap/test-env-js";
import * as uni from "@uniswap/sdk";
import tokenList from "./e2e/testData/tokenList.json";
import { spawn } from "child_process";

export async function initTestEnvironment(): Promise<void> {
  await initPolywrapTestEnvironment()
  spawn("docker-compose up", { cwd: __dirname})
}

export async function stopTestEnvironment(): Promise<void> {
  await stopPolywrapTestEnvironment()
  spawn("docker-compose down", { cwd: __dirname + "../"})
}

export function getPlugins(ethereum: string, ipfs: string, ensAddress: string): Partial<ClientConfig> {
  return {
    redirects: [],
    plugins: [
     {
       uri: "wrap://ens/ipfs-resolver.polywrap.eth",
       plugin: ipfsResolverPlugin({ provider: ipfs }),
     },
     {
       uri: "wrap://ens/ens-resolver.polywrap.eth",
       plugin: ensResolverPlugin({ addresses: { testnet: ensAddress } }),
     },
     {
      uri: "wrap://ens/ethereum.polywrap.eth",
      plugin: ethereumPlugin({
          networks: {
            testnet: {
              provider: ethereum
            },
            MAINNET: {
              provider: "http://localhost:8546"
            },
          },
          defaultNetwork: "testnet"
        }),
      },
    ]
  };
}

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
  ensUri: string
): Promise<TxResponse> {
  const invocation = await client.invoke<TxResponse>({
    uri: ensUri,
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
  ensUri: string
): Promise<TxResponse> {
  const invocation = await client.invoke<TxResponse>({
    uri: ensUri,
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
