import { ChainId, Token } from "./types";
import { ClientConfig, coreInterfaceUris, Web3ApiClient } from "@web3api/client-js";
import { ethereumPlugin } from "@web3api/ethereum-plugin-js";
import { ipfsPlugin } from "@web3api/ipfs-plugin-js";
import { ensPlugin } from "@web3api/ens-plugin-js";
import tokenList from "./testData/tokenList.json";
import { Pair } from "../../../../../uniswapv2/wrapper/src/__tests__/e2e/types";
import { Pool } from "../../query/w3";

export function getPlugins(ethereum: string, ipfs: string, ensAddress: string): ClientConfig {
 return {
   redirects: [],
   plugins: [
     {
       uri: "w3://ens/ipfs.web3api.eth",
       plugin: ipfsPlugin({ provider: ipfs }),
     },
     {
       uri: "w3://ens/ens.web3api.eth",
       plugin: ensPlugin({ addresses: { testnet: ensAddress } }),
     },
     {
      uri: "w3://ens/ethereum.web3api.eth",
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
    ],
    interfaces: [
    {
      interface: coreInterfaceUris.uriResolver.uri,
      implementations: [
        "w3://ens/ipfs.web3api.eth",
        "w3://ens/ens.web3api.eth",
      ],
    },
    {
      interface: coreInterfaceUris.logger.uri,
      implementations: ["w3://ens/js-logger.web3api.eth"],
    },
  ],
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

export async function getPoolData(token0: Token, token1: Token, client: Web3ApiClient, ensUri: string): Promise<Pool | undefined> {
  const poolData = await client.query<{
    fetchPoolFromTokens: Pool;
  }>({
    uri: ensUri,
    query: `
        query {
          fetchPoolFromTokens(
            token0: $token0
            token1: $token1
            fee: $fee
          )
        }
      `,
    variables: {
      token0: token0,
      token1: token1,
      fee: "MEDIUM"
    },
  });

  if (poolData.errors) {
    throw poolData.errors;
  }

  return poolData.data?.fetchPoolFromTokens;
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