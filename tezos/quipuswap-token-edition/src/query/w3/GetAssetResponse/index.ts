import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeGetAssetResponse,
  deserializeGetAssetResponse,
  writeGetAssetResponse,
  readGetAssetResponse
} from "./serialization";
import * as Types from "..";

export class GetAssetResponse {
  low: string;
  open: string;
  high: string;
  asset: string;
  close: string;
  volume: string;
  endPeriod: string;
  startPeriod: string;

  static toBuffer(type: GetAssetResponse): ArrayBuffer {
    return serializeGetAssetResponse(type);
  }

  static fromBuffer(buffer: ArrayBuffer): GetAssetResponse {
    return deserializeGetAssetResponse(buffer);
  }

  static write(writer: Write, type: GetAssetResponse): void {
    writeGetAssetResponse(writer, type);
  }

  static read(reader: Read): GetAssetResponse {
    return readGetAssetResponse(reader);
  }
}
