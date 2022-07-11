import { BestTradeOptions } from "../wrap";

export class TradeOptions {
  maxNumResults: u32;
  maxHops: u32;

  constructor(options: BestTradeOptions | null) {
    if (options == null) {
      this.maxNumResults = 3;
      this.maxHops = 3;
    } else {
      this.maxNumResults = options.maxNumResults.isNone
        ? 3
        : options.maxNumResults.unwrap();
      this.maxHops = options.maxHops.isNone ? 3 : options.maxHops.unwrap();
    }
  }
}
