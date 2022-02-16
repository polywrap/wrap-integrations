import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeGetCandleResponse,
  deserializeGetCandleResponse,
  writeGetCandleResponse,
  readGetCandleResponse
} from "./serialization";
import * as Types from "..";

export class GetCandleResponse {
  low: string;
  open: string;
  high: string;
  asset: string;
  close: string;
  volume: string;
  endPeriod: string;
  startPeriod: string;

  static toBuffer(type: GetCandleResponse): ArrayBuffer {
    return serializeGetCandleResponse(type);
  }

  static fromBuffer(buffer: ArrayBuffer): GetCandleResponse {
    return deserializeGetCandleResponse(buffer);
  }

  static write(writer: Write, type: GetCandleResponse): void {
    writeGetCandleResponse(writer, type);
  }

  static read(reader: Read): GetCandleResponse {
    return readGetCandleResponse(reader);
  }
}
