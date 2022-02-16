import {
  Read,
  ReadDecoder,
  Write,
  WriteSizer,
  WriteEncoder,
  Nullable,
  BigInt,
  JSON,
  Context
} from "@web3api/wasm-as";
import { ListTokenPairsResponse } from "./";
import * as Types from "..";

export function serializeListTokenPairsResponse(type: ListTokenPairsResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) object-type: ListTokenPairsResponse");
  const sizer = new WriteSizer(sizerContext);
  writeListTokenPairsResponse(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) object-type: ListTokenPairsResponse");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeListTokenPairsResponse(encoder, type);
  return buffer;
}

export function writeListTokenPairsResponse(writer: Write, type: ListTokenPairsResponse): void {
  writer.writeMapLength(1);
  writer.context().push("token_list", "string | null", "writing property");
  writer.writeString("token_list");
  writer.writeNullableString(type.token_list);
  writer.context().pop();
}

export function deserializeListTokenPairsResponse(buffer: ArrayBuffer): ListTokenPairsResponse {
  const context: Context = new Context("Deserializing object-type ListTokenPairsResponse");
  const reader = new ReadDecoder(buffer, context);
  return readListTokenPairsResponse(reader);
}

export function readListTokenPairsResponse(reader: Read): ListTokenPairsResponse {
  let numFields = reader.readMapLength();

  let _token_list: string | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "token_list") {
      reader.context().push(field, "string | null", "type found, reading property");
      _token_list = reader.readNullableString();
      reader.context().pop();
    }
    reader.context().pop();
  }


  return {
    token_list: _token_list
  };
}
