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
import { GetLPTokenBalanceResponse } from "./";
import * as Types from "..";

export function serializeGetLPTokenBalanceResponse(type: GetLPTokenBalanceResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) object-type: GetLPTokenBalanceResponse");
  const sizer = new WriteSizer(sizerContext);
  writeGetLPTokenBalanceResponse(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) object-type: GetLPTokenBalanceResponse");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeGetLPTokenBalanceResponse(encoder, type);
  return buffer;
}

export function writeGetLPTokenBalanceResponse(writer: Write, type: GetLPTokenBalanceResponse): void {
  writer.writeMapLength(1);
  writer.context().push("balance", "string", "writing property");
  writer.writeString("balance");
  writer.writeString(type.balance);
  writer.context().pop();
}

export function deserializeGetLPTokenBalanceResponse(buffer: ArrayBuffer): GetLPTokenBalanceResponse {
  const context: Context = new Context("Deserializing object-type GetLPTokenBalanceResponse");
  const reader = new ReadDecoder(buffer, context);
  return readGetLPTokenBalanceResponse(reader);
}

export function readGetLPTokenBalanceResponse(reader: Read): GetLPTokenBalanceResponse {
  let numFields = reader.readMapLength();

  let _balance: string = "";
  let _balanceSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "balance") {
      reader.context().push(field, "string", "type found, reading property");
      _balance = reader.readString();
      _balanceSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_balanceSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'balance: String'"));
  }

  return {
    balance: _balance
  };
}
