import {
  wrap_subinvoke,
  wrap_subinvokeImplementation,
  Nullable,
  BigInt,
  BigNumber,
  JSON,
  Result
} from "@polywrap/wasm-as";
import {
  serializelogArgs,
  deserializelogResult,
  Input_log
} from "./serialization";
import * as Types from "../..";

export class Interface_Module {

  public static interfaceUri: string = "wrap://ens/logger.core.polywrap.eth";

  public uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  public log(
    input: Input_log
  ): Result<bool, string> {
    const args = serializelogArgs(input);
    const result = wrap_subinvokeImplementation(
      "wrap://ens/logger.core.polywrap.eth",
      this.uri,
      "log",
      args
    );

    if (result.isErr) {
      return Result.Err<bool, string>(
        result.unwrapErr()
      );
    }

    return Result.Ok<bool, string>(
      deserializelogResult(result.unwrap())
    );
  }
}
