import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeGetNormalizedPriceResponse,
  deserializeGetNormalizedPriceResponse,
  writeGetNormalizedPriceResponse,
  readGetNormalizedPriceResponse
} from "./serialization";
import * as Types from "..";

export class GetNormalizedPriceResponse {
  price: string;

  static toBuffer(type: GetNormalizedPriceResponse): ArrayBuffer {
    return serializeGetNormalizedPriceResponse(type);
  }

  static fromBuffer(buffer: ArrayBuffer): GetNormalizedPriceResponse {
    return deserializeGetNormalizedPriceResponse(buffer);
  }

  static write(writer: Write, type: GetNormalizedPriceResponse): void {
    writeGetNormalizedPriceResponse(writer, type);
  }

  static read(reader: Read): GetNormalizedPriceResponse {
    return readGetNormalizedPriceResponse(reader);
  }
}
