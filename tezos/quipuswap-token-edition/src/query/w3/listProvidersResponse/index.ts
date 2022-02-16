import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializelistProvidersResponse,
  deserializelistProvidersResponse,
  writelistProvidersResponse,
  readlistProvidersResponse
} from "./serialization";
import * as Types from "..";

export class listProvidersResponse {
  providers: string | null;

  static toBuffer(type: listProvidersResponse): ArrayBuffer {
    return serializelistProvidersResponse(type);
  }

  static fromBuffer(buffer: ArrayBuffer): listProvidersResponse {
    return deserializelistProvidersResponse(buffer);
  }

  static write(writer: Write, type: listProvidersResponse): void {
    writelistProvidersResponse(writer, type);
  }

  static read(reader: Read): listProvidersResponse {
    return readlistProvidersResponse(reader);
  }
}
