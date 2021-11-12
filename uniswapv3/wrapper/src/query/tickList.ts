import {
  Input_createTickListDataProvider,
  Input_getTick,
  Input_nextInitializedTickWithinOneWord,
  NextTickResult,
  Tick,
  TickListDataProvider,
} from "./w3";
import * as TickUtils from "./tickListUtils";

/**
 * constructs and validates a TickListDataProvider
 */
export function createTickListDataProvider(
  input: Input_createTickListDataProvider
): TickListDataProvider {
  const ticks: Tick[] = input.ticks;
  const tickSpacing: u32 = input.tickSpacing;
  TickUtils.validateTickList({ ticks: ticks, tickSpacing: tickSpacing });
  return {
    ticks: ticks,
  };
}

/**
 * returns tick at requested index
 */
export function getTick(input: Input_getTick): Tick {
  const tickIndex: u32 = input.tickIndex;
  const ticks: Tick[] = input.tickDataProvider.ticks;
  return TickUtils.getTick(ticks, tickIndex);
}

/**
 * returns next initialized tick, or max or min tick. Returns true if a tick is found at index
 */
export function nextInitializedTickWithinOneWord(
  input: Input_nextInitializedTickWithinOneWord
): NextTickResult {
  const tick: u32 = input.tick;
  const lte: boolean = input.lte;
  const tickSpacing: u32 = input.tickSpacing;
  const ticks: Tick[] = input.tickDataProvider.ticks;

  const compressed: u32 = tick / tickSpacing;

  if (lte) {
    const wordPos: u32 = compressed >> 8;
    const minimum: u32 = (wordPos << 8) * tickSpacing;

    if (TickUtils.tickIsBelowSmallest({ ticks: ticks, tick: tick })) {
      return {
        index: minimum,
        found: false,
      };
    }

    const index: u32 = TickUtils.nextInitializedTick({
      ticks: ticks,
      tick: tick,
      lte: lte,
    }).index;
    const nextInitializedTick: u32 = index > minimum ? index : minimum;
    return {
      index: nextInitializedTick,
      found: nextInitializedTick == index,
    };
  } else {
    const wordPos = (compressed + 1) >> 8;
    const maximum = ((wordPos + 1) << 8) * tickSpacing - 1;

    if (TickUtils.tickIsAtOrAboveLargest({ ticks: ticks, tick: tick })) {
      return {
        index: maximum,
        found: false,
      };
    }

    const index: u32 = TickUtils.nextInitializedTick({
      ticks: ticks,
      tick: tick,
      lte: lte,
    }).index;
    const nextInitializedTick = maximum < index ? maximum : index;
    return {
      index: nextInitializedTick,
      found: nextInitializedTick == index,
    };
  }
}
