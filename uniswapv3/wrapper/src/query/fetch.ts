/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ChainId,
  Ethereum_Query,
  getChainIdKey,
  Input_fetchPoolFromAddress,
  Input_fetchToken,
  Pool,
  TickListDataProvider,
  Token,
  Tick,
  Input_fetchTickList,
  Input_fetchPoolFromTokens,
  Input_fetchTotalSupply,
  TokenAmount,
  FeeAmount,
} from "./w3";
import { createPool, getPoolAddress } from "./pool";
import {
  fetchPoolImmutables,
  fetchPoolState,
  fetchPoolTicks,
  PoolImmutables,
  PoolState,
} from "../utils/fetchUtils";
import { wrapIfEther } from "../utils/tokenUtils";

import { BigInt } from "@web3api/wasm-as";

/**
 * returns token object constructed from on-chain token contract
 * @param input.address the Ethereum address of token's ERC20 contract
 * @param input.chainId the id of the chain to be queried
 */
export function fetchToken(input: Input_fetchToken): Token {
  const chainId: ChainId = input.chainId;
  const address: string = input.address;
  const symbol: string = Ethereum_Query.callContractView({
    address: address,
    method: "function symbol() external pure returns (string memory)",
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
  const name: string = Ethereum_Query.callContractView({
    address: address,
    method: "function name() external pure returns (string memory)",
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
  const decimals: string = Ethereum_Query.callContractView({
    address: address,
    method: "function decimals() external pure returns (uint8)",
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
  return {
    chainId: chainId,
    address: address,
    currency: {
      decimals: U8.parseInt(decimals),
      symbol: symbol,
      name: name,
    },
  };
}

/**
 * returns pool object constructed from on-chain pool contract
 * @param input.tokenA a token in the pool
 * @param input.tokenB the other otken in the pool
 * @param input.fee the pool's fee amount
 * @param input.fetchTicks if true, the full list of pool ticks will be fetched
 */
export function fetchPoolFromTokens(input: Input_fetchPoolFromTokens): Pool {
  let tokenA: Token = input.tokenA;
  let tokenB: Token = input.tokenB;
  const fee: FeeAmount = input.fee;
  const fetchTicks: boolean = input.fetchTicks;
  // wrap if ether
  tokenA = wrapIfEther(tokenA);
  tokenB = wrapIfEther(tokenB);
  // get pool address
  const address = getPoolAddress({
    tokenA,
    tokenB,
    fee,
    initCodeHashManualOverride: null,
  });
  const chainId: ChainId = tokenA.chainId;
  // fetch data
  const state: PoolState = fetchPoolState(address, chainId);
  const ticks: TickListDataProvider | null = fetchTicks
    ? { ticks: fetchTickList({ address, chainId }) }
    : null;

  return createPool({
    tokenA: tokenA,
    tokenB: tokenB,
    fee: fee,
    sqrtRatioX96: state.sqrtPriceX96,
    liquidity: state.liquidity,
    tickCurrent: state.tick,
    ticks: ticks,
  });
}

/**
 * returns pool object constructed from on-chain pool contract
 * @param input.address the Ethereum address of the pool contract
 * @param input.chainId the id of the chain to be queried
 * @param input.fetchTicks if true, the full list of pool ticks will be fetched
 */
export function fetchPoolFromAddress(input: Input_fetchPoolFromAddress): Pool {
  const chainId: ChainId = input.chainId;
  const address: string = input.address;
  const fetchTicks: boolean = input.fetchTicks;
  // fetch data
  const immutables: PoolImmutables = fetchPoolImmutables(address, chainId);
  const state: PoolState = fetchPoolState(address, chainId);
  const ticks: TickListDataProvider | null = fetchTicks
    ? { ticks: fetchTickList({ address, chainId }) }
    : null;
  // const ticks: TickListDataProvider | null = fetchTicks
  //   ? { ticks: fetchPoolTicks(address, chainId, immutables.tickSpacing) }
  //   : null;

  return createPool({
    tokenA: fetchToken({ address: immutables.token0, chainId: chainId }),
    tokenB: fetchToken({ address: immutables.token1, chainId: chainId }),
    fee: immutables.fee,
    sqrtRatioX96: state.sqrtPriceX96,
    liquidity: state.liquidity,
    tickCurrent: state.tick,
    ticks: ticks,
  });
}

/**
 * returns total supply of ERC20-compliant token
 */
export function fetchTotalSupply(input: Input_fetchTotalSupply): TokenAmount {
  const token: Token = input.token;
  const res: string = Ethereum_Query.callContractView({
    address: token.address,
    method: "function totalSupply() external view returns (uint)",
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(token.chainId),
    },
  });
  return {
    token: token,
    amount: BigInt.fromString(res),
  };
}

/**
 * returns array of ticks from on-chain pool contract at given address
 * @param input.address the Ethereum address of the pool contract
 * @param input.chainId the id of the chain to be queried
 */
export function fetchTickList(input: Input_fetchTickList): Tick[] {
  const chainId: ChainId = input.chainId;
  const address: string = input.address;

  const tickSpacing: string = Ethereum_Query.callContractView({
    address: address,
    method: "function tickSpacing() external view returns (int24)",
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
  return fetchPoolTicks(address, chainId, I32.parseInt(tickSpacing));
}
