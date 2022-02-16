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
import { Tezos_TransferParams } from "./";
import * as Types from "../..";

export function serializeTezos_TransferParams(type: Tezos_TransferParams): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing)  imported object-type: Tezos_TransferParams");
  const sizer = new WriteSizer(sizerContext);
  writeTezos_TransferParams(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) import object-type: Tezos_TransferParams");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeTezos_TransferParams(encoder, type);
  return buffer;
}

export function writeTezos_TransferParams(writer: Write, type: Tezos_TransferParams): void {
  writer.writeMapLength(7);
  writer.context().push("to", "string", "writing property");
  writer.writeString("to");
  writer.writeString(type.to);
  writer.context().pop();
  writer.context().push("amount", "u32", "writing property");
  writer.writeString("amount");
  writer.writeUInt32(type.amount);
  writer.context().pop();
  writer.context().push("source", "string | null", "writing property");
  writer.writeString("source");
  writer.writeNullableString(type.source);
  writer.context().pop();
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
  writer.context().push("mutez", "Nullable<bool>", "writing property");
  writer.writeString("mutez");
  writer.writeNullableBool(type.mutez);
  writer.context().pop();
}

export function deserializeTezos_TransferParams(buffer: ArrayBuffer): Tezos_TransferParams {
  const context: Context = new Context("Deserializing imported object-type Tezos_TransferParams");
  const reader = new ReadDecoder(buffer, context);
  return readTezos_TransferParams(reader);
}

export function readTezos_TransferParams(reader: Read): Tezos_TransferParams {
  let numFields = reader.readMapLength();

  let _to: string = "";
  let _toSet: bool = false;
  let _amount: u32 = 0;
  let _amountSet: bool = false;
  let _source: string | null = null;
  let _fee: Nullable<u32> = new Nullable<u32>();
  let _gasLimit: Nullable<u32> = new Nullable<u32>();
  let _storageLimit: Nullable<u32> = new Nullable<u32>();
  let _mutez: Nullable<bool> = new Nullable<bool>();

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "to") {
      reader.context().push(field, "string", "type found, reading property");
      _to = reader.readString();
      _toSet = true;
      reader.context().pop();
    }
    else if (field == "amount") {
      reader.context().push(field, "u32", "type found, reading property");
      _amount = reader.readUInt32();
      _amountSet = true;
      reader.context().pop();
    }
    else if (field == "source") {
      reader.context().push(field, "string | null", "type found, reading property");
      _source = reader.readNullableString();
      reader.context().pop();
    }
    else if (field == "fee") {
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
    else if (field == "mutez") {
      reader.context().push(field, "Nullable<bool>", "type found, reading property");
      _mutez = reader.readNullableBool();
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_toSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'to: String'"));
  }
  if (!_amountSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'amount: UInt32'"));
  }

  return {
    to: _to,
    amount: _amount,
    source: _source,
    fee: _fee,
    gasLimit: _gasLimit,
    storageLimit: _storageLimit,
    mutez: _mutez
  };
}
