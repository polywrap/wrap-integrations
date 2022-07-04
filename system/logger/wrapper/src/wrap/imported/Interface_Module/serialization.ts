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
import * as Types from "../..";

export class Input_log {
  level: Types.Interface_LogLevel;
  message: string;
}

export function serializelogArgs(input: Input_log): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported module-type: log");
  const sizer = new WriteSizer(sizerContext);
  writelogArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported module-type: log");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writelogArgs(encoder, input);
  return buffer;
}

export function writelogArgs(
  writer: Write,
  input: Input_log
): void {
  writer.writeMapLength(2);
  writer.context().push("level", "Types.Interface_LogLevel", "writing property");
  writer.writeString("level");
  writer.writeInt32(input.level);
  writer.context().pop();
  writer.context().push("message", "string", "writing property");
  writer.writeString("message");
  writer.writeString(input.message);
  writer.context().pop();
}

export function deserializelogResult(buffer: ArrayBuffer): bool {
  const context: Context =  new Context("Deserializing imported module-type: log");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("log", "bool", "reading function output");
  const res: bool = reader.readBool();
  reader.context().pop();

  return res;
}
