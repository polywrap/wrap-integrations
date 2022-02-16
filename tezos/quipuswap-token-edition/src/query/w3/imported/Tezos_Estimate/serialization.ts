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
import { Tezos_Estimate } from "./";
import * as Types from "../..";

export function serializeTezos_Estimate(type: Tezos_Estimate): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing)  imported object-type: Tezos_Estimate");
  const sizer = new WriteSizer(sizerContext);
  writeTezos_Estimate(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) import object-type: Tezos_Estimate");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeTezos_Estimate(encoder, type);
  return buffer;
}

export function writeTezos_Estimate(writer: Write, type: Tezos_Estimate): void {
  writer.writeMapLength(9);
  writer.context().push("burnFeeMutez", "u32", "writing property");
  writer.writeString("burnFeeMutez");
  writer.writeUInt32(type.burnFeeMutez);
  writer.context().pop();
  writer.context().push("gasLimit", "u32", "writing property");
  writer.writeString("gasLimit");
  writer.writeUInt32(type.gasLimit);
  writer.context().pop();
  writer.context().push("minimalFeeMutez", "u32", "writing property");
  writer.writeString("minimalFeeMutez");
  writer.writeUInt32(type.minimalFeeMutez);
  writer.context().pop();
  writer.context().push("opSize", "string", "writing property");
  writer.writeString("opSize");
  writer.writeString(type.opSize);
  writer.context().pop();
  writer.context().push("storageLimit", "u32", "writing property");
  writer.writeString("storageLimit");
  writer.writeUInt32(type.storageLimit);
  writer.context().pop();
  writer.context().push("suggestedFeeMutez", "u32", "writing property");
  writer.writeString("suggestedFeeMutez");
  writer.writeUInt32(type.suggestedFeeMutez);
  writer.context().pop();
  writer.context().push("totalCost", "u32", "writing property");
  writer.writeString("totalCost");
  writer.writeUInt32(type.totalCost);
  writer.context().pop();
  writer.context().push("usingBaseFeeMutez", "u32", "writing property");
  writer.writeString("usingBaseFeeMutez");
  writer.writeUInt32(type.usingBaseFeeMutez);
  writer.context().pop();
  writer.context().push("consumedMilligas", "u32", "writing property");
  writer.writeString("consumedMilligas");
  writer.writeUInt32(type.consumedMilligas);
  writer.context().pop();
}

export function deserializeTezos_Estimate(buffer: ArrayBuffer): Tezos_Estimate {
  const context: Context = new Context("Deserializing imported object-type Tezos_Estimate");
  const reader = new ReadDecoder(buffer, context);
  return readTezos_Estimate(reader);
}

export function readTezos_Estimate(reader: Read): Tezos_Estimate {
  let numFields = reader.readMapLength();

  let _burnFeeMutez: u32 = 0;
  let _burnFeeMutezSet: bool = false;
  let _gasLimit: u32 = 0;
  let _gasLimitSet: bool = false;
  let _minimalFeeMutez: u32 = 0;
  let _minimalFeeMutezSet: bool = false;
  let _opSize: string = "";
  let _opSizeSet: bool = false;
  let _storageLimit: u32 = 0;
  let _storageLimitSet: bool = false;
  let _suggestedFeeMutez: u32 = 0;
  let _suggestedFeeMutezSet: bool = false;
  let _totalCost: u32 = 0;
  let _totalCostSet: bool = false;
  let _usingBaseFeeMutez: u32 = 0;
  let _usingBaseFeeMutezSet: bool = false;
  let _consumedMilligas: u32 = 0;
  let _consumedMilligasSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "burnFeeMutez") {
      reader.context().push(field, "u32", "type found, reading property");
      _burnFeeMutez = reader.readUInt32();
      _burnFeeMutezSet = true;
      reader.context().pop();
    }
    else if (field == "gasLimit") {
      reader.context().push(field, "u32", "type found, reading property");
      _gasLimit = reader.readUInt32();
      _gasLimitSet = true;
      reader.context().pop();
    }
    else if (field == "minimalFeeMutez") {
      reader.context().push(field, "u32", "type found, reading property");
      _minimalFeeMutez = reader.readUInt32();
      _minimalFeeMutezSet = true;
      reader.context().pop();
    }
    else if (field == "opSize") {
      reader.context().push(field, "string", "type found, reading property");
      _opSize = reader.readString();
      _opSizeSet = true;
      reader.context().pop();
    }
    else if (field == "storageLimit") {
      reader.context().push(field, "u32", "type found, reading property");
      _storageLimit = reader.readUInt32();
      _storageLimitSet = true;
      reader.context().pop();
    }
    else if (field == "suggestedFeeMutez") {
      reader.context().push(field, "u32", "type found, reading property");
      _suggestedFeeMutez = reader.readUInt32();
      _suggestedFeeMutezSet = true;
      reader.context().pop();
    }
    else if (field == "totalCost") {
      reader.context().push(field, "u32", "type found, reading property");
      _totalCost = reader.readUInt32();
      _totalCostSet = true;
      reader.context().pop();
    }
    else if (field == "usingBaseFeeMutez") {
      reader.context().push(field, "u32", "type found, reading property");
      _usingBaseFeeMutez = reader.readUInt32();
      _usingBaseFeeMutezSet = true;
      reader.context().pop();
    }
    else if (field == "consumedMilligas") {
      reader.context().push(field, "u32", "type found, reading property");
      _consumedMilligas = reader.readUInt32();
      _consumedMilligasSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_burnFeeMutezSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'burnFeeMutez: UInt32'"));
  }
  if (!_gasLimitSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'gasLimit: UInt32'"));
  }
  if (!_minimalFeeMutezSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'minimalFeeMutez: UInt32'"));
  }
  if (!_opSizeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'opSize: String'"));
  }
  if (!_storageLimitSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'storageLimit: UInt32'"));
  }
  if (!_suggestedFeeMutezSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'suggestedFeeMutez: UInt32'"));
  }
  if (!_totalCostSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'totalCost: UInt32'"));
  }
  if (!_usingBaseFeeMutezSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'usingBaseFeeMutez: UInt32'"));
  }
  if (!_consumedMilligasSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'consumedMilligas: UInt32'"));
  }

  return {
    burnFeeMutez: _burnFeeMutez,
    gasLimit: _gasLimit,
    minimalFeeMutez: _minimalFeeMutez,
    opSize: _opSize,
    storageLimit: _storageLimit,
    suggestedFeeMutez: _suggestedFeeMutez,
    totalCost: _totalCost,
    usingBaseFeeMutez: _usingBaseFeeMutez,
    consumedMilligas: _consumedMilligas
  };
}
