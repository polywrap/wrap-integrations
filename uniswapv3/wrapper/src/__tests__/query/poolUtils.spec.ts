import { ChainId, FeeAmount, Token } from "../../query/w3";
import { computePoolAddress } from "../../query/poolUtils";

const factoryAddress = '0x1111111111111111111111111111111111111111';

const USDC: Token = {
  chainId: ChainId.MAINNET,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  currency: {
    decimals: 18,
    symbol: 'USDC',
    name: 'USD Coin',
  }
};

const DAI: Token = {
  chainId: ChainId.MAINNET,
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  currency: {
    decimals: 18,
    symbol: 'DAI',
    name: 'DAI Stablecoin',
  }
};

describe('computePoolAddress', () => {

  it('should correctly compute the pool address', () => {
    const result: string = computePoolAddress({
      factoryAddress: factoryAddress,
      fee: FeeAmount.LOW,
      tokenA: USDC,
      tokenB: DAI,
      initCodeHashManualOverride: null,
    })
    expect(result).toStrictEqual('0x90B1b09A9715CaDbFD9331b3A7652B24BfBEfD32');
  })

  it('computes correct pool address regardless of token order', () => {
    const resultA: string = computePoolAddress({
      factoryAddress: factoryAddress,
      fee: FeeAmount.LOW,
      tokenA: USDC,
      tokenB: DAI,
      initCodeHashManualOverride: null,
    })
    const resultB: string = computePoolAddress({
      factoryAddress: factoryAddress,
      fee: FeeAmount.LOW,
      tokenA: DAI,
      tokenB: USDC,
      initCodeHashManualOverride: null,
    })
    expect(resultA).toStrictEqual(resultB)
  })
})