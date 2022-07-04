import {
  debug,
  info,
  warn,
  error,
  log
} from "../../index";
import {
  deserializedebugArgs,
  serializedebugResult,
  deserializeinfoArgs,
  serializeinfoResult,
  deserializewarnArgs,
  serializewarnResult,
  deserializeerrorArgs,
  serializeerrorResult,
  deserializelogArgs,
  serializelogResult
} from "./serialization";

export function debugWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializedebugArgs(argsBuf);
  const result = debug({
    message: args.message
  });
  return serializedebugResult(result);
}

export function infoWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializeinfoArgs(argsBuf);
  const result = info({
    message: args.message
  });
  return serializeinfoResult(result);
}

export function warnWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializewarnArgs(argsBuf);
  const result = warn({
    message: args.message
  });
  return serializewarnResult(result);
}

export function errorWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializeerrorArgs(argsBuf);
  const result = error({
    message: args.message
  });
  return serializeerrorResult(result);
}

export function logWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializelogArgs(argsBuf);
  const result = log({
    level: args.level,
    message: args.message
  });
  return serializelogResult(result);
}
