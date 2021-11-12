import { FeeAmount } from "../query/w3";

export function getFeeAmount(feeAmount: FeeAmount): u32 {
  switch(feeAmount) {
    case FeeAmount.LOWEST:
      return 100;
    case FeeAmount.LOW:
      return 500;
    case FeeAmount.MEDIUM:
      return 3000;
    case FeeAmount.HIGH:
      return 10000;
    default:
      throw new Error("Unknown FeeAmount");
  }
}

export function getTickSpacings(feeAmount: FeeAmount): u32 {
  switch(feeAmount) {
    case FeeAmount.LOWEST:
      return 1;
    case FeeAmount.LOW:
      return 10;
    case FeeAmount.MEDIUM:
      return 60;
    case FeeAmount.HIGH:
      return 200;
    default:
      throw new Error("Unknown FeeAmount");
  }
}