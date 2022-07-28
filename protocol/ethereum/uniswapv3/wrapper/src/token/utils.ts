import {
  Args_getNative,
  Args_getWrappedNative,
  Args_isNative,
  Args_wrapToken,
  Args_wrapAmount,
  Token,
  TokenAmount,
  ChainId,
  Currency,
} from "../wrap";
import { currencyEquals } from "./index";

export function getNative(args: Args_getNative): Token {
  return _getNative(args.chainId);
}

export function getWrappedNative(args: Args_getWrappedNative): Token {
  return _getWrappedNative(args.chainId);
}

export function isNative(args: Args_isNative): boolean {
  return _isNative(args.token);
}

export function wrapToken(args: Args_wrapToken): Token {
  return _wrapToken(args.token);
}

export function wrapAmount(args: Args_wrapAmount): TokenAmount {
  return _wrapAmount(args.amount);
}

export const ETHER: Currency = {
  decimals: 18,
  name: "Ether",
  symbol: "ETH",
};

export const wEthCurrency: Currency = {
  decimals: 18,
  name: "Wrapped Ether",
  symbol: "WETH",
};

export const MATIC: Currency = {
  decimals: 18,
  name: "Matic",
  symbol: "MATIC",
};
export const mMATIC: Currency = {
  name: "Polygon Mumbai Matic",
  symbol: "mMATIC",
  decimals: 18,
};

export const wMaticCurrency: Currency = {
  decimals: 18,
  name: "Wrapped MATIC",
  symbol: "WMATIC",
};

export function _getNative(chainId: ChainId): Token {
  if (chainId < 0 || chainId >= ChainId._MAX_) {
    throw new Error("Unknown chain ID");
  }
  let currency: Currency;
  if (chainId == ChainId.POLYGON) {
    currency = copyCurrency(MATIC);
  } else if (chainId == ChainId.POLYGON_MUMBAI) {
    currency = copyCurrency(mMATIC);
  } else {
    currency = copyCurrency(ETHER);
  }
  return {
    chainId: chainId,
    address: "",
    currency: currency,
  };
}

export function _getWrappedNative(chainId: ChainId): Token {
  let address: string = "";
  switch (chainId) {
    case ChainId.MAINNET:
      address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      break;
    case ChainId.ROPSTEN:
    case ChainId.RINKEBY:
      address = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
      break;
    case ChainId.GOERLI:
      address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
      break;
    case ChainId.KOVAN:
      address = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";
      break;
    case ChainId.OPTIMISM:
    case ChainId.OPTIMISTIC_KOVAN:
      address = "0x4200000000000000000000000000000000000006";
      break;
    case ChainId.ARBITRUM_ONE:
      address = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
      break;
    case ChainId.ARBITRUM_RINKEBY:
      address = "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681";
      break;
    case ChainId.POLYGON:
      return {
        chainId: ChainId.POLYGON,
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        currency: copyCurrency(wMaticCurrency),
      };
    case ChainId.POLYGON_MUMBAI:
      return {
        chainId: ChainId.POLYGON_MUMBAI,
        address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        currency: copyCurrency(wMaticCurrency),
      };
    default:
      throw new Error("Unknown chain ID");
  }

  return {
    chainId: chainId,
    address: address,
    currency: copyCurrency(wEthCurrency),
  };
}

export function _isNative(token: Token): boolean {
  if (token.address != "") {
    return false;
  }
  if (token.chainId == ChainId.POLYGON) {
    return currencyEquals({ currencyA: token.currency, currencyB: MATIC });
  } else if (token.chainId == ChainId.POLYGON_MUMBAI) {
    return currencyEquals({ currencyA: token.currency, currencyB: mMATIC });
  }
  return currencyEquals({ currencyA: token.currency, currencyB: ETHER });
}

// check if need to wrap ether
export function _wrapToken(token: Token): Token {
  if (_isNative(token)) {
    return _getWrappedNative(token.chainId);
  }
  return token;
}

// check if need to wrap ether
export function _wrapAmount(tokenAmount: TokenAmount): TokenAmount {
  return {
    token: _wrapToken(tokenAmount.token),
    amount: tokenAmount.amount,
  };
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
