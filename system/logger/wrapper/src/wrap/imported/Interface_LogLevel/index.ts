export enum Interface_LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  _MAX_
}

export function sanitizeInterface_LogLevelValue(value: i32): void {
  const valid = value >= 0 && value < Interface_LogLevel._MAX_;
  if (!valid) {
    throw new Error("Invalid value for enum 'Interface_LogLevel': " + value.toString());
  }
}

export function getInterface_LogLevelValue(key: string): Interface_LogLevel {
  if (key == "DEBUG") {
    return Interface_LogLevel.DEBUG;
  }
  if (key == "INFO") {
    return Interface_LogLevel.INFO;
  }
  if (key == "WARN") {
    return Interface_LogLevel.WARN;
  }
  if (key == "ERROR") {
    return Interface_LogLevel.ERROR;
  }

  throw new Error("Invalid key for enum 'Interface_LogLevel': " + key);
}

export function getInterface_LogLevelKey(value: Interface_LogLevel): string {
  sanitizeInterface_LogLevelValue(value);

  switch (value) {
    case Interface_LogLevel.DEBUG: return "DEBUG";
    case Interface_LogLevel.INFO: return "INFO";
    case Interface_LogLevel.WARN: return "WARN";
    case Interface_LogLevel.ERROR: return "ERROR";
    default:
      throw new Error("Invalid value for enum 'Interface_LogLevel': " + value.toString());
  }
}
