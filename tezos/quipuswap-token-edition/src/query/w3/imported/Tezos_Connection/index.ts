import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeTezos_Connection,
  deserializeTezos_Connection,
  writeTezos_Connection,
  readTezos_Connection
} from "./serialization";
import * as Types from "../..";

export class Tezos_Connection {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  provider: string | null;
  networkNameOrChainId: string | null;

  static toBuffer(type: Tezos_Connection): ArrayBuffer {
    return serializeTezos_Connection(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Tezos_Connection {
    return deserializeTezos_Connection(buffer);
  }

  static write(writer: Write, type: Tezos_Connection): void {
    writeTezos_Connection(writer, type);
  }

  static read(reader: Read): Tezos_Connection {
    return readTezos_Connection(reader);
  }
}
