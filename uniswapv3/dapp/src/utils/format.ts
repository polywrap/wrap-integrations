import Decimal from 'decimal.js-light'

export function toSignificant(tokenAmount?: W3TokenAmount, sd = 6): string | undefined {
  if (!tokenAmount) {
    return undefined
  }
  const numerator = new Decimal(tokenAmount.amount)
  const denominator = new Decimal(10).pow(tokenAmount.token.currency.decimals)
  return numerator
    .div(denominator)
    .toSignificantDigits(sd)
    .toString()
}

export function toExact(tokenAmount?: W3TokenAmount): string | undefined {
  if (!tokenAmount) {
    return undefined
  }
  const numerator = new Decimal(tokenAmount.amount)
  const denominator = new Decimal(10).pow(tokenAmount.token.currency.decimals)
  return numerator.div(denominator).toString()
}
