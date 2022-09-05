import { u128 } from "as-bignum";
import { BorshSerializer, BorshDeserializer } from "@cidt/as-borsh";
import { Interface_Action } from "../wrap";
import { PublicKey } from "./PublicKey";
import { AccessKey } from "./AccessKey";
import { deserializeU128, serializeU128 } from "../utils";

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

  constructor(action: Interface_Action) {
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

  public getActionType(action: Interface_Action): string {
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

      serializeU128(serializer, this.deposit!);
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
    const index = deserializer.decode_number<u8>();
    switch (index) {
      case 0: {
        this.type = "createAccount";
        break;
      }
      case 1: {
        this.type = "deployContract";
        const codeByteLength = deserializer.decode_number<u32>();
        this.code = deserializer.decoBuffer.consume_slice(codeByteLength);
        break;
      }
      case 2: {
        this.type = "functionCall";
        this.methodName = deserializer.decode_string();

        const argsByteLength = deserializer.decode_number<u32>();
        this.args = deserializer.decoBuffer.consume_slice(argsByteLength);
        this.gas = deserializer.decode_number<u64>();
        this.deposit = deserializeU128(deserializer);
        break;
      }
      case 3: {
        this.type = "transfer";
        this.deposit = deserializeU128(deserializer);
        break;
      }
      case 4: {
        this.type = "stake";
        this.stake = deserializeU128(deserializer);
        this.publicKey = deserializer.decode_object<PublicKey>();
        break;
      }
      case 5: {
        this.type = "addKey";
        this.publicKey = deserializer.decode_object<PublicKey>();
        this.accessKey = deserializer.decode_object<AccessKey>();
        break;
      }
      case 6: {
        this.type = "deleteKey";
        this.publicKey = deserializer.decode_object<PublicKey>();
        break;
      }
      case 7: {
        this.type = "deleteAccount";
        this.beneficiaryId = deserializer.decode_string();
        break;
      }
    }

    return this;
  }
}
