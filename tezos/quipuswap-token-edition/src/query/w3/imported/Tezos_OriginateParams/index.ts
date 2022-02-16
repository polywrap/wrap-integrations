import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeTezos_OriginateParams,
  deserializeTezos_OriginateParams,
  writeTezos_OriginateParams,
  readTezos_OriginateParams
} from "./serialization";
import * as Types from "../..";

export class Tezos_OriginateParams {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  code: string;
  storage: string;
  balance: string | null;
  delegate: string | null;
  fee: Nullable<u32>;
  gasLimit: Nullable<u32>;
  storageLimit: Nullable<u32>;
  mutez: Nullable<bool>;
  init: string | null;

  static toBuffer(type: Tezos_OriginateParams): ArrayBuffer {
    return serializeTezos_OriginateParams(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Tezos_OriginateParams {
    return deserializeTezos_OriginateParams(buffer);
  }

  static write(writer: Write, type: Tezos_OriginateParams): void {
    writeTezos_OriginateParams(writer, type);
  }

  static read(reader: Read): Tezos_OriginateParams {
    return readTezos_OriginateParams(reader);
  }
}
