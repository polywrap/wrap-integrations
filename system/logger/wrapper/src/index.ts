import {
  Input_log,
  Input_info,
  Input_error,
  Input_debug,
  Input_warn,
  Interface,
  Interface_Module,
  Interface_LogLevel
} from "./wrap";


export function log(input: Input_log): bool {
  const uris = Interface.getImplementations()
  for (let i = 0; i < uris.length; i++) {
    new Interface_Module(uris[i]).log({
      message: input.message,
      level: input.level
    }).unwrap()
  }
  return true
}

export function debug(input: Input_debug): bool {
  return log({
    message: input.message,
    level: Interface_LogLevel.DEBUG
  });
}

export function info(input: Input_info): bool {
  return log({
    message: input.message,
    level: Interface_LogLevel.INFO
  });
}

export function warn(input: Input_warn): bool {
  return log({
    message: input.message,
    level: Interface_LogLevel.WARN
  });
}

export function error(input: Input_error): bool {
  return log({
    message: input.message,
    level: Interface_LogLevel.ERROR
  });
}
