import { ChainId, Token, Pool, FeeAmount } from "./types";
import { ClientConfig, coreInterfaceUris, Web3ApiClient } from "@web3api/client-js";
import { ethereumPlugin } from "@web3api/ethereum-plugin-js";
import { ipfsPlugin } from "@web3api/ipfs-plugin-js";
import { ensPlugin } from "@web3api/ens-plugin-js";
import tokenList from "./testData/tokenList.json";
import poolList from "./testData/poolList.json";
import { getUniswapPool } from "./uniswapCreatePool";
import { ethers } from "ethers";
import { Pool as UniPool } from "@uniswap/v3-sdk";

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

export function getTokens(pools: Pool[]): Token[] {
  return pools
  .map<Token[]>((pool: Pool): Token[] => [pool.token0, pool.token1]) // get tokens
  .reduce((accum: Token[], current: Token[]) => accum.concat(current), []) // flatten array
  .filter((val: Token, i: number, arr: Token[]) => arr.indexOf(val) === i); // remove duplicates
}

export async function getPools(client: Web3ApiClient, ensUri: string, fetchTicks?: boolean, sliceStart?: number, sliceEnd?: number): Promise<Pool[]> {
  return poolList.slice(sliceStart, sliceEnd).map(
    async (address: string): Promise<Pool> => {
      return await getPoolFromAddress(address, fetchTicks, client, ensUri);
    });
}

export async function getUniPools(provider: ethers.providers.BaseProvider): Promise<UniPool[]> {
  return Promise.all(poolList.map((address: string)  => getUniswapPool(address, provider)));
}

export async function getPoolFromAddress(address: string, fetchTicks: boolean, client: Web3ApiClient, ensUri: string): Promise<Pool | undefined> {
  const poolData = await client.query<{
    fetchPoolFromAddress: Pool;
  }>({
    uri: ensUri,
    query: `
        query {
          fetchPoolFromAddress(
            chainId: $chainId
            address: $address
            fetchTicks: $fetchTicks
          )
        }
      `,
    variables: {
      chainId: ChainId.MAINNET,
      address: address,
      fetchTicks: fetchTicks,
    },
  });
  if (poolData.errors) {
    throw poolData.errors;
  }
  return poolData.data?.fetchPoolFromAddress;
}

// export async function getPoolFromTokens(token0: Token, token1: Token, fee: FeeAmount, client: Web3ApiClient, ensUri: string): Promise<Pool | undefined> {
//   const poolData = await client.query<{
//     fetchPoolFromTokens: Pool;
//   }>({
//     uri: ensUri,
//     query: `
//         query {
//           fetchPoolFromTokens(
//             token0: $token0
//             token1: $token1
//             fee: $fee
//           )
//         }
//       `,
//     variables: {
//       token0: token0,
//       token1: token1,
//       fee: fee
//     },
//   });
//   if (poolData.errors) {
//     throw poolData.errors;
//   }
//   return poolData.data?.fetchPoolFromTokens;
// }

// export function mapToPolywrapChainId(input: number): ChainId {
//   switch (input) {
//     case 1:
//       return ChainId.MAINNET;
//     case 3:
//       return ChainId.ROPSTEN;
//     case 4:
//       return ChainId.RINKEBY;
//     case 5:
//       return ChainId.GOERLI;
//     case 42:
//       return ChainId.KOVAN;
//     default:
//       throw new Error('Unknown chain ID. This should never happen.');
//   }
// }
//
// export function MapToUniChainId(input: ChainId): number {
//   switch (input) {
//     case ChainId.MAINNET:
//       return 1;
//     case ChainId.ROPSTEN:
//       return 3;
//     case ChainId.RINKEBY:
//       return 4;
//     case ChainId.GOERLI:
//       return 5;
//     case ChainId.KOVAN:
//       return 42;
//     default:
//       throw new Error('Unknown chain ID. This should never happen.')
//   }
// }

export function getFeeAmount(feeAmount: FeeAmount): number {
  switch (feeAmount) {
    case FeeAmount.LOWEST:
      return 100;
    case FeeAmount.LOW:
      return 500;
    case FeeAmount.MEDIUM:
      return 3000;
    case FeeAmount.HIGH:
      return 10000;
    default:
      throw new Error("Unknown FeeAmount");
  }
}