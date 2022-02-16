import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeGetTokenSupplyResponse,
  deserializeGetTokenSupplyResponse,
  writeGetTokenSupplyResponse,
  readGetTokenSupplyResponse
} from "./serialization";
import * as Types from "..";

export class GetTokenSupplyResponse {
  token_a_pool: string;
  token_b_pool: string;
  total_supply: string;

  static toBuffer(type: GetTokenSupplyResponse): ArrayBuffer {
    return serializeGetTokenSupplyResponse(type);
  }

  static fromBuffer(buffer: ArrayBuffer): GetTokenSupplyResponse {
    return deserializeGetTokenSupplyResponse(buffer);
  }

  static write(writer: Write, type: GetTokenSupplyResponse): void {
    writeGetTokenSupplyResponse(writer, type);
  }

  static read(reader: Read): GetTokenSupplyResponse {
    return readGetTokenSupplyResponse(reader);
  }
}
