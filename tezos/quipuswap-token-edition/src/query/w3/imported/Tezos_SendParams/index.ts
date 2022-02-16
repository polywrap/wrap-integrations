import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeTezos_SendParams,
  deserializeTezos_SendParams,
  writeTezos_SendParams,
  readTezos_SendParams
} from "./serialization";
import * as Types from "../..";

export class Tezos_SendParams {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  to: string;
  amount: u32;
  source: string | null;
  fee: Nullable<u32>;
  gasLimit: Nullable<u32>;
  storageLimit: Nullable<u32>;
  mutez: Nullable<bool>;

  static toBuffer(type: Tezos_SendParams): ArrayBuffer {
    return serializeTezos_SendParams(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Tezos_SendParams {
    return deserializeTezos_SendParams(buffer);
  }

  static write(writer: Write, type: Tezos_SendParams): void {
    writeTezos_SendParams(writer, type);
  }

  static read(reader: Read): Tezos_SendParams {
    return readTezos_SendParams(reader);
  }
}
