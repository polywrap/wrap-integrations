import { ChainId, Currency, Token, TokenAmount } from "../../../query/w3";
import { getEther, getWETH, isEther, wrapAmount, wrapToken } from "../../../query";
import { BigInt } from "@web3api/wasm-as";

const Eth: Currency = {
  decimals: 18,
  name: "Ether",
  symbol: "ETH",
};
const WETH: Currency = {
  decimals: 18,
  symbol: "WETH",
  name: "Wrapped Ether",
};
const USDC: Token = {
  chainId: ChainId.MAINNET,
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  currency: {
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
  },
};

describe('Token utils', () => {

  it('getEther', () => {
    expect(getEther({ chainId: ChainId.MAINNET })).toStrictEqual({
      chainId: ChainId.MAINNET,
      address: "",
      currency: Eth,
    });
    expect(getEther({ chainId: ChainId.ROPSTEN })).toStrictEqual({
      chainId: ChainId.ROPSTEN,
      address: "",
      currency: Eth,
    });
    expect(getEther({ chainId: ChainId.RINKEBY })).toStrictEqual({
      chainId: ChainId.RINKEBY,
      address: "",
      currency: Eth,
    });
    expect(getEther({ chainId: ChainId.GOERLI })).toStrictEqual({
      chainId: ChainId.GOERLI,
      address: "",
      currency: Eth,
    });
    expect(getEther({ chainId: ChainId.KOVAN })).toStrictEqual({
      chainId: ChainId.KOVAN,
      address: "",
      currency: Eth,
    });

    const error = (): void => { getEther({ chainId: 7 }) };
    expect(error).toThrow("Unknown chain ID");
  });

  it('getWETH', () => {
    expect(getWETH({ chainId: ChainId.MAINNET })).toStrictEqual({
      chainId: ChainId.MAINNET,
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      currency: WETH,
    });
    expect(getWETH({ chainId: ChainId.ROPSTEN })).toStrictEqual({
      chainId: ChainId.ROPSTEN,
      address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      currency: WETH,
    });
    expect(getWETH({ chainId: ChainId.RINKEBY })).toStrictEqual({
      chainId: ChainId.RINKEBY,
      address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      currency: WETH,
    });
    expect(getWETH({ chainId: ChainId.GOERLI })).toStrictEqual({
      chainId: ChainId.GOERLI,
      address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      currency: WETH,
    });
    expect(getWETH({ chainId: ChainId.KOVAN })).toStrictEqual({
      chainId: ChainId.KOVAN,
      address: "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
      currency: WETH,
    });

    const error = (): void => { getWETH({ chainId: 7 }) };
    expect(error).toThrow("Unknown chain ID");
  });

  it('isEther', () => {
    const ethToken: Token = getEther({ chainId: ChainId.MAINNET });
    expect(isEther({ token: ethToken })).toStrictEqual(true);
    expect(isEther({ token: USDC })).toStrictEqual(false);
  });

  it('wrapToken', () => {
    const ethToken: Token = getEther({ chainId: ChainId.MAINNET });
    expect(wrapToken({ token: ethToken })).toStrictEqual(getWETH({ chainId: ethToken.chainId }));
    expect(wrapToken({ token: USDC })).toStrictEqual(USDC);
  });

  it('wrapAmount', () => {
    const ethAmount: TokenAmount = {
      token: getEther({ chainId: ChainId.MAINNET }),
      amount: BigInt.fromUInt16(100),
    };
    const wethAmount: TokenAmount = {
      token: getWETH({ chainId: ethAmount.token.chainId }),
      amount: BigInt.fromUInt16(100),
    };
    expect(wrapAmount({ amount: ethAmount })).toStrictEqual(wethAmount);

    const USDCAmount: TokenAmount = {
      token: USDC,
      amount: BigInt.fromUInt16(100),
    };
    expect(wrapAmount({ amount: USDCAmount })).toStrictEqual(USDCAmount);
  });

});