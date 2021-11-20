/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  ChainId,
  FeeAmount,
  Input_createPool,
  Input_getPoolAddress,
  Input_getPoolInputAmount,
  Input_getPoolOutputAmount,
  Input_getPoolTickSpacing,
  Input_poolChainId,
  Input_poolInvolvesToken,
  Input_poolPriceOf,
  Input_poolToken0Price,
  Input_poolToken1Price,
  Input_simulateSwap,
  NextTickResult,
  Pool,
  PoolChangeResult,
  SimulatedSwapResult,
  SwapStepResult,
  TickListDataProvider,
  Token,
  TokenAmount,
} from "./w3";
import { computePoolAddress, computeSwapStep } from "./poolUtils";
import {
  FACTORY_ADDRESS,
  MAX_SQRT_RATIO,
  MAX_TICK,
  MIN_SQRT_RATIO,
  MIN_TICK,
  Q192,
} from "../utils/constants";
import * as TickUtils from "./tickUtils";
import { tokenEquals, tokenSortsBefore } from "./token";
import Price from "../utils/Price";
import { getTickSpacings } from "../utils/utils";
import { getTick, nextInitializedTickWithinOneWord } from "./tickList";

import { BigInt } from "@web3api/wasm-as";

class SimulatedSwapState {
  amountSpecifiedRemaining: BigInt;
  amountCalculated: BigInt;
  sqrtPriceX96: BigInt;
  tick: u32;
  liquidity: BigInt;
}

class StepComputations {
  sqrtPriceStartX96: BigInt;
  tickNext: u32;
  initialized: boolean;
  sqrtPriceNextX96: BigInt;
  amountIn: BigInt;
  amountOut: BigInt;
  feeAmount: BigInt;
}

/**
 * constructs and validates a Pool
 */
export function createPool(input: Input_createPool): Pool {
  const tokenA: Token = input.tokenA;
  const tokenB: Token = input.tokenB;
  const fee: FeeAmount = input.fee;
  const sqrtRatioX96: BigInt = input.sqrtRatioX96;
  const liquidity: BigInt = input.liquidity;
  const tickCurrent: u32 = input.tickCurrent;
  const ticks: TickListDataProvider | null = input.ticks;

  if (fee >= 1_000_000) {
    throw new Error("FEE: fee amount exceeds the maximum value of 1,000,000.");
  }

  const tickCurrentSqrtRatioX96: BigInt = TickUtils.getSqrtRatioAtTick({
    tick: tickCurrent,
  });
  const nextTickSqrtRatioX96: BigInt = TickUtils.getSqrtRatioAtTick({
    tick: tickCurrent + 1,
  });
  if (
    sqrtRatioX96 < tickCurrentSqrtRatioX96 ||
    sqrtRatioX96 > nextTickSqrtRatioX96
  ) {
    throw new Error("PRICE_BOUNDS: sqrtRatioX96 is invalid for current tick");
  }

  const tokens: Token[] = tokenSortsBefore({ tokenA: tokenA, tokenB: tokenB })
    ? [tokenA, tokenB]
    : [tokenB, tokenA];

  return {
    token0: tokens[0],
    token1: tokens[1],
    fee: fee,
    sqrtRatioX96: sqrtRatioX96,
    liquidity: liquidity,
    tickCurrent: tickCurrent,
    tickDataProvider: ticks,
  };
}

/**
 * Returns the Ethereum address of the Pool contract
 */
export function getPoolAddress(input: Input_getPoolAddress): string {
  return computePoolAddress({
    factoryAddress: FACTORY_ADDRESS,
    fee: input.fee,
    tokenA: input.tokenA,
    tokenB: input.tokenB,
    initCodeHashManualOverride: input.initCodeHashManualOverride,
  });
}

/**
 * Returns true if the token is either token0 or token1
 */
export function poolInvolvesToken(input: Input_poolInvolvesToken): boolean {
  const token: Token = input.token;
  const pool: Pool = input.pool;
  return (
    tokenEquals({ tokenA: token, tokenB: pool.token0 }) ||
    tokenEquals({ tokenA: token, tokenB: pool.token1 })
  );
}

/**
 * Returns the current mid price of the pool in terms of token0, i.e. the ratio of token1 over token0
 */
export function poolToken0Price(input: Input_poolToken0Price): string {
  const pool: Pool = input.pool;
  return new Price(
    pool.token0,
    pool.token1,
    Q192,
    BigInt.mul(pool.sqrtRatioX96, pool.sqrtRatioX96)
  ).toFixed(18);
}

/**
 * Returns the current mid price of the pool in terms of token1, i.e. the ratio of token0 over token1
 */
export function poolToken1Price(input: Input_poolToken1Price): string {
  const pool: Pool = input.pool;
  return new Price(
    pool.token1,
    pool.token0,
    BigInt.mul(pool.sqrtRatioX96, pool.sqrtRatioX96),
    Q192
  ).toFixed(18);
}

/**
 * Returns the price of the given token in terms of the other token in the pool
 * @param input.token The token to return price of
 */
export function poolPriceOf(input: Input_poolPriceOf): string {
  const token: Token = input.token;
  const pool: Pool = input.pool;
  if (!poolInvolvesToken({ token: token, pool: pool })) {
    throw new Error(
      "TOKEN: Cannot return the price of a token that is not in the pool"
    );
  }
  return tokenEquals({ tokenA: token, tokenB: pool.token0 })
    ? poolToken0Price({ pool: pool })
    : poolToken1Price({ pool: pool });
}

/**
 * Returns the chain ID of the tokens in the pool
 */
export function poolChainId(input: Input_poolChainId): ChainId {
  return input.pool.token0.chainId;
}

/**
 * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
 * @param input.inputAmount The input amount for which to quote the output amount
 * @param input.sqrtPriceLimitX96 The Q64.96 sqrt price limit
 */
export function getPoolOutputAmount(
  input: Input_getPoolOutputAmount
): PoolChangeResult {
  const inputAmount: TokenAmount = input.inputAmount;
  const sqrtPriceLimitX96: BigInt | null = input.sqrtPriceLimitX96;
  const pool: Pool = input.pool;
  if (!poolInvolvesToken({ token: inputAmount.token, pool: pool })) {
    throw new Error(
      "TOKEN: Cannot return the output amount for an input token that is not in the pool"
    );
  }

  const zeroForOne: boolean = tokenEquals({
    tokenA: inputAmount.token,
    tokenB: pool.token0,
  });

  const simulatedSwapResult: SimulatedSwapResult = simulateSwap({
    zeroForOne: zeroForOne,
    amountSpecified: inputAmount.amount,
    sqrtPriceLimitX96: sqrtPriceLimitX96,
    pool: pool,
  });
  const outputAmount: BigInt = simulatedSwapResult.amountCalculated;
  const sqrtRatioX96: BigInt = simulatedSwapResult.sqrtRatioX96;
  const liquidity: BigInt = simulatedSwapResult.liquidity;
  const tickCurrent: u32 = simulatedSwapResult.tickCurrent;

  const outputToken: Token = zeroForOne ? pool.token1 : pool.token0;
  return {
    tokenAmount: {
      token: outputToken,
      amount: outputAmount.opposite(),
    },
    pool: {
      token0: pool.token0,
      token1: pool.token1,
      fee: pool.fee,
      sqrtRatioX96: sqrtRatioX96,
      liquidity: liquidity,
      tickCurrent: tickCurrent,
      tickDataProvider: pool.tickDataProvider,
    },
  };
}

/**
 * Given a desired output amount of a token, return the computed input amount and a pool with state updated after the trade
 * @param input.outputAmount The output amount for which to quote the input amount
 * @param input.sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap.
 */
export function getPoolInputAmount(
  input: Input_getPoolInputAmount
): PoolChangeResult {
  const outputAmount: TokenAmount = input.outputAmount;
  const sqrtPriceLimitX96: BigInt | null = input.sqrtPriceLimitX96;
  const pool: Pool = input.pool;
  if (!poolInvolvesToken({ token: outputAmount.token, pool: pool })) {
    throw new Error(
      "TOKEN: Cannot return the output amount for an input token that is not in the pool"
    );
  }

  const zeroForOne: boolean = tokenEquals({
    tokenA: outputAmount.token,
    tokenB: pool.token1,
  });

  const simulatedSwapResult: SimulatedSwapResult = simulateSwap({
    zeroForOne: zeroForOne,
    amountSpecified: outputAmount.amount.opposite(),
    sqrtPriceLimitX96: sqrtPriceLimitX96,
    pool: pool,
  });
  const inputAmount: BigInt = simulatedSwapResult.amountCalculated;
  const sqrtRatioX96: BigInt = simulatedSwapResult.sqrtRatioX96;
  const liquidity: BigInt = simulatedSwapResult.liquidity;
  const tickCurrent: u32 = simulatedSwapResult.tickCurrent;

  const inputToken = zeroForOne ? pool.token0 : pool.token1;
  return {
    tokenAmount: {
      token: inputToken,
      amount: inputAmount,
    },
    pool: {
      token0: pool.token0,
      token1: pool.token1,
      fee: pool.fee,
      sqrtRatioX96: sqrtRatioX96,
      liquidity: liquidity,
      tickCurrent: tickCurrent,
      tickDataProvider: pool.tickDataProvider,
    },
  };
}

/**
 * Simulations execution of a swap and returns next pool state
 * @param input.zeroForOne Whether the amount in is token0 or token1
 * @param input.input.amountSpecified The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative)
 * @param input.input.sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap.
 * @param input.input.pool The pool on which to execute the swap
 */
export function simulateSwap(input: Input_simulateSwap): SimulatedSwapResult {
  const zeroForOne: boolean = input.zeroForOne;
  const amountSpecified: BigInt = input.amountSpecified;
  const pool: Pool = input.pool;
  let sqrtPriceLimitX96: BigInt;
  if (input.sqrtPriceLimitX96 !== null) {
    sqrtPriceLimitX96 = input.sqrtPriceLimitX96!;
  } else {
    sqrtPriceLimitX96 = zeroForOne
      ? BigInt.add(MIN_SQRT_RATIO, BigInt.ONE)
      : BigInt.sub(MAX_SQRT_RATIO, BigInt.ONE);
  }

  if (zeroForOne) {
    if (sqrtPriceLimitX96 <= MIN_SQRT_RATIO) {
      throw new Error(
        `RATIO_MIN: input sqrtPriceLimitX96 ${sqrtPriceLimitX96.toString()} is less than or equal to the minimum sqrt ratio ${MIN_SQRT_RATIO.toString()}`
      );
    }
    if (sqrtPriceLimitX96 >= pool.sqrtRatioX96) {
      throw new Error(
        `RATIO_CURRENT: input sqrtPriceLimitX96 ${sqrtPriceLimitX96.toString()} is greater than or equal to the pool's current sqrt ratio ${pool.sqrtRatioX96.toString()}`
      );
    }
  } else {
    if (sqrtPriceLimitX96 >= MAX_SQRT_RATIO) {
      throw new Error(
        `RATIO_MAX: input sqrtPriceLimitX96 ${sqrtPriceLimitX96.toString()} is greater than or equal to the maximum sqrt ratio ${MAX_SQRT_RATIO.toString()}`
      );
    }
    if (sqrtPriceLimitX96 <= pool.sqrtRatioX96) {
      throw new Error(
        `RATIO_CURRENT: input sqrtPriceLimitX96 ${sqrtPriceLimitX96.toString()} is less than or equal to the pool's current sqrt ratio ${pool.sqrtRatioX96.toString()}`
      );
    }
  }

  const ZERO: BigInt = BigInt.ZERO;
  const exactInput: boolean = amountSpecified >= ZERO;

  // keep track of swap state
  const state: SimulatedSwapState = {
    amountSpecifiedRemaining: amountSpecified,
    amountCalculated: ZERO,
    sqrtPriceX96: pool.sqrtRatioX96,
    tick: pool.tickCurrent,
    liquidity: pool.liquidity,
  };

  // start swap while loop
  while (
    state.amountSpecifiedRemaining != ZERO &&
    state.sqrtPriceX96 != sqrtPriceLimitX96
  ) {
    const step: StepComputations = {
      sqrtPriceStartX96: BigInt.ZERO,
      tickNext: 0,
      initialized: false,
      sqrtPriceNextX96: BigInt.ZERO,
      amountIn: BigInt.ZERO,
      amountOut: BigInt.ZERO,
      feeAmount: BigInt.ZERO,
    };
    step.sqrtPriceStartX96 = state.sqrtPriceX96;

    // because each iteration of the while loop rounds, we can't optimize this code (relative to the smart contract)
    // by simply traversing to the next available tick, we instead need to exactly replicate
    // tickBitmap.nextInitializedTickWithinOneWord
    const nextTickResult: NextTickResult = nextInitializedTickWithinOneWord({
      tick: state.tick,
      lte: zeroForOne,
      tickSpacing: getPoolTickSpacing({ pool: pool }),
      tickDataProvider: pool.tickDataProvider!,
    });
    step.tickNext = nextTickResult.index;
    step.initialized = nextTickResult.found;

    if (step.tickNext < MIN_TICK) {
      step.tickNext = MIN_TICK;
    } else if (step.tickNext > MAX_TICK) {
      step.tickNext = MAX_TICK;
    }

    step.sqrtPriceNextX96 = TickUtils.getSqrtRatioAtTick({
      tick: step.tickNext,
    });

    const swapStepResult: SwapStepResult = computeSwapStep({
      sqrtRatioCurrentX96: state.sqrtPriceX96,
      sqrtRatioTargetX96: (
        zeroForOne
          ? step.sqrtPriceNextX96 < sqrtPriceLimitX96
          : step.sqrtPriceNextX96 > sqrtPriceLimitX96
      )
        ? sqrtPriceLimitX96
        : step.sqrtPriceNextX96,
      liquidity: state.liquidity,
      amountRemaining: state.amountSpecifiedRemaining,
      feePips: pool.fee,
    });
    state.sqrtPriceX96 = swapStepResult.sqrtRatioNextX96;
    step.amountIn = swapStepResult.amountIn;
    step.amountOut = swapStepResult.amountOut;
    step.feeAmount = swapStepResult.feeAmount;

    if (exactInput) {
      state.amountSpecifiedRemaining = state.amountSpecifiedRemaining
        .sub(step.amountIn)
        .sub(step.feeAmount);
      state.amountCalculated = state.amountCalculated.sub(step.amountOut);
    } else {
      state.amountSpecifiedRemaining = BigInt.add(
        state.amountSpecifiedRemaining,
        step.amountOut
      );
      state.amountCalculated = state.amountCalculated
        .add(step.amountIn)
        .add(step.feeAmount);
    }

    if (state.sqrtPriceX96 == step.sqrtPriceNextX96) {
      // if the tick is initialized, run the tick transition
      if (step.initialized) {
        let liquidityNet: BigInt = getTick({
          tickIndex: step.tickNext,
          tickDataProvider: pool.tickDataProvider!,
        }).liquidityNet;
        // if we're moving leftward, we interpret liquidityNet as the opposite sign
        // safe because liquidityNet cannot be type(int128).min
        if (zeroForOne) {
          liquidityNet = liquidityNet.opposite();
        }
        // state.liquidity = MathUtils.addDelta({x: state.liquidity, y: liquidityNet });
        state.liquidity = state.liquidity.add(liquidityNet);
      }
      state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext;
    } else if (state.sqrtPriceX96 != step.sqrtPriceStartX96) {
      // recompute unless we're on a lower tick boundary (i.e. already transitioned ticks), and haven't moved
      state.tick = TickUtils.getTickAtSqrtRatio({
        sqrtRatioX96: state.sqrtPriceX96,
      });
    }
  }

  return {
    amountCalculated: state.amountCalculated,
    sqrtRatioX96: state.sqrtPriceX96,
    liquidity: state.liquidity,
    tickCurrent: state.tick,
  };
}

/**
 * Returns the tick spacing of ticks in the pool
 */
export function getPoolTickSpacing(input: Input_getPoolTickSpacing): u32 {
  return getTickSpacings(input.pool.fee);
}
