import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeTezos_OperationStatus,
  deserializeTezos_OperationStatus,
  writeTezos_OperationStatus,
  readTezos_OperationStatus
} from "./serialization";
import * as Types from "../..";

export class Tezos_OperationStatus {

  public static uri: string = "w3://ens/tezos.web3api.eth";

  hash: string;
  m_type: string;
  block: string;
  time: string;
  height: string;
  cycle: u32;
  counter: u32;
  status: string;
  is_success: bool;
  is_contract: bool;
  gas_limit: u32;
  gas_used: u32;
  gas_price: u32;
  storage_limit: u32;
  storage_size: u32;
  storage_paid: u32;
  volume: u32;
  fee: u32;
  days_destroyed: u32;
  sender: string;
  receiver: string;
  confirmations: u32;

  static toBuffer(type: Tezos_OperationStatus): ArrayBuffer {
    return serializeTezos_OperationStatus(type);
  }

  static fromBuffer(buffer: ArrayBuffer): Tezos_OperationStatus {
    return deserializeTezos_OperationStatus(buffer);
  }

  static write(writer: Write, type: Tezos_OperationStatus): void {
    writeTezos_OperationStatus(writer, type);
  }

  static read(reader: Read): Tezos_OperationStatus {
    return readTezos_OperationStatus(reader);
  }
}
