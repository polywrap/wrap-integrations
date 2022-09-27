import { BorshDeserializer, BorshSerializer } from "@cidt/as-borsh";
import { Interface_AccessKey as Near_AccessKey } from "../wrap";
import AccessKeyPermission from "./AccessKeyPermission";

export class AccessKey {
  nonce: u64;
  permission: AccessKeyPermission;

  constructor(accessKey: Near_AccessKey) {
    this.nonce = accessKey.nonce.toUInt64();
    this.permission = new AccessKeyPermission(accessKey.permission);
  }

  encode(serializer: BorshSerializer): void {
    serializer.encode_number<u64>(this.nonce);
    serializer.encode_object<AccessKeyPermission>(this.permission!);
  }
  decode(deserializer: BorshDeserializer): AccessKey {
    this.nonce = deserializer.decode_number<u64>();
    this.permission = deserializer.decode_object<AccessKeyPermission>();
    return this;
  }
}
