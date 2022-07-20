import {Args_currentTimestamp, DateTime_Module} from "./wrap";
import { BigInt } from "@polywrap/wasm-as";

export function currentTimestamp(_: Args_currentTimestamp): BigInt {
  return DateTime_Module.currentTimestamp({}).unwrap();
}
