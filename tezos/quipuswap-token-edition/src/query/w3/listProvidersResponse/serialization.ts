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
import { listProvidersResponse } from "./";
import * as Types from "..";

export function serializelistProvidersResponse(type: listProvidersResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) object-type: listProvidersResponse");
  const sizer = new WriteSizer(sizerContext);
  writelistProvidersResponse(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) object-type: listProvidersResponse");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writelistProvidersResponse(encoder, type);
  return buffer;
}

export function writelistProvidersResponse(writer: Write, type: listProvidersResponse): void {
  writer.writeMapLength(1);
  writer.context().push("providers", "string | null", "writing property");
  writer.writeString("providers");
  writer.writeNullableString(type.providers);
  writer.context().pop();
}

export function deserializelistProvidersResponse(buffer: ArrayBuffer): listProvidersResponse {
  const context: Context = new Context("Deserializing object-type listProvidersResponse");
  const reader = new ReadDecoder(buffer, context);
  return readlistProvidersResponse(reader);
}

export function readlistProvidersResponse(reader: Read): listProvidersResponse {
  let numFields = reader.readMapLength();

  let _providers: string | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "providers") {
      reader.context().push(field, "string | null", "type found, reading property");
      _providers = reader.readNullableString();
      reader.context().pop();
    }
    reader.context().pop();
  }


  return {
    providers: _providers
  };
}
