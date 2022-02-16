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
import { Tezos_RevealParams } from "./";
import * as Types from "../..";

export function serializeTezos_RevealParams(type: Tezos_RevealParams): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing)  imported object-type: Tezos_RevealParams");
  const sizer = new WriteSizer(sizerContext);
  writeTezos_RevealParams(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) import object-type: Tezos_RevealParams");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeTezos_RevealParams(encoder, type);
  return buffer;
}

export function writeTezos_RevealParams(writer: Write, type: Tezos_RevealParams): void {
  writer.writeMapLength(3);
  writer.context().push("fee", "Nullable<u32>", "writing property");
  writer.writeString("fee");
  writer.writeNullableUInt32(type.fee);
  writer.context().pop();
  writer.context().push("gasLimit", "Nullable<u32>", "writing property");
  writer.writeString("gasLimit");
  writer.writeNullableUInt32(type.gasLimit);
  writer.context().pop();
  writer.context().push("storageLimit", "Nullable<u32>", "writing property");
  writer.writeString("storageLimit");
  writer.writeNullableUInt32(type.storageLimit);
  writer.context().pop();
}

export function deserializeTezos_RevealParams(buffer: ArrayBuffer): Tezos_RevealParams {
  const context: Context = new Context("Deserializing imported object-type Tezos_RevealParams");
  const reader = new ReadDecoder(buffer, context);
  return readTezos_RevealParams(reader);
}

export function readTezos_RevealParams(reader: Read): Tezos_RevealParams {
  let numFields = reader.readMapLength();

  let _fee: Nullable<u32> = new Nullable<u32>();
  let _gasLimit: Nullable<u32> = new Nullable<u32>();
  let _storageLimit: Nullable<u32> = new Nullable<u32>();

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "fee") {
      reader.context().push(field, "Nullable<u32>", "type found, reading property");
      _fee = reader.readNullableUInt32();
      reader.context().pop();
    }
    else if (field == "gasLimit") {
      reader.context().push(field, "Nullable<u32>", "type found, reading property");
      _gasLimit = reader.readNullableUInt32();
      reader.context().pop();
    }
    else if (field == "storageLimit") {
      reader.context().push(field, "Nullable<u32>", "type found, reading property");
      _storageLimit = reader.readNullableUInt32();
      reader.context().pop();
    }
    reader.context().pop();
  }


  return {
    fee: _fee,
    gasLimit: _gasLimit,
    storageLimit: _storageLimit
  };
}
