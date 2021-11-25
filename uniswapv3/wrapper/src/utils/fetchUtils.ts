import {
  ChainId,
  Ethereum_Query,
  FeeAmount,
  getChainIdKey,
  Tick,
} from "../query/w3";
import { getFeeAmountEnum } from "./utils";
import { MAX_TICK, MIN_TICK } from "./constants";

import { BigInt } from "@web3api/wasm-as";

const poolImmutablesAbi: string[] = [
  // "function factory() external view returns (address)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() external view returns (uint24)",
  "function tickSpacing() external view returns (int24)",
  // "function maxLiquidityPerTick() external view returns (uint128)",
];

const poolStateAbi: string[] = [
  "function liquidity() external view returns (uint128)",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function ticks(int24 tick) external view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)",
];

export class PoolImmutables {
  // factory: string;
  token0: string;
  token1: string;
  fee: FeeAmount;
  // tickSpacing: i32;
  // maxLiquidityPerTick: BigInt;
}

export class PoolState {
  liquidity: BigInt;
  sqrtPriceX96: BigInt;
  tick: i32;
  // observationIndex: u16;
  // observationCardinality: u16;
  // observationCardinalityNext: u16;
  // feeProtocol: u32;
  // unlocked: boolean;
}

export function fetchPoolImmutables(
  address: string,
  chainId: ChainId
): PoolImmutables {
  const queries: string[] = [];
  for (let i = 1; i < 4; i++) {
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
    // factory: queries[0],
    token0: queries[1],
    token1: queries[2],
    fee: getFeeAmountEnum(U32.parseInt(queries[3])),
    // tickSpacing: I32.parseInt(queries[4]),
    // maxLiquidityPerTick: BigInt.fromString(queries[5]),
  };
}

export function fetchPoolState(address: string, chainId: ChainId): PoolState {
  const liquidity: string = Ethereum_Query.callContractView({
    address: address,
    method: poolStateAbi[0],
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
  const slot0Str: string = Ethereum_Query.callContractView({
    address: address,
    method: poolStateAbi[1],
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
    // observationIndex: U16.parseInt(slot0[2]),
    // observationCardinality: U16.parseInt(slot0[3]),
    // observationCardinalityNext: U16.parseInt(slot0[4]),
    // feeProtocol: U32.parseInt(slot0[5]),
    // unlocked: U8.parseInt(slot0[6]) == 1,
  };
}

export function fetchPoolTicks(
  address: string,
  chainId: ChainId,
  tickSpacing: i32
): Tick[] {
  const ticks: Tick[] = [];
  for (let i = 0; i >= MIN_TICK; i -= tickSpacing) {
    const tickStr: string = Ethereum_Query.callContractView({
      address: address,
      method: poolStateAbi[2],
      args: [],
      connection: {
        node: null,
        networkNameOrChainId: getChainIdKey(chainId),
      },
    });
    const tickInfo: string[] = tickStr.split(",");
    ticks.push({
      index: i,
      liquidityGross: BigInt.fromString(tickInfo[0]),
      liquidityNet: BigInt.fromString(tickInfo[1]),
    });
  }
  ticks.reverse();
  for (let i = tickSpacing; i <= MAX_TICK; i += tickSpacing) {
    const tickStr: string = Ethereum_Query.callContractView({
      address: address,
      method: poolStateAbi[2],
      args: [],
      connection: {
        node: null,
        networkNameOrChainId: getChainIdKey(chainId),
      },
    });
    const tickInfo: string[] = tickStr.split(",");
    ticks.push({
      index: i,
      liquidityGross: BigInt.fromString(tickInfo[0]),
      liquidityNet: BigInt.fromString(tickInfo[1]),
    });
  }
  return ticks;
}
