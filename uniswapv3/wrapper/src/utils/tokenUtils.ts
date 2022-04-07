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

export function _getEther(chainId: ChainId): Token {
  if (chainId < ChainId.MAINNET || chainId > ChainId.ARBITRUM_ONE_RINKEBY) {
    throw new Error("Unknown chain ID");
  }
  return {
    chainId: chainId,
    address: "",
    currency: copyCurrency(ETHER),
  };
}

export function _getWETH(chainId: ChainId): Token {
  let address: string;
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
    case ChainId.OPTIMISM_KOVAN:
      address = "0x4200000000000000000000000000000000000006";
      break;
    case ChainId.ARBITRUM_ONE:
      address = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
      break;
    case ChainId.ARBITRUM_ONE_RINKEBY:
      address = "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681";
      break;
    default:
      throw new Error("Unknown chain ID");
  }
  return {
    chainId: chainId,
    address: address,
    currency: copyCurrency(wethCurrency),
  };
}

export function _isEther(token: Token): boolean {
  return (
    currencyEquals({ currencyA: token.currency, currencyB: ETHER }) &&
    token.address == ""
  );
}

// check if need to wrap ether
export function _wrapToken(token: Token): Token {
  if (_isEther(token)) {
    return _getWETH(token.chainId);
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
