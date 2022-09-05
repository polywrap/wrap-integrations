import { BorshDeserializer, BorshSerializer } from "@cidt/as-borsh";
import { u128 } from "as-bignum";

export function serializeU128(serializer: BorshSerializer, value: u128): void {
  const buff = value.toUint8Array().buffer;
  serializer.buffer.store_bytes(changetype<usize>(buff), buff.byteLength);
}

export function deserializeU128(deserializer: BorshDeserializer): u128 {
  const bytes = deserializer.decoBuffer.consume_slice(16)
  return u128.fromBytes(Uint8Array.wrap(bytes));
}
