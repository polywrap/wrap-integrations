import { BorshDeserializer, BorshSerializer } from "@cidt/as-borsh";
import { Interface_PublicKey as Near_PublicKey } from "../wrap";

export class PublicKey {
  data: ArrayBuffer;
  keyType: u8;

  constructor(publicKey: Near_PublicKey) {
    this.data = Uint8Array.wrap(publicKey.data).buffer;
    this.keyType = <u8>publicKey.keyType;
  }

  encode(serializer: BorshSerializer): void {
    //['keyType', 'u8'],
    //['data', [32]]
    serializer.encode_number<u8>(this.keyType);
    serializer.buffer.store_bytes(
      changetype<usize>(this.data),
      this.data.byteLength
    );
  }

  decode(deserializer: BorshDeserializer): PublicKey {
    this.keyType = deserializer.decode_number<u8>();
    this.data = deserializer.decoBuffer.consume_slice(32);
    return this;
  }
}
