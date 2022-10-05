import { ChainId, Ethereum_Module, FeeAmount, getChainIdKey } from "../wrap";

import { BigInt } from "@polywrap/wasm-as";

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

export function poolAbi(methodName: string): string {
  if (methodName == "token0") {
    return "function token0() external view returns (address)";
  } else if (methodName == "token1") {
    return "function token1() external view returns (address)";
  } else if (methodName == "fee") {
    return "function fee() external view returns (uint24)";
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

export function ethCallView(
  address: string,
  chainId: ChainId,
  method: string
): string {
  return Ethereum_Module.callContractView({
    address: address,
    method: method,
    args: [],
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
  }).unwrap();
}
