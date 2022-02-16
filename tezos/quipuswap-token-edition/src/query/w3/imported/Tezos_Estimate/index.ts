import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeTezos_Estimate,
  deserializeTezos_Estimate,
  writeTezos_Estimate,
  readTezos_Estimate
} from "./serialization";
import * as Types from "../..";

export class Tezos_Estimate {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  burnFeeMutez: u32;
  gasLimit: u32;
  minimalFeeMutez: u32;
  opSize: string;
  storageLimit: u32;
  suggestedFeeMutez: u32;
  totalCost: u32;
  usingBaseFeeMutez: u32;
  consumedMilligas: u32;

  static toBuffer(type: Tezos_Estimate): ArrayBuffer {
    return serializeTezos_Estimate(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Tezos_Estimate {
    return deserializeTezos_Estimate(buffer);
  }

  static write(writer: Write, type: Tezos_Estimate): void {
    writeTezos_Estimate(writer, type);
  }

  static read(reader: Read): Tezos_Estimate {
    return readTezos_Estimate(reader);
  }
}
