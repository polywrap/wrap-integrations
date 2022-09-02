import { u128 } from "as-bignum";
import { BigInt } from "@polywrap/wasm-as";
import { BorshSerializer, BorshDeserializer } from "@serial-as/borsh";
import { Interface_Action as Near_Action } from "../wrap";
import { PublicKey } from "./PublicKey";
import { AccessKey } from "./AccessKey";
import { serializeU128 } from "../utils";

export class Action {
  accessKey: AccessKey | null;
  args: ArrayBuffer | null;
  beneficiaryId: string | null;
  code: ArrayBuffer | null;
  deposit: u128 | null; //nullable
  gas: u64; //nullable
  methodName: string | null;
  publicKey: PublicKey | null;
  stake: u128 | null; //nullable
  type: string;

  constructor(action: Near_Action) {
    this.type = "";
    this.type = this.getActionType(action);

    if (action.accessKey != null) {
      this.accessKey = new AccessKey(action.accessKey!);
    }
    if (action.args != null) {
      this.args = action.args!;
    }
    if (action.beneficiaryId != null) {
      this.beneficiaryId = action.beneficiaryId!;
    }
    if (action.code != null) {
      this.code = action.code!;
    }

    if (action.deposit) {
      this.deposit = u128.from(action.deposit!.toString());
    }

    if (action.gas) {
      this.gas = action.gas!.toUInt64();
    }

    if (action.methodName != null) {
      this.methodName = action.methodName!;
    }

    if (action.publicKey != null) {
      this.publicKey = new PublicKey(action.publicKey!);
    }

    if (action.stake) {
      this.stake = u128.from(action.stake!.toString());
    }
  }

  public getActionType(action: Near_Action): string {
    /*     if (
      (action.accessKey == null,
      action.args == null,
      action.beneficiaryId == null,
      action.code == null,
      action.deposit == null,
      action.gas == null,
      action.methodName == null,
      action.publicKey == null,
      action.stake == null)
    ) {
      this.type = " createAccount";
    } */

    if (action.code != null) return "deployContract";

    if (
      action.methodName != null &&
      action.args != null &&
      action.deposit &&
      action.gas
    ) {
      return "functionCall";
    }

    if (action.deposit) return "transfer";
    if (action.stake && action.publicKey != null) return "stake";
    if (action.publicKey != null && action.accessKey != null) return "addKey";
    if (action.publicKey != null) return "deleteKey";
    if (action.beneficiaryId != null) return "deleteAccount";
    return "createAccount";
  }

  encode(serializer: BorshSerializer): void {
    if (this.type == "createAccount") {
      serializer.encode_number<u8>(0); // 0 is index of 'createAccount' in schema
      //serializer.buffer.store_bytes(changetype<usize>(1), 1);
      return;
    }

    if (this.type == "deployContract") {
      serializer.encode_number<u8>(1); // 1 is index of 'deployContract' in schema

      serializer.encode_number<u32>(this.code!.byteLength); // ['code', ['u8']]
      serializer.buffer.store_bytes(
        changetype<usize>(this.code!),
        this.code!.byteLength
      );
      return;
    }
    if (this.type == "functionCall") {
      serializer.encode_number<u8>(2); // 2 is index of 'functionCall' in schema
      serializer.encode_string(this.methodName!); // ['methodName', 'string']

      serializer.encode_number<u32>(this.args!.byteLength); // ['args', ['u8']],
      serializer.buffer.store_bytes(
        changetype<usize>(this.args!),
        this.args!.byteLength
      );

      serializer.encode_number<u64>(this.gas); // ['gas', 'u64'],

      serializeU128(serializer, this.deposit!)
    }

    if (this.type == "transfer") {
      serializer.encode_number<u8>(3); // 3 is index of 'transfer' in schema

      serializeU128(serializer, this.deposit!); // ['deposit', 'u128']
      return;
    }

    if (this.type == "stake") {
      serializer.encode_number<u8>(4); // 4 is index of 'stake' in schema

      serializeU128(serializer, this.stake!); // ['stake', 'u128']

      serializer.encode_object(this.publicKey!);
      return;
    }

    if (this.type == "addKey") {
      serializer.encode_number<u8>(5); // 5 is index of 'addKey' in schema

      serializer.encode_object(this.publicKey!);
      serializer.encode_object(this.accessKey!);
    }

    if (this.type == "deleteKey") {
      serializer.encode_number<u8>(6); // 6 is index of 'deleteKey' in schema

      serializer.encode_object(this.publicKey!);
    }
    if (this.type == "deleteAccount") {
      serializer.encode_number<u8>(7); // 7 is index of 'deleteAccount' in schema

      serializer.encode_string(this.beneficiaryId!);
    }
  }

  decode(deserializer: BorshDeserializer): Action {
    //const type = deserializer.decode_field<ActionType>("enum");
    //@ts-ignore
    this.type = "createAccount";

    //const accessKey = deserializer.
    /*     this.args = deserializer.decode_nullable<ArrayBuffer>();
    this.beneficiaryId = deserializer.decode_nullable<string>();
    this.code = deserializer.decode_nullable<ArrayBuffer>();
    this.deposit = deserializer.decode_number<u64>();
    this.gas = deserializer.decode_number<u64>();
    this.methodName = deserializer.decode_nullable<string>();
    this.publicKey = deserializer.decode_nullable<PublicKey>();
    this.stake = deserializer.decode_number<u64>(); */

    return this;
  }

  // FOR deserialization
  toNearAction(): Near_Action {
    const action = <Near_Action>{};
    if (this.methodName) {
      action.methodName = this.methodName;
    }
    if (this.deposit) {
      action.deposit = BigInt.from(this.deposit);
    }
    return action;
  }
}
