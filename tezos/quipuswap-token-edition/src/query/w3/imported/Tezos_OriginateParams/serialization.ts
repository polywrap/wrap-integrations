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
import { Tezos_OriginateParams } from "./";
import * as Types from "../..";

export function serializeTezos_OriginateParams(type: Tezos_OriginateParams): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing)  imported object-type: Tezos_OriginateParams");
  const sizer = new WriteSizer(sizerContext);
  writeTezos_OriginateParams(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) import object-type: Tezos_OriginateParams");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeTezos_OriginateParams(encoder, type);
  return buffer;
}

export function writeTezos_OriginateParams(writer: Write, type: Tezos_OriginateParams): void {
  writer.writeMapLength(9);
  writer.context().push("code", "string", "writing property");
  writer.writeString("code");
  writer.writeString(type.code);
  writer.context().pop();
  writer.context().push("storage", "string", "writing property");
  writer.writeString("storage");
  writer.writeString(type.storage);
  writer.context().pop();
  writer.context().push("balance", "string | null", "writing property");
  writer.writeString("balance");
  writer.writeNullableString(type.balance);
  writer.context().pop();
  writer.context().push("delegate", "string | null", "writing property");
  writer.writeString("delegate");
  writer.writeNullableString(type.delegate);
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
  writer.context().push("init", "string | null", "writing property");
  writer.writeString("init");
  writer.writeNullableString(type.init);
  writer.context().pop();
}

export function deserializeTezos_OriginateParams(buffer: ArrayBuffer): Tezos_OriginateParams {
  const context: Context = new Context("Deserializing imported object-type Tezos_OriginateParams");
  const reader = new ReadDecoder(buffer, context);
  return readTezos_OriginateParams(reader);
}

export function readTezos_OriginateParams(reader: Read): Tezos_OriginateParams {
  let numFields = reader.readMapLength();

  let _code: string = "";
  let _codeSet: bool = false;
  let _storage: string = "";
  let _storageSet: bool = false;
  let _balance: string | null = null;
  let _delegate: string | null = null;
  let _fee: Nullable<u32> = new Nullable<u32>();
  let _gasLimit: Nullable<u32> = new Nullable<u32>();
  let _storageLimit: Nullable<u32> = new Nullable<u32>();
  let _mutez: Nullable<bool> = new Nullable<bool>();
  let _init: string | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "code") {
      reader.context().push(field, "string", "type found, reading property");
      _code = reader.readString();
      _codeSet = true;
      reader.context().pop();
    }
    else if (field == "storage") {
      reader.context().push(field, "string", "type found, reading property");
      _storage = reader.readString();
      _storageSet = true;
      reader.context().pop();
    }
    else if (field == "balance") {
      reader.context().push(field, "string | null", "type found, reading property");
      _balance = reader.readNullableString();
      reader.context().pop();
    }
    else if (field == "delegate") {
      reader.context().push(field, "string | null", "type found, reading property");
      _delegate = reader.readNullableString();
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
    else if (field == "init") {
      reader.context().push(field, "string | null", "type found, reading property");
      _init = reader.readNullableString();
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_codeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'code: String'"));
  }
  if (!_storageSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'storage: String'"));
  }

  return {
    code: _code,
    storage: _storage,
    balance: _balance,
    delegate: _delegate,
    fee: _fee,
    gasLimit: _gasLimit,
    storageLimit: _storageLimit,
    mutez: _mutez,
    init: _init
  };
}
