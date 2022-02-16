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
import { Tezos_EstimateResult } from "./";
import * as Types from "../..";

export function serializeTezos_EstimateResult(type: Tezos_EstimateResult): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing)  imported object-type: Tezos_EstimateResult");
  const sizer = new WriteSizer(sizerContext);
  writeTezos_EstimateResult(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) import object-type: Tezos_EstimateResult");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeTezos_EstimateResult(encoder, type);
  return buffer;
}

export function writeTezos_EstimateResult(writer: Write, type: Tezos_EstimateResult): void {
  writer.writeMapLength(3);
  writer.context().push("error", "bool", "writing property");
  writer.writeString("error");
  writer.writeBool(type.error);
  writer.context().pop();
  writer.context().push("reason", "string | null", "writing property");
  writer.writeString("reason");
  writer.writeNullableString(type.reason);
  writer.context().pop();
  writer.context().push("estimate", "Types.Tezos_Estimate | null", "writing property");
  writer.writeString("estimate");
  if (type.estimate) {
    Types.Tezos_Estimate.write(writer, type.estimate as Types.Tezos_Estimate);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
}

export function deserializeTezos_EstimateResult(buffer: ArrayBuffer): Tezos_EstimateResult {
  const context: Context = new Context("Deserializing imported object-type Tezos_EstimateResult");
  const reader = new ReadDecoder(buffer, context);
  return readTezos_EstimateResult(reader);
}

export function readTezos_EstimateResult(reader: Read): Tezos_EstimateResult {
  let numFields = reader.readMapLength();

  let _error: bool = false;
  let _errorSet: bool = false;
  let _reason: string | null = null;
  let _estimate: Types.Tezos_Estimate | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "error") {
      reader.context().push(field, "bool", "type found, reading property");
      _error = reader.readBool();
      _errorSet = true;
      reader.context().pop();
    }
    else if (field == "reason") {
      reader.context().push(field, "string | null", "type found, reading property");
      _reason = reader.readNullableString();
      reader.context().pop();
    }
    else if (field == "estimate") {
      reader.context().push(field, "Types.Tezos_Estimate | null", "type found, reading property");
      let object: Types.Tezos_Estimate | null = null;
      if (!reader.isNextNil()) {
        object = Types.Tezos_Estimate.read(reader);
      }
      _estimate = object;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_errorSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'error: Boolean'"));
  }

  return {
    error: _error,
    reason: _reason,
    estimate: _estimate
  };
}
