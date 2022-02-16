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
import { GetTokenSupplyResponse } from "./";
import * as Types from "..";

export function serializeGetTokenSupplyResponse(type: GetTokenSupplyResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) object-type: GetTokenSupplyResponse");
  const sizer = new WriteSizer(sizerContext);
  writeGetTokenSupplyResponse(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) object-type: GetTokenSupplyResponse");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeGetTokenSupplyResponse(encoder, type);
  return buffer;
}

export function writeGetTokenSupplyResponse(writer: Write, type: GetTokenSupplyResponse): void {
  writer.writeMapLength(3);
  writer.context().push("token_a_pool", "string", "writing property");
  writer.writeString("token_a_pool");
  writer.writeString(type.token_a_pool);
  writer.context().pop();
  writer.context().push("token_b_pool", "string", "writing property");
  writer.writeString("token_b_pool");
  writer.writeString(type.token_b_pool);
  writer.context().pop();
  writer.context().push("total_supply", "string", "writing property");
  writer.writeString("total_supply");
  writer.writeString(type.total_supply);
  writer.context().pop();
}

export function deserializeGetTokenSupplyResponse(buffer: ArrayBuffer): GetTokenSupplyResponse {
  const context: Context = new Context("Deserializing object-type GetTokenSupplyResponse");
  const reader = new ReadDecoder(buffer, context);
  return readGetTokenSupplyResponse(reader);
}

export function readGetTokenSupplyResponse(reader: Read): GetTokenSupplyResponse {
  let numFields = reader.readMapLength();

  let _token_a_pool: string = "";
  let _token_a_poolSet: bool = false;
  let _token_b_pool: string = "";
  let _token_b_poolSet: bool = false;
  let _total_supply: string = "";
  let _total_supplySet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "token_a_pool") {
      reader.context().push(field, "string", "type found, reading property");
      _token_a_pool = reader.readString();
      _token_a_poolSet = true;
      reader.context().pop();
    }
    else if (field == "token_b_pool") {
      reader.context().push(field, "string", "type found, reading property");
      _token_b_pool = reader.readString();
      _token_b_poolSet = true;
      reader.context().pop();
    }
    else if (field == "total_supply") {
      reader.context().push(field, "string", "type found, reading property");
      _total_supply = reader.readString();
      _total_supplySet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_token_a_poolSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'token_a_pool: String'"));
  }
  if (!_token_b_poolSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'token_b_pool: String'"));
  }
  if (!_total_supplySet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'total_supply: String'"));
  }

  return {
    token_a_pool: _token_a_pool,
    token_b_pool: _token_b_pool,
    total_supply: _total_supply
  };
}
