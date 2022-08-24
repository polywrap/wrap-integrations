import { BorshSerializer, BorshDeserializer } from "@serial-as/borsh";
import {
  Near_Transaction,
} from "../wrap";
import { Action } from "./Action";
import { PublicKey } from "./PublicKey";

export class Transaction {
  signerId: string;
  publicKey: PublicKey;
  nonce: u64;
  receiverId: string;
  actions: Action[];
  blockHash: ArrayBuffer;

  constructor(transaction: Near_Transaction) {
    this.signerId = transaction.signerId;
    this.publicKey = new PublicKey(transaction.publicKey);
    this.nonce = transaction.nonce.toUInt64();
    this.receiverId = transaction.receiverId;
    this.actions = transaction.actions.map<Action>(
      (action) => new Action(action)
    );
    this.blockHash = transaction.blockHash!;
  }

  encode(serializer: BorshSerializer): void {
    serializer.encode_string(this.signerId);
    serializer.encode_object(this.publicKey);
    serializer.encode_number<u64>(this.nonce);
    serializer.encode_string(this.receiverId);
    serializer.buffer.store_bytes(
      changetype<usize>(this.blockHash),
      this.blockHash.byteLength
    );
    //serializer.encode_object<Buffer>(this.blockHash);
    serializer.encode_array(this.actions);
  }

  decode(deserializer: BorshDeserializer): Transaction {
    const signerId = deserializer.decode_string();
    const publicKey = deserializer.decode_object<PublicKey>();
    const nonce = deserializer.decode_number<u64>();
    const receiverId = deserializer.decode_string();
    const blockHash = deserializer.decode_arraybuffer();
    const actions = deserializer.decode_array<Action[]>();

    this.signerId = signerId;
    this.publicKey = new PublicKey({
      keyType: publicKey.keyType,
      data: publicKey.data,
    });
    this.nonce = nonce;
    this.receiverId = receiverId;
    this.actions = actions;
    if (blockHash != null) {
      this.blockHash = blockHash;
    }

    return this;
  }
}
