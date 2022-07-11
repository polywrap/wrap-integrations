import {
  Pair,
  Token,
  TokenAmount,
  Trade,
  TradeType,
  Args_tradeExecutionPrice,
  Args_tradeNextMidPrice,
  Args_tradeSlippage,
  Args_tradeMinimumAmountOut,
  Args_tradeMaximumAmountIn,
  Args_bestTradeExactIn,
  Args_bestTradeExactOut,
  Args_createTrade,
} from "../wrap";
import { createRoute, midPrice, routeMidPrice } from "./route";
import Price from "../utils/Price";
import { pairInputAmount, pairOutputAmount } from "./pair";
import Fraction from "../utils/Fraction";
import { currencyEquals, tokenAmountEquals, tokenEquals } from "./token";
import { PriorityQueue } from "../utils/PriorityQueue";
import { TradeOptions } from "../utils/TradeOptions";
import { ETHER } from "../utils/Currency";
import { copyTokenAmount, wrapIfEther } from "../utils/utils";

import { BigInt, Option } from "@polywrap/wasm-as";
import { BigFloat } from "as-bigfloat";

export function createTrade(args: Args_createTrade): Trade {
  const amounts: TokenAmount[] = new Array(args.route.path.length);
  if (args.tradeType == TradeType.EXACT_INPUT) {
    if (
      !currencyEquals({
        currency: args.amount.token.currency,
        other: args.route.input.currency,
      })
    ) {
      throw new Error(
        "Trade args token must be the same as trade route args token"
      );
    }

    amounts[0] = args.amount;
    for (let i = 0; i < args.route.path.length - 1; i++) {
      const pair = args.route.pairs[i];
      amounts[i + 1] = pairOutputAmount({
        pair: pair,
        inputAmount: amounts[i],
      });
    }
  } else {
    if (args.amount.token.currency != args.route.output.currency) {
      throw new Error(
        "Trade output token must be the same as trade route output token"
      );
    }

    amounts[amounts.length - 1] = args.amount;
    for (let i = args.route.path.length - 1; i > 0; i--) {
      const pair = args.route.pairs[i - 1];
      amounts[i - 1] = pairInputAmount({
        pair: pair,
        outputAmount: amounts[i],
      });
    }
  }
  const inputAmount: TokenAmount =
    args.tradeType == TradeType.EXACT_INPUT ? args.amount : amounts[0];
  const outputAmount: TokenAmount =
    args.tradeType == TradeType.EXACT_OUTPUT
      ? args.amount
      : amounts[amounts.length - 1];

  if (currencyEquals({ currency: args.route.input.currency, other: ETHER })) {
    inputAmount.token.currency = ETHER;
  }
  if (currencyEquals({ currency: args.route.output.currency, other: ETHER })) {
    outputAmount.token.currency = ETHER;
  }

  return {
    inputAmount: inputAmount,
    outputAmount: outputAmount,
    route: args.route,
    tradeType: args.tradeType,
  };
}

// The average price that the trade would execute at.
export function tradeExecutionPrice(args: Args_tradeExecutionPrice): string {
  const trade: Trade = args.trade;
  const executionPrice = new Price(
    trade.inputAmount.token,
    trade.outputAmount.token,
    trade.inputAmount.amount,
    trade.outputAmount.amount
  );
  return executionPrice.toFixed(18);
}

// What the new mid price would be if the trade were to execute.
export function tradeNextMidPrice(args: Args_tradeNextMidPrice): string {
  const trade: Trade = args.trade;
  return routeMidPrice({
    route: trade.route,
  });
}

// The slippage incurred by the trade. (strictly > 0.30%)
// result is a percent like 100.0%
export function tradeSlippage(args: Args_tradeSlippage): string {
  const trade: Trade = args.trade;
  const price: Price = midPrice(trade.route);
  // compute price impact
  const argsFraction: Fraction = new Fraction(trade.inputAmount.amount);
  const outputFraction: Fraction = new Fraction(trade.outputAmount.amount);
  const exactQuote: Fraction = price.raw().mul(argsFraction);
  const slippage = exactQuote.sub(outputFraction).div(exactQuote);
  return slippage.toFixed(18);
}

export function tradeMinimumAmountOut(
  args: Args_tradeMinimumAmountOut
): TokenAmount {
  const trade: Trade = args.trade;
  const slippageTolerance = Fraction.fromString(args.slippageTolerance);

  if (slippageTolerance.lt(new Fraction(BigInt.ZERO))) {
    throw new RangeError("slippage tolerance cannot be less than zero");
  }
  if (trade.tradeType == TradeType.EXACT_OUTPUT) {
    return trade.outputAmount;
  } else {
    const biOutAmt = trade.outputAmount.amount;
    const slippageAdjustedAmountOut = new Fraction(BigInt.ONE)
      .add(slippageTolerance)
      .invert()
      .mul(new Fraction(biOutAmt))
      .quotient();
    return {
      token: trade.outputAmount.token,
      amount: slippageAdjustedAmountOut,
    };
  }
}

export function tradeMaximumAmountIn(
  args: Args_tradeMaximumAmountIn
): TokenAmount {
  const trade: Trade = args.trade;
  const slippageTolerance = Fraction.fromString(args.slippageTolerance);

  if (slippageTolerance.lt(new Fraction(BigInt.ZERO))) {
    throw new RangeError("slippage tolerance cannot be less than zero");
  }
  if (trade.tradeType == TradeType.EXACT_INPUT) {
    return trade.inputAmount;
  } else {
    const biInputAmt = trade.inputAmount.amount;
    const slippageAdjustedAmountIn = new Fraction(BigInt.ONE)
      .add(slippageTolerance)
      .mul(new Fraction(biInputAmt))
      .quotient();
    return {
      token: trade.inputAmount.token,
      amount: slippageAdjustedAmountIn,
    };
  }
}

/* Given a list of pairs, a fixed amount in, and token amount out, this method
 returns the best maxNumResults trades that swap an args token amount to an
 output token, making at most maxHops hops. The returned trades are sorted by
 output amount, in decreasing order, and all share the given args amount. */
export function bestTradeExactIn(args: Args_bestTradeExactIn): Trade[] {
  const pairs: Pair[] = args.pairs;
  const amountIn: TokenAmount = args.amountIn;
  const tokenOut: Token = args.tokenOut;
  const options: TradeOptions = new TradeOptions(args.options);
  if (pairs.length == 0) {
    throw new Error("Pairs array is empty");
  }
  if (options.maxHops == 0) {
    throw new Error("maxHops must be greater than zero");
  }

  const bestTrades = _bestTradeExactIn(pairs, amountIn, tokenOut, options);
  if (options.maxNumResults) {
    return bestTrades.toArray().slice(0, options.maxNumResults);
  } else {
    return bestTrades.toArray();
  }
}

/* Similar to the above method, but targets a fixed output token amount. The
 returned trades are sorted by args amount, in increasing order, and all share
 the given output amount. */
export function bestTradeExactOut(args: Args_bestTradeExactOut): Trade[] {
  const pairs: Pair[] = args.pairs;
  const tokenIn: Token = args.tokenIn;
  const amountOut: TokenAmount = args.amountOut;
  const options: TradeOptions = new TradeOptions(args.options);
  if (pairs.length == 0) {
    throw new Error("Pairs array is empty");
  }
  if (options.maxHops == 0) {
    throw new Error("maxHops must be greater than zero");
  }

  const bestTrades = _bestTradeExactOut(pairs, tokenIn, amountOut, options);
  if (options.maxNumResults) {
    return bestTrades.toArray().slice(0, options.maxNumResults);
  } else {
    return bestTrades.toArray();
  }
}

function _bestTradeExactIn(
  pairs: Pair[],
  amountIn: TokenAmount,
  currencyOut: Token,
  options: TradeOptions,
  currentPairs: Pair[] = [],
  originalAmountIn: TokenAmount = copyTokenAmount(amountIn),
  bestTrades: PriorityQueue<Trade> = new PriorityQueue<Trade>(tradeComparator)
): PriorityQueue<Trade> {
  const sameTokenAmount = tokenAmountEquals({
    tokenAmount0: originalAmountIn,
    tokenAmount1: amountIn,
  });
  if (!sameTokenAmount && currentPairs.length == 0) {
    throw new Error("Recursion error: invariants are false");
  }
  amountIn.token = wrapIfEther(amountIn.token);
  const tokenOut: Token = wrapIfEther(currencyOut);
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];

    const isToken0 = tokenEquals({
      token: amountIn.token,
      other: pair.tokenAmount0.token,
    });
    const isToken1 = tokenEquals({
      token: amountIn.token,
      other: pair.tokenAmount1.token,
    });
    if (!isToken0 && !isToken1) continue;

    const biTokenAmt0 = pair.tokenAmount0.amount;
    const biTokenAmt1 = pair.tokenAmount1.amount;
    if (biTokenAmt0.isZero() || biTokenAmt1.isZero()) continue;
    const biAmtIn = amountIn.amount;
    if (biAmtIn.isZero()) continue;

    const amountOutToken = isToken0
      ? pair.tokenAmount1.token
      : pair.tokenAmount0.token;
    if (tokenEquals({ token: amountOutToken, other: tokenOut })) {
      const newTrade = createTrade({
        route: createRoute({
          pairs: currentPairs.concat([pair]),
          input: originalAmountIn.token,
          output: currencyOut,
        }),
        amount: originalAmountIn,
        tradeType: TradeType.EXACT_INPUT,
      });
      bestTrades.insert(newTrade);
    } else if (options.maxHops > 1 && pairs.length > 1) {
      const amountOut: TokenAmount = pairOutputAmount({
        pair: pair,
        inputAmount: amountIn,
      });
      const otherPairs = pairs.slice(0, i).concat(pairs.slice(i + 1));
      _bestTradeExactIn(
        otherPairs,
        amountOut,
        currencyOut,
        new TradeOptions({
          maxNumResults: new Option(options.maxNumResults),
          maxHops: new Option(options.maxHops - 1),
        }),
        currentPairs.concat([pair]),
        originalAmountIn,
        bestTrades
      );
    }
  }

  return bestTrades;
}

function _bestTradeExactOut(
  pairs: Pair[],
  currencyIn: Token,
  amountOut: TokenAmount,
  options: TradeOptions,
  currentPairs: Pair[] = [],
  originalAmountOut: TokenAmount = copyTokenAmount(amountOut),
  bestTrades: PriorityQueue<Trade> = new PriorityQueue<Trade>(tradeComparator)
): PriorityQueue<Trade> {
  const sameTokenAmount = tokenAmountEquals({
    tokenAmount0: originalAmountOut,
    tokenAmount1: amountOut,
  });
  if (!sameTokenAmount && currentPairs.length == 0) {
    throw new Error("Recursion error: invariants are false");
  }
  const tokenIn: Token = wrapIfEther(currencyIn);
  amountOut.token = wrapIfEther(amountOut.token);
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];

    const isToken0 = tokenEquals({
      token: amountOut.token,
      other: pair.tokenAmount0.token,
    });
    const isToken1 = tokenEquals({
      token: amountOut.token,
      other: pair.tokenAmount1.token,
    });
    if (!isToken0 && !isToken1) continue;

    const biTokenAmt0 = pair.tokenAmount0.amount;
    const biTokenAmt1 = pair.tokenAmount1.amount;
    if (biTokenAmt0.eq(BigInt.ZERO) || biTokenAmt1.eq(BigInt.ZERO)) continue;
    const biAmtOut = amountOut.amount;
    if (biAmtOut.eq(BigInt.ZERO)) continue;

    if (isToken0) {
      if (biTokenAmt0.lt(biAmtOut)) {
        continue;
      }
    } else {
      if (biTokenAmt1.lt(biAmtOut)) {
        continue;
      }
    }
    const amountInToken = isToken0
      ? pair.tokenAmount1.token
      : pair.tokenAmount0.token;
    if (tokenEquals({ token: amountInToken, other: tokenIn })) {
      const newTrade: Trade = createTrade({
        route: createRoute({
          pairs: [pair].concat(currentPairs),
          output: originalAmountOut.token,
          input: currencyIn,
        }),
        amount: originalAmountOut,
        tradeType: TradeType.EXACT_OUTPUT,
      });
      bestTrades.insert(newTrade);
    } else if (options.maxHops > 1 && pairs.length > 1) {
      const amountIn: TokenAmount = pairInputAmount({
        pair: pair,
        outputAmount: amountOut,
      });
      const otherPairs = pairs.slice(0, i).concat(pairs.slice(i + 1));
      _bestTradeExactOut(
        otherPairs,
        currencyIn,
        amountIn,
        new TradeOptions({
          maxNumResults: new Option(options.maxNumResults),
          maxHops: new Option(options.maxHops - 1),
        }),
        [pair].concat(currentPairs),
        originalAmountOut,
        bestTrades
      );
    }
  }
  return bestTrades;
}

function computePriceImpact(trade: Trade): BigFloat {
  const slippage: string = tradeSlippage({ trade });
  return BigFloat.fromString(slippage);
}

export function tradeComparator(b: Trade, a: Trade): i32 {
  const ioCmp = argsOutputComparator(a, b);
  if (ioCmp != 0) {
    return ioCmp;
  }

  const aPriceImpact = computePriceImpact(a);
  const bPriceImpact = computePriceImpact(b);
  if (aPriceImpact.lt(bPriceImpact)) {
    return -1;
  } else if (aPriceImpact.gt(bPriceImpact)) {
    return 1;
  }

  return a.route.path.length - b.route.path.length;
}

export function argsOutputComparator(a: Trade, b: Trade): i32 {
  const aInput = a.inputAmount;
  const bInput = b.inputAmount;
  if (!tokenEquals({ token: aInput.token, other: bInput.token })) {
    throw new Error("To be compared, trades must the same args token");
  }

  const aOutput = a.outputAmount;
  const bOutput = b.outputAmount;
  if (!tokenEquals({ token: aOutput.token, other: bOutput.token })) {
    throw new Error("To be compared, trades must the same output token");
  }

  const aOutputBI = aOutput.amount;
  const bOutputBI = bOutput.amount;
  const aInputBI = aInput.amount;
  const bInputBI = bInput.amount;

  if (aOutputBI.eq(bOutputBI)) {
    if (aInputBI.eq(bInputBI)) {
      return 0;
    }

    if (aInputBI.lt(bInputBI)) {
      return -1;
    } else {
      return 1;
    }
  } else {
    if (aOutputBI.lt(bOutputBI)) {
      return 1;
    } else {
      return -1;
    }
  }
}
