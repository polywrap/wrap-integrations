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
  Pool,
  PoolChangeResult,
  SimulatedSwapResult,
  TickListDataProvider,
  Token,
  TokenAmount
} from "./w3";
import { BigInt } from "@web3api/wasm-as";

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
  const ticks: TickListDataProvider = input.ticks;
}

/**
 * Returns the Ethereum address of the Pool contract
 */
export function getPoolAddress(input: Input_getPoolAddress): string {
  const tokenA: Token = input.tokenA;
  const tokenB: Token = input.tokenB;
  const fee: FeeAmount = input.fee;
  const initCodeHashManualOverride: string | null = input.initCodeHashManualOverride;
}

/**
 * Returns true if the token is either token0 or token1
 */
export function poolInvolvesToken(input: Input_poolInvolvesToken): boolean {
  const token: Token = input.token;
  const pool: Pool = input.pool;
}

/**
 * Returns the current mid price of the pool in terms of token0, i.e. the ratio of token1 over token0
 */
export function poolToken0Price(input: Input_poolToken0Price): string {
  const pool: Pool = input.pool;
}

/**
 * Returns the current mid price of the pool in terms of token1, i.e. the ratio of token0 over token1
 */
export function poolToken1Price(input: Input_poolToken1Price): string {
  const pool: Pool = input.pool;
}

/**
 * Returns the price of the given token in terms of the other token in the pool
 * @param input.token The token to return price of
 */
export function poolPriceOf(input: Input_poolPriceOf): string {
  const token: Token = input.token;
  const pool: Pool = input.pool;
}

/**
 * Returns the chain ID of the tokens in the pool
 */
export function poolChainId(input: Input_poolChainId): ChainId {
  const pool: Pool = input.pool;
}

/**
 * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
 * @param input.inputAmount The input amount for which to quote the output amount
 * @param input.sqrtPriceLimitX96 The Q64.96 sqrt price limit
 */
export function getPoolOutputAmount(input: Input_getPoolOutputAmount): PoolChangeResult {
  const inputAmount: TokenAmount = input.inputAmount;
  const sqrtPriceLimitX96: BigInt | null = input.sqrtPriceLimitX96;
}

/**
 * Given a desired output amount of a token, return the computed input amount and a pool with state updated after the trade
 * @param input.outputAmount The output amount for which to quote the input amount
 * @param input.sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap.
 */
export function getPoolInputAmount(input: Input_getPoolInputAmount): PoolChangeResult {
  const outputAmount: TokenAmount = input.outputAmount;
  const sqrtPriceLimitX96: BigInt | null = input.sqrtPriceLimitX96;
}

/**
 * Simulations execution of a swap and returns next pool state
 * @param zeroForOne Whether the amount in is token0 or token1
 * @param input.amountSpecified The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative)
 * @param input.sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap.
 * @param input.pool The pool on which to execute the swap
 */
export function simulateSwap(input: Input_simulateSwap): SimulatedSwapResult {
  const zeroForOne: boolean = input.zeroForOne;
  const amountSpecified: BigInt = input.amountSpecified;
  const sqrtPriceLimitX96: BigInt | null = input.sqrtPriceLimitX96;
  const pool: Pool = input.pool;
}

/**
 * Returns the tick spacing of ticks in the pool
 */
export function getPoolTickSpacing(input: Input_getPoolTickSpacing): u32 {
  const pool: Pool = input.pool;
}