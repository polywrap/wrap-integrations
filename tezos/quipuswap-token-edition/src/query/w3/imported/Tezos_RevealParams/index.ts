import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeTezos_RevealParams,
  deserializeTezos_RevealParams,
  writeTezos_RevealParams,
  readTezos_RevealParams
} from "./serialization";
import * as Types from "../..";

export class Tezos_RevealParams {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  fee: Nullable<u32>;
  gasLimit: Nullable<u32>;
  storageLimit: Nullable<u32>;

  static toBuffer(type: Tezos_RevealParams): ArrayBuffer {
    return serializeTezos_RevealParams(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Tezos_RevealParams {
    return deserializeTezos_RevealParams(buffer);
  }

  static write(writer: Write, type: Tezos_RevealParams): void {
    writeTezos_RevealParams(writer, type);
  }

  static read(reader: Read): Tezos_RevealParams {
    return readTezos_RevealParams(reader);
  }
}
