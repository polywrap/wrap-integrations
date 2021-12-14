import { ChainId, FeeAmount, MethodParameters, Pool, Token, Trade, TradeType } from "../../../query/w3";
import {
  createPool,
  createRoute,
  createTradeFromRoute,
  encodeSqrtRatioX96,
  getTickAtSqrtRatio,
  nearestUsableTick,
  quoteCallParameters
} from "../../../query";
import { BigInt } from "@web3api/wasm-as";
import { getWETH } from "../../../utils/tokenUtils";
import { MAX_TICK, MIN_TICK } from "../../../utils/constants";
import { getTickSpacings } from "../../../utils/enumUtils";

const token0: Token = {
  chainId: ChainId.MAINNET,
  address: "0x0000000000000000000000000000000000000001",
  currency: {
    decimals: 18,
    symbol: "t0",
    name: "token0",
  }
}
const token1: Token = {
  chainId: ChainId.MAINNET,
  address: "0x0000000000000000000000000000000000000002",
  currency: {
    decimals: 18,
    symbol: "t1",
    name: "token1",
  }
}
const feeAmount: FeeAmount = FeeAmount.MEDIUM;
const sqrtRatioX96: BigInt = encodeSqrtRatioX96({ amount1: BigInt.ONE, amount0: BigInt.ONE });
const liquidity: BigInt = BigInt.fromUInt32(1_000_000);
const WETH: Token = getWETH(ChainId.MAINNET);

const makePool = (token0: Token, token1: Token): Pool => {
  return createPool({
    tokenA: token0,
    tokenB: token1,
    fee: feeAmount,
    sqrtRatioX96,
    liquidity,
    tickCurrent: getTickAtSqrtRatio({ sqrtRatioX96 }),
    ticks: {
      ticks: [
        {
          index: nearestUsableTick({ tick: MIN_TICK, tickSpacing: getTickSpacings(feeAmount) }),
          liquidityNet: liquidity,
          liquidityGross: liquidity,
        },
        {
          index: nearestUsableTick({ tick: MAX_TICK, tickSpacing: getTickSpacings(feeAmount) }),
          liquidityNet: liquidity.opposite(),
          liquidityGross: liquidity,
        }
      ]},
  })
};

const pool_0_1 = makePool(token0, token1);
const pool_1_weth = makePool(token1, WETH);

describe('SwapQuoter', () => {
  describe('#swapCallParameters', () => {
    describe('single trade input', () => {
      it('single-hop exact input', () => {
        const trade: Trade = createTradeFromRoute({
          tradeRoute: {
            route: createRoute({
              pools: [pool_0_1],
              inToken: token0,
              outToken: token1,
            }),
            amount: {
              token: token0,
              amount: BigInt.fromUInt16(100),
            }
          },
          tradeType: TradeType.EXACT_INPUT,
        });
        const params: MethodParameters = quoteCallParameters({
          route: trade.swaps[0].route,
          amount: trade.inputAmount,
          tradeType: trade.tradeType,
          options: null,
        });

        expect(params.calldata).toStrictEqual(
          '0xf7729d43000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000bb800000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000000'
        );
        expect(params.value).toStrictEqual('0x00');
      });

      it('single-hop exact output', () => {
        const trade: Trade = createTradeFromRoute({
          tradeRoute: {
            route: createRoute({
              pools: [pool_0_1],
              inToken: token0,
              outToken: token1,
            }),
            amount: {
              token: token1,
              amount: BigInt.fromUInt16(100),
            }
          },
          tradeType: TradeType.EXACT_OUTPUT,
        });
        const params: MethodParameters = quoteCallParameters({
          route: trade.swaps[0].route,
          amount: trade.outputAmount,
          tradeType: trade.tradeType,
          options: null,
        });

        expect(params.calldata).toBe(
          '0x30d07f21000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000bb800000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000000'
        );
        expect(params.value).toBe('0x00');
      });

      it('multi-hop exact input', () => {
        const trade: Trade = createTradeFromRoute({
          tradeRoute: {
            route: createRoute({
              pools: [pool_0_1, pool_1_weth],
              inToken: token0,
              outToken: WETH,
            }),
            amount: {
              token: token0,
              amount: BigInt.fromUInt16(100),
            }
          },
          tradeType: TradeType.EXACT_INPUT,
        });
        const params: MethodParameters = quoteCallParameters({
          route: trade.swaps[0].route,
          amount: trade.inputAmount,
          tradeType: trade.tradeType,
          options: null,
        });

        expect(params.calldata).toBe(
          '0xcdca17530000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000'
        );
        expect(params.value).toBe('0x00');
      });

      it('multi-hop exact output', () => {
        const trade: Trade = createTradeFromRoute({
          tradeRoute: {
            route: createRoute({
              pools: [pool_0_1, pool_1_weth],
              inToken: token0,
              outToken: WETH,
            }),
            amount: {
              token: WETH,
              amount: BigInt.fromUInt16(100),
            }
          },
          tradeType: TradeType.EXACT_OUTPUT,
        });
        const params: MethodParameters = quoteCallParameters({
          route: trade.swaps[0].route,
          amount: trade.outputAmount,
          tradeType: trade.tradeType,
          options: null,
        });

        expect(params.calldata).toBe(
          '0x2f80bb1d000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000042c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb80000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000'
        );
        expect(params.value).toBe('0x00');
      });

      it('sqrtPriceLimitX96', () => {
        const trade: Trade = createTradeFromRoute({
          tradeRoute: {
            route: createRoute({
              pools: [pool_0_1],
              inToken: token0,
              outToken: token1,
            }),
            amount: {
              token: token0,
              amount: BigInt.fromUInt16(100),
            }
          },
          tradeType: TradeType.EXACT_INPUT,
        });
        const params: MethodParameters = quoteCallParameters({
          route: trade.swaps[0].route,
          amount: trade.inputAmount,
          tradeType: trade.tradeType,
          options: {
            sqrtPriceLimitX96: BigInt.ONE.mulPowTwo(128),
          },
        });

        expect(params.calldata).toBe(
          '0xf7729d43000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000bb800000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000100000000000000000000000000000000'
        );
        expect(params.value).toBe('0x00');
      });
    });
  });
});
