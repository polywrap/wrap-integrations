import { BorshSerializer } from "@serial-as/borsh";
import { u128 } from "as-bignum";


// TODO: implement u128 serialization ['deposit', 'u128']
export function serializeU128(serializer: BorshSerializer, value: u128): void {
  const buff = value.toUint8Array().buffer;
  serializer.buffer.store_bytes(changetype<usize>(buff), buff.byteLength);
  //serializer.encode_number<u128>(<u128>value);
}
