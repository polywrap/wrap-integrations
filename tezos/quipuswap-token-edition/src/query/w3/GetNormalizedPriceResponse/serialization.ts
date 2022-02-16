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
import { GetNormalizedPriceResponse } from "./";
import * as Types from "..";

export function serializeGetNormalizedPriceResponse(type: GetNormalizedPriceResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) object-type: GetNormalizedPriceResponse");
  const sizer = new WriteSizer(sizerContext);
  writeGetNormalizedPriceResponse(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) object-type: GetNormalizedPriceResponse");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeGetNormalizedPriceResponse(encoder, type);
  return buffer;
}

export function writeGetNormalizedPriceResponse(writer: Write, type: GetNormalizedPriceResponse): void {
  writer.writeMapLength(1);
  writer.context().push("price", "string", "writing property");
  writer.writeString("price");
  writer.writeString(type.price);
  writer.context().pop();
}

export function deserializeGetNormalizedPriceResponse(buffer: ArrayBuffer): GetNormalizedPriceResponse {
  const context: Context = new Context("Deserializing object-type GetNormalizedPriceResponse");
  const reader = new ReadDecoder(buffer, context);
  return readGetNormalizedPriceResponse(reader);
}

export function readGetNormalizedPriceResponse(reader: Read): GetNormalizedPriceResponse {
  let numFields = reader.readMapLength();

  let _price: string = "";
  let _priceSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "price") {
      reader.context().push(field, "string", "type found, reading property");
      _price = reader.readString();
      _priceSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_priceSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'price: String'"));
  }

  return {
    price: _price
  };
}
