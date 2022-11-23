import {
  Logger,
  Logger_Module,
  Logger_LogLevel,
  Args_debug,
  Args_info,
  Args_warn,
  Args_error,
  Args_loggers,
} from "./wrap";
import { Args_log } from "./wrap/imported/Logger_Module/serialization";

function log(args: Args_log): bool {
  const uris = loggers({});
  for (let i = 0; i < uris.length; i++) {
    new Logger_Module(uris[i]).log({
      message: args.message,
      level: args.level
    }).unwrap();
  }
  return true;
}

export function debug(args: Args_debug): bool {
  return log({
    message: args.message,
    level: Logger_LogLevel.DEBUG
  });
}

export function info(args: Args_info): bool {
  return log({
    message: args.message,
    level: Logger_LogLevel.INFO
  });
}

export function warn(args: Args_warn): bool {
  return log({
    message: args.message,
    level: Logger_LogLevel.WARN
  });
}

export function error(args: Args_error): bool {
  return log({
    message: args.message,
    level: Logger_LogLevel.ERROR
  });
}

export function loggers(_: Args_loggers): string[] {
  return Logger.getImplementations();
}
