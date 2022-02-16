import {
  w3_invoke_args,
  w3_invoke,
  w3_load_env,
  w3_sanitize_env,
  w3_abort,
  InvokeArgs
} from "@web3api/wasm-as";

import {
  getAssetDataWrapped,
  listAssetsWrapped,
  getCandleWrapped,
  listProvidersWrapped,
  getNormalizedPriceWrapped
} from "./Query/wrapped";

export function _w3_invoke(method_size: u32, args_size: u32): bool {
  const args: InvokeArgs = w3_invoke_args(
    method_size,
    args_size
  );

  if (args.method == "getAssetData") {
    return w3_invoke(args, getAssetDataWrapped);
  }
  else if (args.method == "listAssets") {
    return w3_invoke(args, listAssetsWrapped);
  }
  else if (args.method == "getCandle") {
    return w3_invoke(args, getCandleWrapped);
  }
  else if (args.method == "listProviders") {
    return w3_invoke(args, listProvidersWrapped);
  }
  else if (args.method == "getNormalizedPrice") {
    return w3_invoke(args, getNormalizedPriceWrapped);
  }
  else {
    return w3_invoke(args, null);
  }
}

export function w3Abort(
  msg: string | null,
  file: string | null,
  line: u32,
  column: u32
): void {
  w3_abort(
    msg ? msg : "",
    file ? file : "",
    line,
    column
  );
}
