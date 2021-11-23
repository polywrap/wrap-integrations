import { ChainId, Ethereum_Query, FeeAmount, getChainIdKey } from "../query/w3";
import { getFeeAmountEnum } from "./utils";

import { BigInt } from "@web3api/wasm-as";

const poolImmutablesAbi: string[] = [
  "function factory() external view returns (address)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() external view returns (uint24)",
  "function tickSpacing() external view returns (int24)",
  "function maxLiquidityPerTick() external view returns (uint128)",
];

export class PoolImmutables {
  factory: string;
  token0: string;
  token1: string;
  fee: FeeAmount;
  tickSpacing: i32;
  maxLiquidityPerTick: BigInt;
}

export class PoolState {
  liquidity: BigInt;
  sqrtPriceX96: BigInt;
  tick: i32;
  observationIndex: u16;
  observationCardinality: u16;
  observationCardinalityNext: u16;
  feeProtocol: u32;
  unlocked: boolean;
}

export function fetchPoolImmutables(
  address: string,
  chainId: ChainId
): PoolImmutables {
  const queries: string[] = [];
  for (let i = 0; i < poolImmutablesAbi.length; i++) {
    const query: string = Ethereum_Query.callContractView({
      address: address,
      method: poolImmutablesAbi[i],
      args: [],
      connection: {
        node: null,
        networkNameOrChainId: getChainIdKey(chainId),
      },
    });
    queries.push(query);
  }
  return {
    factory: queries[0],
    token0: queries[1],
    token1: queries[2],
    fee: getFeeAmountEnum(U32.parseInt(queries[3])),
    tickSpacing: I32.parseInt(queries[4]),
    maxLiquidityPerTick: BigInt.fromString(queries[5]),
  };
}

export function fetchPoolState(address: string, chainId: ChainId): PoolState {
  const liquidity: string = Ethereum_Query.callContractView({
    address: address,
    method: "function liquidity() external view returns (uint128)",
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
  const slot0Str: string = Ethereum_Query.callContractView({
    address: address,
    method: "function slot0() external view returns (string[])",
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
  const slot0: string[] = slot0Str.split(",");
  return {
    liquidity: BigInt.fromString(liquidity),
    sqrtPriceX96: BigInt.fromString(slot0[0]),
    tick: I32.parseInt(slot0[1]),
    observationIndex: U16.parseInt(slot0[2]),
    observationCardinality: U16.parseInt(slot0[3]),
    observationCardinalityNext: U16.parseInt(slot0[4]),
    feeProtocol: U32.parseInt(slot0[1]),
    unlocked: U8.parseInt(slot0[6]) == 1,
  };
}

// struct Slot0 {
//   // the current price
//   uint160 sqrtPriceX96;
//   // the current tick
//   int24 tick;
//   // the most-recently updated index of the observations array
//   uint16 observationIndex;
//   // the current maximum number of observations that are being stored
//   uint16 observationCardinality;
//   // the next maximum number of observations to store, triggered in observations.write
//   uint16 observationCardinalityNext;
//   // the current protocol fee as a percentage of the swap fee taken on withdrawal
//   // represented as an integer denominator (1/x)%
//   uint8 feeProtocol;
//   // whether the pool is locked
//   bool unlocked;
// }
