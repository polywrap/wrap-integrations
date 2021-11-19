/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  FeeAmount,
  Input_computePoolAddress,
  Input_computeSwapStep,
  SHA3_Query,
  SwapStepResult,
} from "./w3";
import { tokenSortsBefore } from "./token";
import { concat, getChecksumAddress } from "../utils/addressUtils";
import { MAX_FEE, POOL_INIT_CODE_HASH } from "../utils/constants";
import { getFeeAmount } from "../utils/utils";
import * as MathUtils from "./mathUtils";

import { BigInt } from "@web3api/wasm-as";

class PartialSwapStepResult {
  sqrtRatioNextX96: BigInt;
  amountIn: BigInt;
  amountOut: BigInt;
  feeAmount: BigInt;
}

/**
 * Computes a pool address
 * @param input.factoryAddress The Uniswap V3 factory address
 * @param input.tokenA The first token of the pool, irrespective of sort order
 * @param input.tokenB The second token of the pool, irrespective of sort order
 * @param input.fee The fee tier of the pool
 * @param input.initCodeHashManualOverride Override the init code hash used to compute the pool address if necessary
 * @returns The pool address
 */
export function computePoolAddress(input: Input_computePoolAddress): string {
  const factoryAddress: string = input.factoryAddress;
  const tokens: string[] = tokenSortsBefore({
    tokenA: input.tokenA,
    tokenB: input.tokenB,
  })
    ? [input.tokenA.address, input.tokenB.address]
    : [input.tokenB.address, input.tokenA.address];
  const feeHex: string = getFeeAmountHex(input.fee);
  const initCodeHash: string =
    input.initCodeHashManualOverride == null
      ? POOL_INIT_CODE_HASH
      : input.initCodeHashManualOverride!;

  // let token0: string;
  // let token1: string;
  // if (tokenSortsBefore({ tokenA: input.tokenA, tokenB: input.tokenB })) {
  //   token0 = input.tokenA.address;
  //   token1 = input.tokenB.address;
  // } else {
  //   token0 = input.tokenB.address;
  //   token1 = input.tokenA.address;
  // }

  const salt: string = SHA3_Query.hex_keccak_256({
    message: tokens[0].substring(2) + tokens[1].substring(2) + feeHex,
  });
  const concatenatedItems: Uint8Array = concat([
    "0xff",
    getChecksumAddress(factoryAddress),
    salt,
    initCodeHash,
  ]);
  const concatenationHash: string = SHA3_Query.buffer_keccak_256({
    message: concatenatedItems.buffer,
  });
  return getChecksumAddress(concatenationHash.substring(24));
}

export function computeSwapStep(input: Input_computeSwapStep): SwapStepResult {
  const sqrtRatioCurrentX96: BigInt = input.sqrtRatioCurrentX96;
  const sqrtRatioTargetX96: BigInt = input.sqrtRatioTargetX96;
  const liquidity: BigInt = input.liquidity;
  const amountRemaining: BigInt = input.amountRemaining;
  const feePips: u32 = getFeeAmount(input.feePips);

  const returnValues: PartialSwapStepResult = {
    sqrtRatioNextX96: BigInt.ZERO,
    amountIn: BigInt.ZERO,
    amountOut: BigInt.ZERO,
    feeAmount: BigInt.ZERO,
  };

  const zeroForOne: boolean = sqrtRatioCurrentX96 >= sqrtRatioTargetX96;
  const exactIn: boolean = amountRemaining >= BigInt.ZERO;

  if (exactIn) {
    const amountRemainingLessFee: BigInt = BigInt.div(
      BigInt.mul(
        amountRemaining,
        BigInt.sub(MAX_FEE, BigInt.fromUInt32(feePips))
      ),
      MAX_FEE
    );
    // const amountRemainingLessFee: BigInt = MAX_FEE.sub(BigInt.fromUInt32(feePips)).mul(amountRemaining).div(MAX_FEE);

    returnValues.amountIn = zeroForOne
      ? MathUtils.getAmount0Delta({
          sqrtRatioAX96: sqrtRatioTargetX96,
          sqrtRatioBX96: sqrtRatioCurrentX96,
          liquidity: liquidity,
          roundUp: true,
        })
      : MathUtils.getAmount1Delta({
          sqrtRatioAX96: sqrtRatioCurrentX96,
          sqrtRatioBX96: sqrtRatioTargetX96,
          liquidity: liquidity,
          roundUp: true,
        });
    if (amountRemainingLessFee >= returnValues.amountIn) {
      returnValues.sqrtRatioNextX96 = sqrtRatioTargetX96;
    } else {
      returnValues.sqrtRatioNextX96 = MathUtils.getNextSqrtPriceFromInput({
        sqrtPX96: sqrtRatioCurrentX96,
        liquidity: liquidity,
        amountIn: amountRemainingLessFee,
        zeroForOne: zeroForOne,
      });
    }
  } else {
    returnValues.amountOut = zeroForOne
      ? MathUtils.getAmount1Delta({
          sqrtRatioAX96: sqrtRatioTargetX96,
          sqrtRatioBX96: sqrtRatioCurrentX96,
          liquidity: liquidity,
          roundUp: false,
        })
      : MathUtils.getAmount0Delta({
          sqrtRatioAX96: sqrtRatioCurrentX96,
          sqrtRatioBX96: sqrtRatioTargetX96,
          liquidity: liquidity,
          roundUp: false,
        });
    if (amountRemaining.opposite() >= returnValues.amountOut) {
      returnValues.sqrtRatioNextX96 = sqrtRatioTargetX96;
    } else {
      returnValues.sqrtRatioNextX96 = MathUtils.getNextSqrtPriceFromOutput({
        sqrtPX96: sqrtRatioCurrentX96,
        liquidity: liquidity,
        amountOut: amountRemaining.opposite(),
        zeroForOne: zeroForOne,
      });
    }
  }

  const max: boolean = sqrtRatioTargetX96 == returnValues.sqrtRatioNextX96;

  if (zeroForOne) {
    returnValues.amountIn =
      max && exactIn
        ? returnValues.amountIn
        : MathUtils.getAmount0Delta({
            sqrtRatioAX96: returnValues.sqrtRatioNextX96,
            sqrtRatioBX96: sqrtRatioCurrentX96,
            liquidity: liquidity,
            roundUp: true,
          });
    returnValues.amountOut =
      max && !exactIn
        ? returnValues.amountOut
        : MathUtils.getAmount1Delta({
            sqrtRatioAX96: returnValues.sqrtRatioNextX96,
            sqrtRatioBX96: sqrtRatioCurrentX96,
            liquidity: liquidity,
            roundUp: false,
          });
  } else {
    returnValues.amountIn =
      max && exactIn
        ? returnValues.amountIn
        : MathUtils.getAmount1Delta({
            sqrtRatioAX96: sqrtRatioCurrentX96,
            sqrtRatioBX96: returnValues.sqrtRatioNextX96,
            liquidity: liquidity,
            roundUp: true,
          });
    returnValues.amountOut =
      max && !exactIn
        ? returnValues.amountOut
        : MathUtils.getAmount0Delta({
            sqrtRatioAX96: sqrtRatioCurrentX96,
            sqrtRatioBX96: returnValues.sqrtRatioNextX96,
            liquidity: liquidity,
            roundUp: false,
          });
  }

  const negAmountRemaining: BigInt = amountRemaining.opposite();
  if (!exactIn && returnValues.amountOut > negAmountRemaining) {
    returnValues.amountOut = negAmountRemaining;
  }

  if (exactIn && returnValues.sqrtRatioNextX96 != sqrtRatioTargetX96) {
    // we didn't reach the target, so take the remainder of the maximum input as fee
    returnValues.feeAmount = amountRemaining.sub(returnValues.amountIn);
  } else {
    returnValues.feeAmount = MathUtils.mulDivRoundingUp({
      a: returnValues.amountIn,
      b: BigInt.fromUInt32(feePips),
      denominator: MAX_FEE.subInt(feePips),
    });
  }

  return {
    sqrtRatioNextX96: returnValues.sqrtRatioNextX96,
    amountIn: returnValues.amountIn,
    amountOut: returnValues.amountOut,
    feeAmount: returnValues.feeAmount,
  };
}

function getFeeAmountHex(feeAmount: FeeAmount): string {
  switch (feeAmount) {
    case FeeAmount.LOWEST:
      return "000064";
    case FeeAmount.LOW:
      return "0001f4";
    case FeeAmount.MEDIUM:
      return "000bb8";
    case FeeAmount.HIGH:
      return "002710";
    default:
      throw new Error("Unknown FeeAmount");
  }
}
