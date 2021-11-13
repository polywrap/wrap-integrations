import { Input_encodeSqrtRatioX96, Input_mostSignificantBit } from "./w3";

import { BigInt } from "@web3api/wasm-as";
import { MAX_UINT_256 } from "../utils/constants";

/**
 * Returns the most significant bit of a 256 bit integer
 * @param input.tick the target tick
 * @param input.tickSpacing the spacing of the pool
 */
export function mostSignificantBit(input: Input_mostSignificantBit): u32 {
  let x: BigInt = input.x;
  if (BigInt.lte(x, BigInt.ZERO)) {
    throw new Error("ZERO: input is less than or equal to zero");
  }
  if (BigInt.gt(x, MAX_UINT_256)) {
    throw new Error("MAX: input is greater than max value of a uint256");
  }

  let msb: u32 = 0;
  for (let power = 128; power >= 1; power /= 2) {
    const min: BigInt = BigInt.pow(BigInt.fromUInt16(2), power);
    if (BigInt.gte(x, min)) {
      x = x.divPowTwo(power);
      msb += power;
    }
  }
  return msb;
}

/**
 * Returns the sqrt ratio as a Q64.96 corresponding to a given ratio of amount1 and amount0
 * @param input.amount1 The numerator amount i.e., the amount of token1
 * @param input.amount0 The denominator amount i.e., the amount of token0
 */
export function encodeSqrtRatioX96(input: Input_encodeSqrtRatioX96): BigInt {
  const numerator: BigInt = input.amount1.mulPowTwo(192);
  const denominator: BigInt = input.amount0;
  const ratioX192: BigInt = BigInt.div(numerator, denominator);
  return ratioX192.sqrt();
}
