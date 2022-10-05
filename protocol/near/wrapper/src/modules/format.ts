import { Args_formatNearAmount, Args_parseNearAmount } from "../wrap";
import * as formatUtils from "../utils/format";

export function parseNearAmount(args: Args_parseNearAmount): String {
  return formatUtils.parseNearAmount(args.amount);
}

export function formatNearAmount(args: Args_formatNearAmount): String {
  return formatUtils.formatNearAmount(args.amount);
}