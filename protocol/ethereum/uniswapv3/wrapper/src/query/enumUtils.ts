import {
  Args_feeAmountToTickSpacing,
  Args_getFeeAmount,
  Args_getPermitV,
} from "../wrap";
import {
  _feeAmountToTickSpacing,
  _getFeeAmount,
  _getPermitV,
} from "../utils/enumUtils";

export function feeAmountToTickSpacing(
  args: Args_feeAmountToTickSpacing
): i32 {
  return _feeAmountToTickSpacing(args.feeAmount);
}

export function getFeeAmount(args: Args_getFeeAmount): u32 {
  return _getFeeAmount(args.feeAmount);
}

export function getPermitV(args: Args_getPermitV): i32 {
  return _getPermitV(args.permitV);
}
