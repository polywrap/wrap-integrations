/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ChainId,
  getChainIdKey,
  Args_fetchPoolFromAddress,
  Args_fetchToken,
  Pool,
  Token,
  Tick,
  Args_fetchTickList,
  Args_fetchPoolFromTokens,
  FeeAmount,
  Ethereum_Module,
  Ethereum_Connection,
  Currency,
} from "../wrap";
import { createPool, getPoolAddress } from "../pool";
import { _wrapToken } from "../token";
import { getFeeAmountEnum } from "./enumUtils";
import {
  getSubgraphEndpoint,
  SubgraphEndpoint,
  subgraphQuery,
} from "./subgraph";
import { ethCallView, poolAbi, PoolImmutables, PoolState } from "./poolView";

import { BigInt, JSON } from "@polywrap/wasm-as";

/**
 * returns token object constructed from on-chain token contract
 * @param args.address the Ethereum address of token's ERC20 contract
 * @param args.chainId the id of the chain to be queried
 */
export function fetchToken(args: Args_fetchToken): Token {
  const chainId: ChainId = args.chainId;
  const address: string = args.address;

  const connection: Ethereum_Connection = {
    node: null,
    networkNameOrChainId: getChainIdKey(chainId),
  };

  const name: string = Ethereum_Module.callContractView({
    connection,
    address,
    method: "function name() public view returns (string memory)",
    args: null,
  }).unwrap();

  const symbol: string = Ethereum_Module.callContractView({
    connection,
    address,
    method: "function symbol() public view returns (string memory)",
    args: null,
  }).unwrap();

  const decimalsString: string = Ethereum_Module.callContractView({
    connection,
    address,
    method: "function decimals() public view returns (uint8)",
    args: null,
  }).unwrap();
  const decimals: u8 = U8.parseInt(decimalsString);

  const currency: Currency = { decimals, symbol, name };
  return { chainId, address, currency };
}

/**
 * returns pool object constructed from on-chain pool contract
 * @param args.tokenA a token in the pool
 * @param args.tokenB the other token in the pool
 * @param args.fee the pool's fee amount
 * @param args.fetchTicks if true, the full list of pool ticks will be fetched
 */
export function fetchPoolFromTokens(args: Args_fetchPoolFromTokens): Pool {
  let tokenA: Token = args.tokenA;
  let tokenB: Token = args.tokenB;
  const fee: FeeAmount = args.fee;
  const fetchTicks = args.fetchTicks;
  // wrap if ether
  tokenA = _wrapToken(tokenA);
  tokenB = _wrapToken(tokenB);
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
  const ticks: Tick[] | null = fetchTicks
    ? fetchTickList({ address, chainId })
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
 * @param args.address the Ethereum address of the pool contract
 * @param args.chainId the id of the chain to be queried
 * @param args.fetchTicks if true, the full list of pool ticks will be fetched
 */
export function fetchPoolFromAddress(args: Args_fetchPoolFromAddress): Pool {
  const chainId: ChainId = args.chainId;
  const address: string = args.address.toLowerCase();
  const fetchTicks = args.fetchTicks;
  // fetch data
  const immutables: PoolImmutables = fetchPoolImmutables(address, chainId);
  const state: PoolState = fetchPoolState(address, chainId);
  const ticks: Tick[] | null = fetchTicks
    ? fetchTickList({ address, chainId })
    : null;

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
 * returns array of ticks from on-chain pool contract at given address
 * @param args.address the Ethereum address of the pool contract
 * @param args.chainId the id of the chain to be queried
 */
export function fetchTickList(args: Args_fetchTickList): Tick[] {
  return fetchAllTicks(args.address, args.chainId);
}

function fetchPoolImmutables(
  address: string,
  chainId: ChainId
): PoolImmutables {
  const token0: string = ethCallView(address, chainId, poolAbi("token0"));
  const token1: string = ethCallView(address, chainId, poolAbi("token1"));
  const fee: string = ethCallView(address, chainId, poolAbi("fee"));
  return {
    token0,
    token1,
    fee: getFeeAmountEnum(U32.parseInt(fee)),
  };
}

function fetchPoolState(address: string, chainId: ChainId): PoolState {
  const liquidity: string = ethCallView(address, chainId, poolAbi("liquidity"));
  const slot0Str: string = ethCallView(address, chainId, poolAbi("slot0"));
  const slot0: string[] = slot0Str
    .replaceAll('"', "")
    .replace("[", "")
    .split(",");
  return {
    liquidity: BigInt.fromString(liquidity),
    sqrtPriceX96: BigInt.fromString(slot0[0]),
    tick: I32.parseInt(slot0[1]),
  };
}

function fetchPoolTicksSubgraph(
  address: string,
  chainId: ChainId,
  skip: i32 = 0
): Tick[] {
  const endpoint: string = getSubgraphEndpoint(chainId);
  const query: JSON.Obj = subgraphQuery({
    url: endpoint,
    query: `
      query {
        ticks(first: 1000, skip: ${skip}, where: { poolAddress: "${address}" }, orderBy: tickIdx) {
          tickIdx
          liquidityGross
          liquidityNet
        }
      }`,
  });
  return query
    .getArr("ticks")!
    .valueOf()
    .map<Tick>(
      (v: JSON.Value, _i: i32, _arr: JSON.Value[]): Tick => {
        const jsonObj: JSON.Obj = <JSON.Obj>v;
        const index: string = jsonObj.getString("tickIdx")!.valueOf();
        const liqGross: string = jsonObj.getString("liquidityGross")!.valueOf();
        const liqNet: string = jsonObj.getString("liquidityNet")!.valueOf();
        return {
          index: I32.parseInt(index),
          liquidityGross: BigInt.fromString(liqGross),
          liquidityNet: BigInt.fromString(liqNet),
        };
      }
    );
}

function fetchAllTicks(address: string, chainId: ChainId): Tick[] {
  let skip: i32 = 0;
  let ticks: Tick[] = fetchPoolTicksSubgraph(address, chainId, skip);
  while (ticks.length % 1000 === 0) {
    skip += 1000;
    const query = fetchPoolTicksSubgraph(address, chainId, skip);
    ticks = ticks.concat(query);
  }
  return ticks;
}
