import { ChainId, Currency, Token, TokenAmount } from "../query/w3";
import { currencyEquals } from "../query";

export const ETHER: Currency = {
  decimals: 18,
  name: "Ether",
  symbol: "ETH",
};

export const wethCurrency: Currency = {
  decimals: 18,
  symbol: "WETH",
  name: "Wrapped Ether",
};

export function getWETH9(chainId: ChainId): Token {
  switch (chainId) {
    case ChainId.MAINNET:
      return {
        chainId: ChainId.MAINNET,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        currency: copyCurrency(wethCurrency),
      };
    case ChainId.ROPSTEN:
      return {
        chainId: ChainId.ROPSTEN,
        address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        currency: copyCurrency(wethCurrency),
      };
    case ChainId.RINKEBY:
      return {
        chainId: ChainId.RINKEBY,
        address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        currency: copyCurrency(wethCurrency),
      };
    case ChainId.GOERLI:
      return {
        chainId: ChainId.GOERLI,
        address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        currency: copyCurrency(wethCurrency),
      };
    case ChainId.KOVAN:
      return {
        chainId: ChainId.KOVAN,
        address: "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
        currency: copyCurrency(wethCurrency),
      };
    default:
      throw new Error("Unknown chain ID. This should never happen.");
  }
}

// check if need to wrap ether
export function wrapIfEther(token: Token): Token {
  if (
    currencyEquals({ currencyA: token.currency, currencyB: ETHER }) &&
    token.address == ""
  ) {
    return getWETH9(token.chainId);
  }
  return token;
}

export function copyCurrency(currency: Currency): Currency {
  return {
    name: currency.name,
    symbol: currency.symbol,
    decimals: currency.decimals,
  };
}

export function copyToken(token: Token): Token {
  return {
    chainId: token.chainId,
    address: token.address,
    currency: copyCurrency(token.currency),
  };
}

export function copyTokenAmount(tokenAmount: TokenAmount): TokenAmount {
  return {
    token: copyToken(tokenAmount.token),
    amount: tokenAmount.amount.copy(),
  };
}
