import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializelistAssetsResponse,
  deserializelistAssetsResponse,
  writelistAssetsResponse,
  readlistAssetsResponse
} from "./serialization";
import * as Types from "..";

export class listAssetsResponse {
  assets: string | null;

  static toBuffer(type: listAssetsResponse): ArrayBuffer {
    return serializelistAssetsResponse(type);
  }

  static fromBuffer(buffer: ArrayBuffer): listAssetsResponse {
    return deserializelistAssetsResponse(buffer);
  }

  static write(writer: Write, type: listAssetsResponse): void {
    writelistAssetsResponse(writer, type);
  }

  static read(reader: Read): listAssetsResponse {
    return readlistAssetsResponse(reader);
  }
}
