import { ChainId, Input_priceToClosestTick, Input_tickToPrice, Token } from "../../../query/w3";
import { priceToClosestTick, tickToPrice } from "../../../query";
import { BigFloat } from "as-bigfloat";
import Price from "../../../utils/Price";
import { BigInt } from "@web3api/wasm-as";

/**
 * Creates an example token with a specific sort order
 */
function token(sortOrder: i32, decimals: u8 = 18, chainId: ChainId = ChainId.MAINNET): Token {
  if (sortOrder > 9 || sortOrder % 1 !== 0) throw new Error('invalid sort order');
  return {
    chainId: chainId,
    address: `0x${new Array<string>(40).fill(`${sortOrder}`).join('')}`,
    currency: {
      decimals: decimals,
      symbol: `T${sortOrder}`,
      name: `token${sortOrder}`,
    },
  };
}

function reciprocal(baseToken: Token, quoteToken: Token, tick: i32): i32 {
  const tickToPriceInput: Input_tickToPrice = {
    baseToken: baseToken,
    quoteToken: quoteToken,
    tick: tick,
  };
  const priceToTickInput: Input_priceToClosestTick = {
    baseToken: baseToken,
    quoteToken: quoteToken,
    price: tickToPrice(tickToPriceInput),
  };
  return priceToClosestTick(priceToTickInput);
}

const token0: Token = token(0);
const token1: Token = token(1);
const token2_6decimals: Token = token(2, 6);

describe('priceTickConversions', () => {

  describe('tickToPrice', () => {

    it('1800 t0/1 t1', () => {
      const price: string = tickToPrice({ baseToken: token1, quoteToken: token0, tick: -74959 });
      const result: string = BigFloat.fromString(price).toSignificant(5);
      expect(result).toStrictEqual('1800.0');
    });

    it('1 t1/1800 t0', () => {
      const price: string = tickToPrice({ baseToken: token0, quoteToken: token1, tick: -74959 });
      const result: string = BigFloat.fromString(price).toSignificant(8);
      expect(result).toStrictEqual('0.00055556');
    });

    it('1800 t1/1 t0', () => {
      const price: string = tickToPrice({ baseToken: token0, quoteToken: token1, tick: 74959 });
      const result: string = BigFloat.fromString(price).toSignificant(5);
      expect(result).toStrictEqual('1800.0');
    });

    it('1 t0/1800 t1', () => {
      const price: string = tickToPrice({ baseToken: token1, quoteToken: token0, tick: 74959 });
      const result: string = BigFloat.fromString(price).toSignificant(8);
      expect(result).toStrictEqual('0.00055556');
    });

    describe('12 decimal difference', () => {

      it('1.01 t2/1 t0', () => {
        const price: string = tickToPrice({ baseToken: token0, quoteToken: token2_6decimals, tick: -276225 });
        const result: string = BigFloat.fromString(price).toSignificant(3);
        expect(result).toStrictEqual('1.01');
      });

      it('1 t0/1.01 t2', () => {
        const price: string = tickToPrice({ baseToken: token2_6decimals, quoteToken: token0, tick: -276225 });
        const result: string = BigFloat.fromString(price).toSignificant(5);
        expect(result).toStrictEqual('0.99015');
      });

      it('1 t2/1.01 t0', () => {
        const price: string = tickToPrice({ baseToken: token0, quoteToken: token2_6decimals, tick: -276423 });
        const result: string = BigFloat.fromString(price).toSignificant(5);
        expect(result).toStrictEqual('0.99015');
      });

      it('1.01 t0/1 t2', () => {
        const price: string = tickToPrice({ baseToken: token2_6decimals, quoteToken: token0, tick: -276423 });
        const result: string = BigFloat.fromString(price).toSignificant(5);
        expect(result).toStrictEqual('1.0099');
      });

      it('1.01 t2/1 t0', () => {
        const price: string = tickToPrice({ baseToken: token0, quoteToken: token2_6decimals, tick: -276225 });
        const result: string = BigFloat.fromString(price).toSignificant(3);
        expect(result).toStrictEqual('1.01');
      });
    });
  });

  describe('priceToClosestTick', () => {

    it('1800 t0/1 t1', () => {
      // mine: 1800.000000000000000000
      // real: 1800.000000000000000000
      const price: string = new Price(token1, token0, BigInt.ONE, BigInt.fromString("1800")).toFixed(18);
      const input: Input_priceToClosestTick = { baseToken: token1, quoteToken: token0, price };
      expect(priceToClosestTick(input)).toStrictEqual(-74960);
    });

    it('1 t1/1800 t0', () => {
      // mine: 0.000555555555555556
      // real: 0.000555555555555556
      const price: string = new Price(token0, token1, BigInt.fromString("1800"), BigInt.ONE).toFixed(18);
      const input: Input_priceToClosestTick = { baseToken: token0, quoteToken: token1, price };
      expect(priceToClosestTick(input)).toStrictEqual(-74960);
    });

    it('1.01 t2/1 t0', () => {
      // mine:  1.010000000000000000
      // real: 1010000000000.000000000000000000
      const price: string = new Price(token0, token2_6decimals, BigInt.fromString("100000000000000000000"), BigInt.fromString("101000000")).toFixed(18);
      const input: Input_priceToClosestTick = { baseToken: token0, quoteToken: token2_6decimals, price };
      expect(priceToClosestTick(input)).toStrictEqual(-276225);
    });

    it('1 t0/1.01 t2', () => {
      // mine: 0.990099009900990099
      // real: 0.000000000000990099
      const price: string = new Price(token2_6decimals, token0, BigInt.fromString("101000000"), BigInt.fromString("100000000000000000000")).toFixed(18);
      const input: Input_priceToClosestTick = { baseToken: token2_6decimals, quoteToken: token0, price };
      expect(priceToClosestTick(input)).toStrictEqual(-276225);
    });

    describe('reciprocal with tickToPrice', () => {

      it('1800 t0/1 t1', () => {
        const baseToken: Token = token1;
        const quoteToken: Token = token0;
        const tick: i32 = -74960;
        expect(reciprocal(baseToken, quoteToken, tick)).toStrictEqual(tick);
      });

      it('1 t0/1800 t1', () => {
        const baseToken: Token = token1;
        const quoteToken: Token = token0;
        const tick: i32 = 74960;
        expect(reciprocal(baseToken, quoteToken, tick)).toStrictEqual(tick);
      })

      it('1 t1/1800 t0', () => {
        const baseToken: Token = token0;
        const quoteToken: Token = token1;
        const tick: i32 = -74960;
        expect(reciprocal(baseToken, quoteToken, tick)).toStrictEqual(tick);
      })

      it('1800 t1/1 t0', () => {
        const baseToken: Token = token0;
        const quoteToken: Token = token1;
        const tick: i32 = 74960;
        expect(reciprocal(baseToken, quoteToken, tick)).toStrictEqual(tick);
      })

      it('1.01 t2/1 t0', () => {
        const baseToken: Token = token0;
        const quoteToken: Token = token2_6decimals;
        const tick: i32 = -276225;
        expect(reciprocal(baseToken, quoteToken, tick)).toStrictEqual(tick);
      })

      it('1 t0/1.01 t2', () => {
        const baseToken: Token = token2_6decimals;
        const quoteToken: Token = token0;
        const tick: i32 = -276225;
        expect(reciprocal(baseToken, quoteToken, tick)).toStrictEqual(tick);
      })
    })
  })
})