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
import { listAssetsResponse } from "./";
import * as Types from "..";

export function serializelistAssetsResponse(type: listAssetsResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) object-type: listAssetsResponse");
  const sizer = new WriteSizer(sizerContext);
  writelistAssetsResponse(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) object-type: listAssetsResponse");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writelistAssetsResponse(encoder, type);
  return buffer;
}

export function writelistAssetsResponse(writer: Write, type: listAssetsResponse): void {
  writer.writeMapLength(1);
  writer.context().push("assets", "string | null", "writing property");
  writer.writeString("assets");
  writer.writeNullableString(type.assets);
  writer.context().pop();
}

export function deserializelistAssetsResponse(buffer: ArrayBuffer): listAssetsResponse {
  const context: Context = new Context("Deserializing object-type listAssetsResponse");
  const reader = new ReadDecoder(buffer, context);
  return readlistAssetsResponse(reader);
}

export function readlistAssetsResponse(reader: Read): listAssetsResponse {
  let numFields = reader.readMapLength();

  let _assets: string | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "assets") {
      reader.context().push(field, "string | null", "type found, reading property");
      _assets = reader.readNullableString();
      reader.context().pop();
    }
    reader.context().pop();
  }


  return {
    assets: _assets
  };
}
