import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeListTokenPairsResponse,
  deserializeListTokenPairsResponse,
  writeListTokenPairsResponse,
  readListTokenPairsResponse
} from "./serialization";
import * as Types from "..";

export class ListTokenPairsResponse {
  token_list: string | null;

  static toBuffer(type: ListTokenPairsResponse): ArrayBuffer {
    return serializeListTokenPairsResponse(type);
  }

  static fromBuffer(buffer: ArrayBuffer): ListTokenPairsResponse {
    return deserializeListTokenPairsResponse(buffer);
  }

  static write(writer: Write, type: ListTokenPairsResponse): void {
    writeListTokenPairsResponse(writer, type);
  }

  static read(reader: Read): ListTokenPairsResponse {
    return readListTokenPairsResponse(reader);
  }
}
