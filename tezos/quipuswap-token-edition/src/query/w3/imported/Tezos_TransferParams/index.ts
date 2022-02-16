import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeTezos_TransferParams,
  deserializeTezos_TransferParams,
  writeTezos_TransferParams,
  readTezos_TransferParams
} from "./serialization";
import * as Types from "../..";

export class Tezos_TransferParams {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  to: string;
  amount: u32;
  source: string | null;
  fee: Nullable<u32>;
  gasLimit: Nullable<u32>;
  storageLimit: Nullable<u32>;
  mutez: Nullable<bool>;

  static toBuffer(type: Tezos_TransferParams): ArrayBuffer {
    return serializeTezos_TransferParams(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Tezos_TransferParams {
    return deserializeTezos_TransferParams(buffer);
  }

  static write(writer: Write, type: Tezos_TransferParams): void {
    writeTezos_TransferParams(writer, type);
  }

  static read(reader: Read): Tezos_TransferParams {
    return readTezos_TransferParams(reader);
  }
}
