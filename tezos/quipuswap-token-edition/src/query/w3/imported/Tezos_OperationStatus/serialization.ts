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
import { Tezos_OperationStatus } from "./";
import * as Types from "../..";

export function serializeTezos_OperationStatus(type: Tezos_OperationStatus): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing)  imported object-type: Tezos_OperationStatus");
  const sizer = new WriteSizer(sizerContext);
  writeTezos_OperationStatus(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) import object-type: Tezos_OperationStatus");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeTezos_OperationStatus(encoder, type);
  return buffer;
}

export function writeTezos_OperationStatus(writer: Write, type: Tezos_OperationStatus): void {
  writer.writeMapLength(22);
  writer.context().push("hash", "string", "writing property");
  writer.writeString("hash");
  writer.writeString(type.hash);
  writer.context().pop();
  writer.context().push("type", "string", "writing property");
  writer.writeString("type");
  writer.writeString(type.m_type);
  writer.context().pop();
  writer.context().push("block", "string", "writing property");
  writer.writeString("block");
  writer.writeString(type.block);
  writer.context().pop();
  writer.context().push("time", "string", "writing property");
  writer.writeString("time");
  writer.writeString(type.time);
  writer.context().pop();
  writer.context().push("height", "string", "writing property");
  writer.writeString("height");
  writer.writeString(type.height);
  writer.context().pop();
  writer.context().push("cycle", "u32", "writing property");
  writer.writeString("cycle");
  writer.writeUInt32(type.cycle);
  writer.context().pop();
  writer.context().push("counter", "u32", "writing property");
  writer.writeString("counter");
  writer.writeUInt32(type.counter);
  writer.context().pop();
  writer.context().push("status", "string", "writing property");
  writer.writeString("status");
  writer.writeString(type.status);
  writer.context().pop();
  writer.context().push("is_success", "bool", "writing property");
  writer.writeString("is_success");
  writer.writeBool(type.is_success);
  writer.context().pop();
  writer.context().push("is_contract", "bool", "writing property");
  writer.writeString("is_contract");
  writer.writeBool(type.is_contract);
  writer.context().pop();
  writer.context().push("gas_limit", "u32", "writing property");
  writer.writeString("gas_limit");
  writer.writeUInt32(type.gas_limit);
  writer.context().pop();
  writer.context().push("gas_used", "u32", "writing property");
  writer.writeString("gas_used");
  writer.writeUInt32(type.gas_used);
  writer.context().pop();
  writer.context().push("gas_price", "u32", "writing property");
  writer.writeString("gas_price");
  writer.writeUInt32(type.gas_price);
  writer.context().pop();
  writer.context().push("storage_limit", "u32", "writing property");
  writer.writeString("storage_limit");
  writer.writeUInt32(type.storage_limit);
  writer.context().pop();
  writer.context().push("storage_size", "u32", "writing property");
  writer.writeString("storage_size");
  writer.writeUInt32(type.storage_size);
  writer.context().pop();
  writer.context().push("storage_paid", "u32", "writing property");
  writer.writeString("storage_paid");
  writer.writeUInt32(type.storage_paid);
  writer.context().pop();
  writer.context().push("volume", "u32", "writing property");
  writer.writeString("volume");
  writer.writeUInt32(type.volume);
  writer.context().pop();
  writer.context().push("fee", "u32", "writing property");
  writer.writeString("fee");
  writer.writeUInt32(type.fee);
  writer.context().pop();
  writer.context().push("days_destroyed", "u32", "writing property");
  writer.writeString("days_destroyed");
  writer.writeUInt32(type.days_destroyed);
  writer.context().pop();
  writer.context().push("sender", "string", "writing property");
  writer.writeString("sender");
  writer.writeString(type.sender);
  writer.context().pop();
  writer.context().push("receiver", "string", "writing property");
  writer.writeString("receiver");
  writer.writeString(type.receiver);
  writer.context().pop();
  writer.context().push("confirmations", "u32", "writing property");
  writer.writeString("confirmations");
  writer.writeUInt32(type.confirmations);
  writer.context().pop();
}

export function deserializeTezos_OperationStatus(buffer: ArrayBuffer): Tezos_OperationStatus {
  const context: Context = new Context("Deserializing imported object-type Tezos_OperationStatus");
  const reader = new ReadDecoder(buffer, context);
  return readTezos_OperationStatus(reader);
}

export function readTezos_OperationStatus(reader: Read): Tezos_OperationStatus {
  let numFields = reader.readMapLength();

  let _hash: string = "";
  let _hashSet: bool = false;
  let _type: string = "";
  let _typeSet: bool = false;
  let _block: string = "";
  let _blockSet: bool = false;
  let _time: string = "";
  let _timeSet: bool = false;
  let _height: string = "";
  let _heightSet: bool = false;
  let _cycle: u32 = 0;
  let _cycleSet: bool = false;
  let _counter: u32 = 0;
  let _counterSet: bool = false;
  let _status: string = "";
  let _statusSet: bool = false;
  let _is_success: bool = false;
  let _is_successSet: bool = false;
  let _is_contract: bool = false;
  let _is_contractSet: bool = false;
  let _gas_limit: u32 = 0;
  let _gas_limitSet: bool = false;
  let _gas_used: u32 = 0;
  let _gas_usedSet: bool = false;
  let _gas_price: u32 = 0;
  let _gas_priceSet: bool = false;
  let _storage_limit: u32 = 0;
  let _storage_limitSet: bool = false;
  let _storage_size: u32 = 0;
  let _storage_sizeSet: bool = false;
  let _storage_paid: u32 = 0;
  let _storage_paidSet: bool = false;
  let _volume: u32 = 0;
  let _volumeSet: bool = false;
  let _fee: u32 = 0;
  let _feeSet: bool = false;
  let _days_destroyed: u32 = 0;
  let _days_destroyedSet: bool = false;
  let _sender: string = "";
  let _senderSet: bool = false;
  let _receiver: string = "";
  let _receiverSet: bool = false;
  let _confirmations: u32 = 0;
  let _confirmationsSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "hash") {
      reader.context().push(field, "string", "type found, reading property");
      _hash = reader.readString();
      _hashSet = true;
      reader.context().pop();
    }
    else if (field == "type") {
      reader.context().push(field, "string", "type found, reading property");
      _type = reader.readString();
      _typeSet = true;
      reader.context().pop();
    }
    else if (field == "block") {
      reader.context().push(field, "string", "type found, reading property");
      _block = reader.readString();
      _blockSet = true;
      reader.context().pop();
    }
    else if (field == "time") {
      reader.context().push(field, "string", "type found, reading property");
      _time = reader.readString();
      _timeSet = true;
      reader.context().pop();
    }
    else if (field == "height") {
      reader.context().push(field, "string", "type found, reading property");
      _height = reader.readString();
      _heightSet = true;
      reader.context().pop();
    }
    else if (field == "cycle") {
      reader.context().push(field, "u32", "type found, reading property");
      _cycle = reader.readUInt32();
      _cycleSet = true;
      reader.context().pop();
    }
    else if (field == "counter") {
      reader.context().push(field, "u32", "type found, reading property");
      _counter = reader.readUInt32();
      _counterSet = true;
      reader.context().pop();
    }
    else if (field == "status") {
      reader.context().push(field, "string", "type found, reading property");
      _status = reader.readString();
      _statusSet = true;
      reader.context().pop();
    }
    else if (field == "is_success") {
      reader.context().push(field, "bool", "type found, reading property");
      _is_success = reader.readBool();
      _is_successSet = true;
      reader.context().pop();
    }
    else if (field == "is_contract") {
      reader.context().push(field, "bool", "type found, reading property");
      _is_contract = reader.readBool();
      _is_contractSet = true;
      reader.context().pop();
    }
    else if (field == "gas_limit") {
      reader.context().push(field, "u32", "type found, reading property");
      _gas_limit = reader.readUInt32();
      _gas_limitSet = true;
      reader.context().pop();
    }
    else if (field == "gas_used") {
      reader.context().push(field, "u32", "type found, reading property");
      _gas_used = reader.readUInt32();
      _gas_usedSet = true;
      reader.context().pop();
    }
    else if (field == "gas_price") {
      reader.context().push(field, "u32", "type found, reading property");
      _gas_price = reader.readUInt32();
      _gas_priceSet = true;
      reader.context().pop();
    }
    else if (field == "storage_limit") {
      reader.context().push(field, "u32", "type found, reading property");
      _storage_limit = reader.readUInt32();
      _storage_limitSet = true;
      reader.context().pop();
    }
    else if (field == "storage_size") {
      reader.context().push(field, "u32", "type found, reading property");
      _storage_size = reader.readUInt32();
      _storage_sizeSet = true;
      reader.context().pop();
    }
    else if (field == "storage_paid") {
      reader.context().push(field, "u32", "type found, reading property");
      _storage_paid = reader.readUInt32();
      _storage_paidSet = true;
      reader.context().pop();
    }
    else if (field == "volume") {
      reader.context().push(field, "u32", "type found, reading property");
      _volume = reader.readUInt32();
      _volumeSet = true;
      reader.context().pop();
    }
    else if (field == "fee") {
      reader.context().push(field, "u32", "type found, reading property");
      _fee = reader.readUInt32();
      _feeSet = true;
      reader.context().pop();
    }
    else if (field == "days_destroyed") {
      reader.context().push(field, "u32", "type found, reading property");
      _days_destroyed = reader.readUInt32();
      _days_destroyedSet = true;
      reader.context().pop();
    }
    else if (field == "sender") {
      reader.context().push(field, "string", "type found, reading property");
      _sender = reader.readString();
      _senderSet = true;
      reader.context().pop();
    }
    else if (field == "receiver") {
      reader.context().push(field, "string", "type found, reading property");
      _receiver = reader.readString();
      _receiverSet = true;
      reader.context().pop();
    }
    else if (field == "confirmations") {
      reader.context().push(field, "u32", "type found, reading property");
      _confirmations = reader.readUInt32();
      _confirmationsSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_hashSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'hash: String'"));
  }
  if (!_typeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'type: String'"));
  }
  if (!_blockSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'block: String'"));
  }
  if (!_timeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'time: String'"));
  }
  if (!_heightSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'height: String'"));
  }
  if (!_cycleSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'cycle: UInt32'"));
  }
  if (!_counterSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'counter: UInt32'"));
  }
  if (!_statusSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'status: String'"));
  }
  if (!_is_successSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'is_success: Boolean'"));
  }
  if (!_is_contractSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'is_contract: Boolean'"));
  }
  if (!_gas_limitSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'gas_limit: UInt32'"));
  }
  if (!_gas_usedSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'gas_used: UInt32'"));
  }
  if (!_gas_priceSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'gas_price: UInt32'"));
  }
  if (!_storage_limitSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'storage_limit: UInt32'"));
  }
  if (!_storage_sizeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'storage_size: UInt32'"));
  }
  if (!_storage_paidSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'storage_paid: UInt32'"));
  }
  if (!_volumeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'volume: UInt32'"));
  }
  if (!_feeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'fee: UInt32'"));
  }
  if (!_days_destroyedSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'days_destroyed: UInt32'"));
  }
  if (!_senderSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'sender: String'"));
  }
  if (!_receiverSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'receiver: String'"));
  }
  if (!_confirmationsSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'confirmations: UInt32'"));
  }

  return {
    hash: _hash,
    m_type: _type,
    block: _block,
    time: _time,
    height: _height,
    cycle: _cycle,
    counter: _counter,
    status: _status,
    is_success: _is_success,
    is_contract: _is_contract,
    gas_limit: _gas_limit,
    gas_used: _gas_used,
    gas_price: _gas_price,
    storage_limit: _storage_limit,
    storage_size: _storage_size,
    storage_paid: _storage_paid,
    volume: _volume,
    fee: _fee,
    days_destroyed: _days_destroyed,
    sender: _sender,
    receiver: _receiver,
    confirmations: _confirmations
  };
}
