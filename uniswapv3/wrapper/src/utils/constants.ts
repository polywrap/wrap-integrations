import { BigInt } from "@web3api/wasm-as";

/* SDK CORE CONSTANTS */

export const MAX_UINT_256 = BigInt.fromString(
  "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  16
);

/* V3 SDK PUBLIC CONSTANTS */

export const UNISWAP_ROUTER_CONTRACT = "";
export const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const POOL_INIT_CODE_HASH =
  "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";
export const POOL_INIT_CODE_HASH_OPTIMISM =
  "0x0c231002d0970d2126e7e00ce88c3b0e5ec8e48dac71478d56245c34ea2f9447";
// historical artifact due to small compiler mismatch
export const POOL_INIT_CODE_HASH_OPTIMISM_KOVAN =
  "0x1fc830513acbdb1608b8c18fd3cf4a4bee3329c69bb41d56400401c40fe02fd0";

/* V3 SDK INTERNAL CONSTANTS */

// used in liquidity amount math
// export const Q96 = BigInt.pow(BigInt.fromUInt16(2), 96);
export const Q96 = BigInt.ONE.leftShift(96);
export const Q192 = BigInt.pow(Q96, 2);

/* TICK MATH CONSTANTS */

export const Q32 = BigInt.pow(BigInt.fromUInt16(2), 32);
// The minimum tick that can be used on any pool.
export const MIN_TICK: i32 = -887272;
// The maximum tick that can be used on any pool.
export const MAX_TICK: i32 = -MIN_TICK;
// The sqrt ratio corresponding to the minimum tick that could be used on any pool.
export const MIN_SQRT_RATIO: BigInt = BigInt.fromString("4295128739");
// The sqrt ratio corresponding to the maximum tick that could be used on any pool.
export const MAX_SQRT_RATIO: BigInt = BigInt.fromString(
  "1461446703485210103287273052203988822378723970342"
);

/* SWAP MATH CONSTANTS */

export const MAX_FEE = BigInt.fromUInt32(10 ** 6);

export const MAX_UINT_160 = BigInt.fromString(
  "ffffffffffffffffffffffffffffffffffffffff",
  16
);
