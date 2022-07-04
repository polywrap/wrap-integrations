import {
  wrap_invoke_args,
  wrap_invoke,
  wrap_load_env,
  wrap_sanitize_env,
  wrap_abort,
  InvokeArgs
} from "@polywrap/wasm-as";

import {
  debugWrapped,
  infoWrapped,
  warnWrapped,
  errorWrapped,
  logWrapped
} from "./Module/wrapped";

export function _wrap_invoke(method_size: u32, args_size: u32): bool {
  const args: InvokeArgs = wrap_invoke_args(
    method_size,
    args_size
  );

  if (args.method == "debug") {
    return wrap_invoke(args, debugWrapped);
  }
  else if (args.method == "info") {
    return wrap_invoke(args, infoWrapped);
  }
  else if (args.method == "warn") {
    return wrap_invoke(args, warnWrapped);
  }
  else if (args.method == "error") {
    return wrap_invoke(args, errorWrapped);
  }
  else if (args.method == "log") {
    return wrap_invoke(args, logWrapped);
  }
  else {
    return wrap_invoke(args, null);
  }
}

export function wrapAbort(
  msg: string | null,
  file: string | null,
  line: u32,
  column: u32
): void {
  wrap_abort(
    msg ? msg : "",
    file ? file : "",
    line,
    column
  );
}
