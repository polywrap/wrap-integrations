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
  const pairData = await client.query<{
    fetchPairData: Pair;
  }>({
    uri: ensUri,
    query: `
        query {
          fetchPairData(
            token0: $token0
            token1: $token1
          )
        }
      `,
    variables: {
      token0: token0,
      token1: token1
    },
  });

  if (pairData.errors) {
    throw pairData.errors;
  }

  return pairData.data?.fetchPairData;
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
  const query = await client.query<{
    bestTradeExactIn: Trade[]
  }>({
    uri: ensUri,
    query: `query {
        bestTradeExactIn(
          pairs: $pairs
          amountIn: $amountIn
          tokenOut: $tokenOut
          options: ${bestTradeOptions ?? "null"}
         )
       }`,
    variables: {
      pairs: allowedPairs,
      amountIn: currencyAmountIn,
      tokenOut: currencyOut,
    }
  })
  const result: Trade[] | undefined = query.data?.bestTradeExactIn
  if (query.errors) {
    query.errors.forEach(console.log)
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
  const query = await client.query<{
    bestTradeExactOut: Trade[]
  }>({
    uri: ensUri,
    query: `query {
        bestTradeExactOut(
          pairs: $pairs
          tokenIn: $tokenIn
          amountOut: $amountOut
          options: ${bestTradeOptions ?? "null"}
         )
       }`,
    variables: {
      pairs: allowedPairs,
      tokenIn: currencyIn,
      amountOut: currencyAmountOut,
    }
  })
  const result: Trade[] | undefined = query.data?.bestTradeExactOut
  if (query.errors) {
    query.errors.forEach(console.log)
  }
  return result!
}

export async function approveToken(
  token: Token,
  client: PolywrapClient,
  ensUri: string
): Promise<TxResponse> {
  const query = await client.query<{approve: TxResponse}>({
    uri: ensUri,
    query: `
        mutation {
          approve(
            token: $token
          )
        }
      `,
    variables: {
      token: token,
    },
  });
  const result: TxResponse | undefined = query.data?.approve
  if (query.errors) {
    query.errors.forEach(console.log)
  }
  return result!;
}

export async function execTrade(
  trade: Trade,
  tradeOptions: TradeOptions,
  client: PolywrapClient,
  ensUri: string
): Promise<TxResponse> {
  const query = await client.query<{ exec: TxResponse}>({
    uri: ensUri,
    query: `
          mutation {
            exec (
              trade: $trade
              tradeOptions: $tradeOptions
            )
          }
        `,
    variables: {
      trade: trade,
      tradeOptions: tradeOptions,
    },
  });
  const result: TxResponse | undefined = query.data?.exec
  if (query.errors) {
    query.errors.forEach(console.log)
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
  const query = await client.query<{ swap: TxResponse}>({
    uri: ensUri,
    query: `
        mutation {
          swap (
            tokenIn: $token0
            tokenOut: $token1
            amount: $amount
            tradeType: $tradeType
            tradeOptions: $tradeOptions
          )
        }
      `,
    variables: {
      token0: tokenIn,
      token1: tokenOut,
      amount: amount,
      tradeType: tradeType,
      tradeOptions: tradeOptions
    },
  });
  const result: TxResponse | undefined = query.data?.swap
  if (query.errors) {
    query.errors.forEach(console.log)
  }
  return result!;
}
