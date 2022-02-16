import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeCustomConnection,
  deserializeCustomConnection,
  writeCustomConnection,
  readCustomConnection
} from "./serialization";
import * as Types from "..";

export class CustomConnection {
  connection: Types.Tezos_Connection;
  oracleContractAddress: string;

  static toBuffer(type: CustomConnection): ArrayBuffer {
    return serializeCustomConnection(type);
  }

  static fromBuffer(buffer: ArrayBuffer): CustomConnection {
    return deserializeCustomConnection(buffer);
  }

  static write(writer: Write, type: CustomConnection): void {
    writeCustomConnection(writer, type);
  }

  static read(reader: Read): CustomConnection {
    return readCustomConnection(reader);
  }
}
