import {
  Read,
  ReadDecoder,
  Write,
  WriteSizer,
  WriteEncoder,
  Nullable,
  BigInt,
  BigNumber,
  JSON,
  Context
} from "@polywrap/wasm-as";
import * as Types from "..";

export class Input_debug {
  message: string;
}

export function deserializedebugArgs(argsBuf: ArrayBuffer): Input_debug {
  const context: Context =  new Context("Deserializing module-type: debug");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _message: string = "";
  let _messageSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "message") {
      reader.context().push(field, "string", "type found, reading property");
      _message = reader.readString();
      _messageSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_messageSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'message: String'"));
  }

  return {
    message: _message
  };
}

export function serializedebugResult(result: bool): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: debug");
  const sizer = new WriteSizer(sizerContext);
  writedebugResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: debug");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writedebugResult(encoder, result);
  return buffer;
}

export function writedebugResult(writer: Write, result: bool): void {
  writer.context().push("debug", "bool", "writing property");
  writer.writeBool(result);
  writer.context().pop();
}

export class Input_info {
  message: string;
}

export function deserializeinfoArgs(argsBuf: ArrayBuffer): Input_info {
  const context: Context =  new Context("Deserializing module-type: info");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _message: string = "";
  let _messageSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "message") {
      reader.context().push(field, "string", "type found, reading property");
      _message = reader.readString();
      _messageSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_messageSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'message: String'"));
  }

  return {
    message: _message
  };
}

export function serializeinfoResult(result: bool): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: info");
  const sizer = new WriteSizer(sizerContext);
  writeinfoResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: info");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writeinfoResult(encoder, result);
  return buffer;
}

export function writeinfoResult(writer: Write, result: bool): void {
  writer.context().push("info", "bool", "writing property");
  writer.writeBool(result);
  writer.context().pop();
}

export class Input_warn {
  message: string;
}

export function deserializewarnArgs(argsBuf: ArrayBuffer): Input_warn {
  const context: Context =  new Context("Deserializing module-type: warn");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _message: string = "";
  let _messageSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "message") {
      reader.context().push(field, "string", "type found, reading property");
      _message = reader.readString();
      _messageSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_messageSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'message: String'"));
  }

  return {
    message: _message
  };
}

export function serializewarnResult(result: bool): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: warn");
  const sizer = new WriteSizer(sizerContext);
  writewarnResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: warn");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writewarnResult(encoder, result);
  return buffer;
}

export function writewarnResult(writer: Write, result: bool): void {
  writer.context().push("warn", "bool", "writing property");
  writer.writeBool(result);
  writer.context().pop();
}

export class Input_error {
  message: string;
}

export function deserializeerrorArgs(argsBuf: ArrayBuffer): Input_error {
  const context: Context =  new Context("Deserializing module-type: error");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _message: string = "";
  let _messageSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "message") {
      reader.context().push(field, "string", "type found, reading property");
      _message = reader.readString();
      _messageSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_messageSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'message: String'"));
  }

  return {
    message: _message
  };
}

export function serializeerrorResult(result: bool): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: error");
  const sizer = new WriteSizer(sizerContext);
  writeerrorResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: error");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writeerrorResult(encoder, result);
  return buffer;
}

export function writeerrorResult(writer: Write, result: bool): void {
  writer.context().push("error", "bool", "writing property");
  writer.writeBool(result);
  writer.context().pop();
}

export class Input_log {
  level: Types.Interface_LogLevel;
  message: string;
}

export function deserializelogArgs(argsBuf: ArrayBuffer): Input_log {
  const context: Context =  new Context("Deserializing module-type: log");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _level: Types.Interface_LogLevel = 0;
  let _levelSet: bool = false;
  let _message: string = "";
  let _messageSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "level") {
      reader.context().push(field, "Types.Interface_LogLevel", "type found, reading property");
      let value: Types.Interface_LogLevel;
      if (reader.isNextString()) {
        value = Types.getInterface_LogLevelValue(reader.readString());
      } else {
        value = reader.readInt32();
        Types.sanitizeInterface_LogLevelValue(value);
      }
      _level = value;
      _levelSet = true;
      reader.context().pop();
    }
    else if (field == "message") {
      reader.context().push(field, "string", "type found, reading property");
      _message = reader.readString();
      _messageSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_levelSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'level: Interface_LogLevel'"));
  }
  if (!_messageSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'message: String'"));
  }

  return {
    level: _level,
    message: _message
  };
}

export function serializelogResult(result: bool): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: log");
  const sizer = new WriteSizer(sizerContext);
  writelogResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: log");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writelogResult(encoder, result);
  return buffer;
}

export function writelogResult(writer: Write, result: bool): void {
  writer.context().push("log", "bool", "writing property");
  writer.writeBool(result);
  writer.context().pop();
}
