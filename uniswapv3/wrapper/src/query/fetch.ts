/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ChainId,
  Ethereum_Query,
  FeeAmount,
  getChainIdKey,
  Input_fetchPoolFromTokens,
  Input_fetchPoolFromAddress,
  Input_fetchToken,
  Input_fetchTotalSupply,
  Pool,
  Token,
  TokenAmount,
} from "./w3";
import { wrapIfEther } from "../utils/tokenUtils";
import { createPool, getPoolAddress } from "./pool";
import {
  fetchPoolImmutables,
  fetchPoolState,
  PoolImmutables,
  PoolState,
} from "../utils/fetchUtils";

import { BigInt } from "@web3api/wasm-as";

export function fetchToken(input: Input_fetchToken): Token {
  const address: string = input.address;
  const chainId: ChainId = input.chainId;
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

// returns pair data in token-sorted order
export function fetchPoolFromTokens(input: Input_fetchPoolFromTokens): Pool {
  let tokenA: Token = input.tokenA;
  let tokenB: Token = input.tokenB;
  const fee: FeeAmount = input.fee;
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
  // fetch data
  const state: PoolState = fetchPoolState(address, tokenA.chainId);

  return createPool({
    tokenA: tokenA,
    tokenB: tokenB,
    fee: fee,
    sqrtRatioX96: state.sqrtPriceX96,
    liquidity: state.liquidity,
    tickCurrent: state.tick,
    ticks: null,
  });
}

// returns pair data in token-sorted order
export function fetchPoolFromAddress(input: Input_fetchPoolFromAddress): Pool {
  const address: string = input.address;
  const chainId: ChainId = input.chainId;
  // fetch data
  const immutables: PoolImmutables = fetchPoolImmutables(address, chainId);
  const state: PoolState = fetchPoolState(address, chainId);

  return createPool({
    tokenA: fetchToken({ address: immutables.token0, chainId: chainId }),
    tokenB: fetchToken({ address: immutables.token1, chainId: chainId }),
    fee: immutables.fee,
    sqrtRatioX96: state.sqrtPriceX96,
    liquidity: state.liquidity,
    tickCurrent: state.tick,
    ticks: null,
  });
}

// returns total supply of ERC20-compliant token
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
