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
import { CustomConnection } from "./";
import * as Types from "..";

export function serializeCustomConnection(type: CustomConnection): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) object-type: CustomConnection");
  const sizer = new WriteSizer(sizerContext);
  writeCustomConnection(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) object-type: CustomConnection");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeCustomConnection(encoder, type);
  return buffer;
}

export function writeCustomConnection(writer: Write, type: CustomConnection): void {
  writer.writeMapLength(2);
  writer.context().push("connection", "Types.Tezos_Connection", "writing property");
  writer.writeString("connection");
  Types.Tezos_Connection.write(writer, type.connection);
  writer.context().pop();
  writer.context().push("oracleContractAddress", "string", "writing property");
  writer.writeString("oracleContractAddress");
  writer.writeString(type.oracleContractAddress);
  writer.context().pop();
}

export function deserializeCustomConnection(buffer: ArrayBuffer): CustomConnection {
  const context: Context = new Context("Deserializing object-type CustomConnection");
  const reader = new ReadDecoder(buffer, context);
  return readCustomConnection(reader);
}

export function readCustomConnection(reader: Read): CustomConnection {
  let numFields = reader.readMapLength();

  let _connection: Types.Tezos_Connection | null = null;
  let _connectionSet: bool = false;
  let _oracleContractAddress: string = "";
  let _oracleContractAddressSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "connection") {
      reader.context().push(field, "Types.Tezos_Connection", "type found, reading property");
      const object = Types.Tezos_Connection.read(reader);
      _connection = object;
      _connectionSet = true;
      reader.context().pop();
    }
    else if (field == "oracleContractAddress") {
      reader.context().push(field, "string", "type found, reading property");
      _oracleContractAddress = reader.readString();
      _oracleContractAddressSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_connection || !_connectionSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'connection: Tezos_Connection'"));
  }
  if (!_oracleContractAddressSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'oracleContractAddress: String'"));
  }

  return {
    connection: _connection,
    oracleContractAddress: _oracleContractAddress
  };
}
