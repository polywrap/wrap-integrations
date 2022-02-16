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
import { Tezos_Connection } from "./";
import * as Types from "../..";

export function serializeTezos_Connection(type: Tezos_Connection): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing)  imported object-type: Tezos_Connection");
  const sizer = new WriteSizer(sizerContext);
  writeTezos_Connection(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) import object-type: Tezos_Connection");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeTezos_Connection(encoder, type);
  return buffer;
}

export function writeTezos_Connection(writer: Write, type: Tezos_Connection): void {
  writer.writeMapLength(2);
  writer.context().push("provider", "string | null", "writing property");
  writer.writeString("provider");
  writer.writeNullableString(type.provider);
  writer.context().pop();
  writer.context().push("networkNameOrChainId", "string | null", "writing property");
  writer.writeString("networkNameOrChainId");
  writer.writeNullableString(type.networkNameOrChainId);
  writer.context().pop();
}

export function deserializeTezos_Connection(buffer: ArrayBuffer): Tezos_Connection {
  const context: Context = new Context("Deserializing imported object-type Tezos_Connection");
  const reader = new ReadDecoder(buffer, context);
  return readTezos_Connection(reader);
}

export function readTezos_Connection(reader: Read): Tezos_Connection {
  let numFields = reader.readMapLength();

  let _provider: string | null = null;
  let _networkNameOrChainId: string | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "provider") {
      reader.context().push(field, "string | null", "type found, reading property");
      _provider = reader.readNullableString();
      reader.context().pop();
    }
    else if (field == "networkNameOrChainId") {
      reader.context().push(field, "string | null", "type found, reading property");
      _networkNameOrChainId = reader.readNullableString();
      reader.context().pop();
    }
    reader.context().pop();
  }


  return {
    provider: _provider,
    networkNameOrChainId: _networkNameOrChainId
  };
}
