import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeGetLPTokenBalanceResponse,
  deserializeGetLPTokenBalanceResponse,
  writeGetLPTokenBalanceResponse,
  readGetLPTokenBalanceResponse
} from "./serialization";
import * as Types from "..";

export class GetLPTokenBalanceResponse {
  balance: string;

  static toBuffer(type: GetLPTokenBalanceResponse): ArrayBuffer {
    return serializeGetLPTokenBalanceResponse(type);
  }

  static fromBuffer(buffer: ArrayBuffer): GetLPTokenBalanceResponse {
    return deserializeGetLPTokenBalanceResponse(buffer);
  }

  static write(writer: Write, type: GetLPTokenBalanceResponse): void {
    writeGetLPTokenBalanceResponse(writer, type);
  }

  static read(reader: Read): GetLPTokenBalanceResponse {
    return readGetLPTokenBalanceResponse(reader);
  }
}
