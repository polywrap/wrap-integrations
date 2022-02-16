import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeTezos_EstimateResult,
  deserializeTezos_EstimateResult,
  writeTezos_EstimateResult,
  readTezos_EstimateResult
} from "./serialization";
import * as Types from "../..";

export class Tezos_EstimateResult {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  error: bool;
  reason: string | null;
  estimate: Types.Tezos_Estimate | null;

  static toBuffer(type: Tezos_EstimateResult): ArrayBuffer {
    return serializeTezos_EstimateResult(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Tezos_EstimateResult {
    return deserializeTezos_EstimateResult(buffer);
  }

  static write(writer: Write, type: Tezos_EstimateResult): void {
    writeTezos_EstimateResult(writer, type);
  }

  static read(reader: Read): Tezos_EstimateResult {
    return readTezos_EstimateResult(reader);
  }
}
