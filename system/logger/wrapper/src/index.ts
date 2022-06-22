import {
  Input_log,
  Logger_Module,
  Logger_Logger_LogLevel,
  Input_info,
  Input_error,
  Input_debug,
  Input_warn
} from "./wrap";


export function log(input: Input_log): bool {
  Logger_Module.log({
    message: input.message,
    level: input.level
  })
  return true
}

export function debug(input: Input_debug): bool {
  return log({
    message: input.message,
    level: Logger_Logger_LogLevel.DEBUG
  });
}

export function info(input: Input_info): bool {
  return log({
    message: input.message,
    level: Logger_Logger_LogLevel.INFO
  });
}

export function warn(input: Input_warn): bool {
  return log({
    message: input.message,
    level: Logger_Logger_LogLevel.WARN
  });
}

export function error(input: Input_error): bool {
  return log({
    message: input.message,
    level: Logger_Logger_LogLevel.ERROR
  });
}
