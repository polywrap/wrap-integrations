import { BorshDeserializer, BorshSerializer } from "@serial-as/borsh";
import { PublicKey as Near_PublicKey } from "../../wrap";

export class PublicKey {
  data: ArrayBuffer;
  keyType: u8;

  constructor(publicKey: Near_PublicKey) {
    this.data = Uint8Array.wrap(publicKey.data).buffer;
    this.keyType = <u8>publicKey.keyType;
  }

  encode(serializer: BorshSerializer): void {
    serializer.encode_number<u8>(this.keyType);
    //serializer.encode_arraybuffer(this.data);
    serializer.buffer.store_bytes(
      changetype<usize>(this.data),
      this.data.byteLength
    );
  }

  decode(deserializer: BorshDeserializer): PublicKey {
    const keyType = deserializer.decode_number<u8>();
    const data = deserializer.decode_arraybuffer();
    this.keyType = keyType;
    this.data = data;
    return this;
  }

  static decode(bytes: ArrayBuffer): PublicKey {
    const deserializer = new BorshDeserializer(bytes);
    const keyType = deserializer.decode_i32();
    const data = deserializer.decode_arraybuffer();
    return new PublicKey({ keyType, data });
  }
}
