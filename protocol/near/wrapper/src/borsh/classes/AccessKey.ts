import { BorshDeserializer, BorshSerializer } from "@serial-as/borsh";
import {
  AccessKey as Near_AccessKey,
  PublicKey as Near_PublicKey,
} from "../../wrap";
import AccessKeyPermission from "./AccessKeyPermission";

export class AccessKey {
  nonce: u64;
  permission: AccessKeyPermission | null;

  constructor(accessKey: Near_AccessKey) {
    this.nonce = <u64>0; // accessKey.nonce.toUInt64(); // TODO: Nonce for new keys is always 0 
    this.permission = new AccessKeyPermission(accessKey.permission);
  }

  encode(serializer: BorshSerializer): void {
    serializer.encode_number<u64>(this.nonce);
    serializer.encode_object<AccessKeyPermission>(this.permission!);
  }

  //   decode(deserializer: BorshDeserializer): AccessKey {}
}
