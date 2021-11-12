import {
  Input_createTickListDataProvider,
  Input_getTick,
  Input_nextInitializedTickWithinOneWord, NextTickResult,
  Tick,
  TickListDataProvider
} from "./w3";

/**
 * constructs and validates TickListDataProvider
 */
export function createTickListDataProvider(input: Input_createTickListDataProvider): TickListDataProvider {
  const ticks: Tick[] = input.ticks;
  const tickSpacing: u32 = input.tickSpacing;
}

/**
* returns tick at requested index
*/
export function getTick(input: Input_getTick): Tick {
  const tickIndex: u32 = input.tickIndex;
  const tickDataPRovider: TickListDataProvider = input.tickDataProvider;
}

/**
* returns next initialized tick, or max or min tick. Returns true if a tick is found at index
*/
export function nextInitializedTickWithinOneWord(input: Input_nextInitializedTickWithinOneWord): NextTickResult {
  const tick: u32 = input.tick;
  const lte: boolean = input.lte;
  const tickSpacing: u32 = input.tickSpacing;
  const tickDataPRovider: TickListDataProvider = input.tickDataProvider;
}