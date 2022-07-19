import {
  Currency,
  Args_currencyEquals,
  Args_tokenAmountEquals,
  Args_tokenEquals,
  Args_tokenSortsBefore,
  Token,
  TokenAmount,
} from "../wrap";

// Checks if the current instance is equal to another (has an identical chainId and address).
export function currencyEquals(args: Args_currencyEquals): boolean {
  const currency: Currency = args.currency;
  const other: Currency = args.other;
  return (
    currency.name == other.name &&
    currency.symbol == other.symbol &&
    currency.decimals == other.decimals
  );
}

// Checks if the current instance is equal to another (has an identical chainId and address).
export function tokenEquals(args: Args_tokenEquals): boolean {
  const token: Token = args.token;
  const other: Token = args.other;
  return token.chainId == other.chainId && token.address == other.address;
}

// compares two TokenAmount types for equality, returning true if they have the
// same token and same amount
export function tokenAmountEquals(args: Args_tokenAmountEquals): boolean {
  const amt0: TokenAmount = args.tokenAmount0;
  const amt1: TokenAmount = args.tokenAmount1;
  return (
    tokenEquals({ token: amt0.token, other: amt1.token }) &&
    amt0.amount == amt1.amount
  );
}

// Checks if the current instance sorts before another, by address.
export function tokenSortsBefore(args: Args_tokenSortsBefore): boolean {
  const token: Token = args.token;
  const other: Token = args.other;
  const tokenAddress: string = token.address.toLowerCase();
  const otherAddress: string = other.address.toLowerCase();
  return tokenAddress.localeCompare(otherAddress) < 0;
}
