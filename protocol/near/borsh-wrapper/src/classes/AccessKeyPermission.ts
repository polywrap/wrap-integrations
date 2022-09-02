import { BorshSerializer } from "@serial-as/borsh";
import { u128 } from "as-bignum";
import { Interface_AccessKeyPermission as Near_AccessKeyPermission } from "../wrap";
import { serializeU128 } from "../utils";

export default class AccessKeyPermission {
  isFullAccess: boolean;
  allowance: u128 | null;
  receiverId: string | null;
  methodNames: string[] | null;

  constructor(permission: Near_AccessKeyPermission) {
    if (permission.isFullAccess) {
      this.isFullAccess = true;
    } else {
      this.isFullAccess = false;
      if (permission.allowance) {
        this.allowance = u128.from(permission.allowance!.toString());
      }
      this.methodNames = permission.methodNames!;
      this.receiverId = permission.receiverId!;
    }
  }

  encode(serializer: BorshSerializer): void {
    if (this.isFullAccess == true) {
      serializer.encode_number<u8>(1); // 1 is index of 'fullAccess' in schema
    } else {
      serializer.encode_number<u8>(0); // 0 is index of 'functionCall' in schema
      if (!this.allowance) {
        serializer.encode_number<u8>(0);
      } else {
        serializer.encode_number<u8>(1);
        serializeU128(serializer, this.allowance!);
      }
      serializer.encode_string(this.receiverId!);
      serializer.encode_array(this.methodNames!);
    }
  }
}
