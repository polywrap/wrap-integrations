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

export function poolAbi(methodName: string): string {
  if (methodName == "token0") {
    return "function token0() external view returns (address)";
  } else if (methodName == "token1") {
    return "function token1() external view returns (address)";
  } else if (methodName == "fee") {
    return "function fee() external view returns (uint24)";
  } else if (methodName == "tickSpacing") {
    return "function tickSpacing() external view returns (int24)";
  } else if (methodName == "liquidity") {
    return "function liquidity() external view returns (uint128)";
  } else if (methodName == "slot0") {
    return "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)";
  } else if (methodName == "ticks") {
    return "function ticks(int24 tick) external view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)";
  } else {
    throw new Error("Invalid method name: " + methodName);
  }
}

export class PoolImmutables {
  token0: string;
  token1: string;
  fee: FeeAmount;
}

export class PoolState {
  liquidity: BigInt;
  sqrtPriceX96: BigInt;
  tick: i32;
}

export function ethCallView(
  address: string,
  chainId: ChainId,
  method: string
): string {
  return Ethereum_Query.callContractView({
    address: address,
    method: method,
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
}

export function fetchPoolImmutables(
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

export function fetchPoolState(address: string, chainId: ChainId): PoolState {
  const liquidity: string = ethCallView(address, chainId, poolAbi("liquidity"));
  const slot0Str: string = ethCallView(address, chainId, poolAbi("slot0"));
  const slot0: string[] = slot0Str.split(",");
  return {
    liquidity: BigInt.fromString(liquidity),
    sqrtPriceX96: BigInt.fromString(slot0[0]),
    tick: I32.parseInt(slot0[1]),
  };
}

export function fetchPoolTicks(
  address: string,
  chainId: ChainId,
  tickSpacing: i32
): Tick[] {
  const ticks: Tick[] = [];
  for (let i = 0; i >= MIN_TICK; i -= tickSpacing) {
    ticks.push(fetchTick(address, chainId, i));
  }
  ticks.reverse();
  for (let i = tickSpacing; i <= MAX_TICK; i += tickSpacing) {
    ticks.push(fetchTick(address, chainId, i));
  }
  return ticks;
}

function fetchTick(address: string, chainId: ChainId, index: i32): Tick {
  const tickStr: string = Ethereum_Query.callContractView({
    address: address,
    method: poolAbi("ticks"),
    args: [index.toString()],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  });
  const tickInfo: string[] = tickStr.split(",");
  return {
    index: index,
    liquidityGross: BigInt.fromString(tickInfo[0]),
    liquidityNet: BigInt.fromString(tickInfo[1]),
  };
}
