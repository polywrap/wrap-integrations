import { BorshSerializer } from "@serial-as/borsh";
import { Signature as Near_Signature } from "../../wrap";

export class Signature {
  data: ArrayBuffer;
  keyType: u8;

  constructor(signature: Near_Signature) {
    this.data = Uint8Array.wrap(signature.data).buffer;
    this.keyType = <u8>signature.keyType;
  }

  encode(serializer: BorshSerializer): void {
    serializer.encode_number<u8>(this.keyType);
    //serializer.encode_arraybuffer(this.data);
    serializer.buffer.store_bytes(
      changetype<usize>(this.data),
      this.data.byteLength
    );
  }
}