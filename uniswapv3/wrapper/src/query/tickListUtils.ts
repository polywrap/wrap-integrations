import {
  Input_nextInitializedTick,
  Input_tickIsAtOrAboveLargest,
  Input_tickIsBelowSmallest,
  Input_tickListIsSorted,
  Input_validateTickList,
  Tick
} from "./w3";
import { BigInt } from "@web3api/wasm-as";

export function validateTickList(input: Input_validateTickList): boolean {
  const ticks: Tick[] = input.ticks;
  const tickSpacing: u32 = input.tickSpacing;
  if (tickSpacing <= 0) {
    throw new Error("TICK_SPACING_NONZERO: Tick spacing must be greater than zero");
  }
  // ensure ticks are spaced appropriately
  if (ticks.every((tick: Tick) => tick.index % tickSpacing != 0)) {
    throw new Error("TICK_SPACING: Tick indices must be multiples of tickSpacing");
  }
 // ensure tick liquidity deltas sum to 0
  if (BigInt.ne(
    ticks.reduce<BigInt>((accumulator: BigInt, tick: Tick) => BigInt.add(accumulator, tick.liquidityNet), BigInt.ZERO),
    BigInt.ZERO
  )) {
    throw new Error("ZERO_NET: tick net liquidity values must sum to 0");
  }
  if (!isSorted(ticks, tickComparator)) {
    throw new Error("SORTED: tick list must be sorted by index");
  }
}

export function tickIsBelowSmallest(input: Input_tickIsBelowSmallest): boolean {
  const ticks: Tick[] = input.ticks;
  const tick: u32 = input.tick;
  if (ticks.length == 0) {
    throw new Error("LENGTH: Tick list is empty");
  }
  return tick < ticks[0].index;
}

export function tickIsAtOrAboveLargest(input: Input_tickIsAtOrAboveLargest): boolean {
  const ticks: Tick[] = input.ticks;
  const tick: u32 = input.tick;
  if (ticks.length == 0) {
    throw new Error("LENGTH: Tick list is empty");
  }
  return tick >= ticks[ticks.length - 1].index;
}

/**
 * Finds the largest tick in the list of ticks that is less than or equal to tick
 * @param ticks list of ticks
 * @param tick tick to find the largest tick that is less than or equal to tick
 * @private
 */
function binarySearch(ticks: Tick[], tick: u32): u32 {
  if (tickIsBelowSmallest({ ticks: ticks, tick: tick })) {
    throw new Error("BELOW_SMALLEST: target tick index is below smallest tick index in list");
  }
  let l: u32 = 0;
  let r: u32 = ticks.length - 1;
  let i: u32;
  while (true) {
    i = (l + r) / 2;

    if (ticks[i].index <= tick && (i === ticks.length - 1 || ticks[i + 1].index > tick)) {
      return i
    }

    if (ticks[i].index < tick) {
      l = i + 1
    } else {
      r = i - 1
    }
  }
}

export function getTick(ticks: Tick[], index: u32): Tick {
  const tick: Tick = ticks[binarySearch(ticks, index)];
  if (tick.index != index) {
    throw new Error(("NOT_CONTAINED: requested tick not found in tick list"));
  }
  return tick
}

export function nextInitializedTick(input: Input_nextInitializedTick): Tick {
  const ticks: Tick[] = input.ticks;
  const tick: u32 = input.tick;
  const lte: boolean = input.lte;
}

// public static nextInitializedTick(ticks: readonly Tick[], tick: number, lte: boolean): Tick {
//   if (lte) {
//     invariant(!TickList.isBelowSmallest(ticks, tick), 'BELOW_SMALLEST')
//     if (TickList.isAtOrAboveLargest(ticks, tick)) {
//       return ticks[ticks.length - 1]
//     }
//     const index = this.binarySearch(ticks, tick)
//     return ticks[index]
//   } else {
//     invariant(!this.isAtOrAboveLargest(ticks, tick), 'AT_OR_ABOVE_LARGEST')
//     if (this.isBelowSmallest(ticks, tick)) {
//       return ticks[0]
//     }
//     const index = this.binarySearch(ticks, tick)
//     return ticks[index + 1]
//   }
// }


/**
 * Returns true if a tick list is sorted by tick index
 * @param list The tick list
 * @returns true if sorted
 */
export  function tickListIsSorted(input: Input_tickListIsSorted): boolean {
  return isSorted(input.ticks, tickComparator);
}

function tickComparator(a: Tick, b: Tick) {
  return a.index - b.index
}

function isSorted<T>(list: Array<T>, comparator: (a: T, b: T) => number): boolean {
  for (let i = 0; i < list.length - 1; i++) {
    if (comparator(list[i], list[i + 1]) > 0) {
      return false
    }
  }
  return true
}



