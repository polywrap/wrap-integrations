import {
  Input_getEther,
  Input_getWETH,
  Input_isEther,
  Input_wrapToken,
  Input_wrapAmount,
  Token,
  TokenAmount,
} from "./w3";
import {
  _getEther,
  _getWETH,
  _isEther,
  _wrapAmount,
  _wrapToken,
} from "../utils/tokenUtils";

export function getEther(input: Input_getEther): Token {
  return _getEther(input.chainId);
}

export function getWETH(input: Input_getWETH): Token {
  return _getWETH(input.chainId);
}

export function isEther(input: Input_isEther): boolean {
  return _isEther(input.token);
}

export function wrapToken(input: Input_wrapToken): Token {
  return _wrapToken(input.token);
}

export function wrapAmount(input: Input_wrapAmount): TokenAmount {
  return _wrapAmount(input.amount);
}
