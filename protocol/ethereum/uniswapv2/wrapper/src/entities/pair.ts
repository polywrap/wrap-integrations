import { fetchTokenData } from "./fetch";
import { tokenSortsBefore } from "./token";
import {
  Args_pairAddress,
  Args_pairInputAmount,
  Args_pairInputNextPair,
  Args_pairLiquidityMinted,
  Args_pairLiquidityToken,
  Args_pairLiquidityValue,
  Args_pairOutputAmount,
  Args_pairOutputNextPair,
  Args_pairReserves,
  Args_pairToken0Price,
  Args_pairToken1Price,
  Pair,
  SHA3_Module,
  Token,
  TokenAmount,
} from "../wrap";
import Price from "../utils/Price";
import {
  factoryAddress,
  initCodeHash,
  minimumLiquidity,
  concat,
  getChecksumAddress,
  ProcessedPair,
} from "../utils";

import { BigInt } from "@polywrap/wasm-as";

// returns address of pair liquidity token contract
// see https://uniswap.org/docs/v2/javascript-SDK/getting-pair-addresses/
// and https://eips.ethereum.org/EIPS/eip-1014
export function pairAddress(args: Args_pairAddress): string {
  let tokenA: string;
  let tokenB: string;
  if (tokenSortsBefore({ token: args.token0, other: args.token1 })) {
    tokenA = args.token0.address;
    tokenB = args.token1.address;
  } else {
    tokenA = args.token1.address;
    tokenB = args.token0.address;
  }
  const salt: string = SHA3_Module.hex_keccak_256({
    message: tokenA.substring(2) + tokenB.substring(2),
  }).unwrap();
  const concatenatedItems: Uint8Array = concat([
    "0xff",
    getChecksumAddress(factoryAddress),
    salt,
    initCodeHash,
  ]);
  const concatenationHash: string = SHA3_Module.buffer_keccak_256({
    message: concatenatedItems.buffer,
  }).unwrap();
  return getChecksumAddress(concatenationHash.substring(24));
}

// returns pair liquidity token
export function pairLiquidityToken(args: Args_pairLiquidityToken): Token {
  const pair: Pair = args.pair;
  const token0: Token = pair.tokenAmount0.token;
  const token1: Token = pair.tokenAmount1.token;
  return fetchTokenData({
    chainId: token0.chainId,
    address: pairAddress({ token0, token1 }),
    symbol: null,
    name: null,
  });
}

// returns the reserves for pair tokens in sorted order
export function pairReserves(args: Args_pairReserves): TokenAmount[] {
  const pair: Pair = args.pair;
  if (
    tokenSortsBefore({
      token: pair.tokenAmount0.token,
      other: pair.tokenAmount1.token,
    })
  ) {
    return [pair.tokenAmount0, pair.tokenAmount1];
  }
  return [pair.tokenAmount1, pair.tokenAmount0];
}

// Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
export function pairToken0Price(args: Args_pairToken0Price): string {
  const pair = args.pair;
  const price = new Price(
    pair.tokenAmount0.token,
    pair.tokenAmount1.token,
    pair.tokenAmount0.amount,
    pair.tokenAmount1.amount
  );
  return price.toFixed(18);
}

// Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
export function pairToken1Price(args: Args_pairToken1Price): string {
  const pair = args.pair;
  const price = new Price(
    pair.tokenAmount1.token,
    pair.tokenAmount0.token,
    pair.tokenAmount1.amount,
    pair.tokenAmount0.amount
  );
  return price.toFixed(18);
}

// Pricing function for exact args amounts. Returns maximum output amount, based on current reserves, if the trade were executed.
export function pairOutputAmount(args: Args_pairOutputAmount): TokenAmount {
  const pair: Pair = args.pair;
  const tradeTokenAmount: TokenAmount = args.inputAmount;
  return ProcessedPair.pairOutputForExactInput(pair, tradeTokenAmount).amount;
}

// Pricing function for exact args amounts. Returns next pair state, based on current reserves, if the trade were executed.
export function pairOutputNextPair(args: Args_pairOutputNextPair): Pair {
  const pair: Pair = args.pair;
  const tradeTokenAmount: TokenAmount = args.inputAmount;
  return ProcessedPair.pairOutputForExactInput(pair, tradeTokenAmount).nextPair;
}

// Pricing function for exact output amounts. Returns minimum args amount, based on current reserves, if the trade were executed.
export function pairInputAmount(args: Args_pairInputAmount): TokenAmount {
  const pair: Pair = args.pair;
  const tradeTokenAmount: TokenAmount = args.outputAmount;
  return ProcessedPair.pairInputForExactOutput(pair, tradeTokenAmount).amount;
}

// Pricing function for exact output amounts. Returns next pair state, based on current reserves, if the trade were executed.
export function pairInputNextPair(args: Args_pairInputNextPair): Pair {
  const pair: Pair = args.pair;
  const tradeTokenAmount: TokenAmount = args.outputAmount;
  return ProcessedPair.pairInputForExactOutput(pair, tradeTokenAmount).nextPair;
}

/*
Calculates the exact amount of liquidity tokens minted from a given amount of token0 and token1.
  totalSupply is total supply of pair liquidity token.
  totalSupply must be looked up on-chain.
  The value returned from this function cannot be used as an args to getLiquidityValue.
*/
export function pairLiquidityMinted(
  args: Args_pairLiquidityMinted
): TokenAmount {
  const pair: Pair = args.pair;
  const totalSupply: TokenAmount = args.totalSupply;
  const tokenAmount0: TokenAmount = args.tokenAmount0;
  const tokenAmount1: TokenAmount = args.tokenAmount1;
  // sort order
  const pairTokens = tokenSortsBefore({
    token: pair.tokenAmount0.token,
    other: pair.tokenAmount1.token,
  })
    ? [pair.tokenAmount0, pair.tokenAmount1]
    : [pair.tokenAmount1, pair.tokenAmount0];
  const tokenAmounts = tokenSortsBefore({
    token: tokenAmount0.token,
    other: tokenAmount1.token,
  })
    ? [tokenAmount0, tokenAmount1]
    : [tokenAmount1, tokenAmount0];
  // calculate liquidity to mint
  let liquidity: BigInt;
  let amount0 = tokenAmounts[0].amount;
  let amount1 = tokenAmounts[1].amount;
  const supply = totalSupply.amount;
  if (supply.eq(BigInt.ZERO)) {
    const minLiq = BigInt.fromUInt32(minimumLiquidity);
    liquidity = amount0.mul(amount1).sqrt().sub(minLiq);
  } else {
    const pairAmt0 = pairTokens[0].amount;
    const pairAmt1 = pairTokens[1].amount;
    amount0 = amount0.mul(supply).div(pairAmt0);
    amount1 = amount1.mul(supply).div(pairAmt1);
    liquidity = amount0.lt(amount1) ? amount0 : amount1;
  }
  if (liquidity.eq(BigInt.ZERO)) {
    throw new Error(
      "Insufficient liquidity: liquidity minted must be greater than zero"
    );
  }
  return {
    token: totalSupply.token,
    amount: liquidity,
  };
}

/*
Calculates the exact amount of token0 or token1 that the given amount of liquidity tokens represent.
  totalSupply is total supply of pair liquidity token.
  totalSupply must be looked up on-chain.
  If the protocol charge is on, feeOn must be set to true, and kLast must be provided from an on-chain lookup.
  Values returned from this function cannot be used as argss to getLiquidityMinted.
*/
export function pairLiquidityValue(
  args: Args_pairLiquidityValue
): TokenAmount[] {
  const pair: Pair = args.pair;
  const totalSupply: TokenAmount = args.totalSupply;
  const liquidity: TokenAmount = args.liquidity;
  const feeOn: bool = !args.feeOn.isSome && args.feeOn.unwrap();
  const kLast: BigInt = args.kLast === null ? BigInt.ZERO : args.kLast!;
  const amount0 = pair.tokenAmount0.amount;
  const amount1 = pair.tokenAmount1.amount;
  const liqAmt = liquidity.amount;
  let totalSupplyAmount = totalSupply.amount;
  if (feeOn && kLast.gt(BigInt.ZERO)) {
    const rootK = amount0.mul(amount1).sqrt();
    const rootKLast = kLast.sqrt();
    if (rootK.gt(rootKLast)) {
      const numerator1 = totalSupplyAmount;
      const numerator2 = rootK.sub(rootKLast);
      const denominator = rootK.mul(BigInt.fromUInt16(5)).add(rootKLast);
      const feeLiquidity = numerator1.mul(numerator2).div(denominator);
      totalSupplyAmount = totalSupplyAmount.add(feeLiquidity);
    }
  }
  const token0Value = amount0.mul(liqAmt).div(totalSupplyAmount);
  const token1Value = amount1.mul(liqAmt).div(totalSupplyAmount);

  return [
    { token: pair.tokenAmount0.token, amount: token0Value },
    { token: pair.tokenAmount1.token, amount: token1Value },
  ];
}
