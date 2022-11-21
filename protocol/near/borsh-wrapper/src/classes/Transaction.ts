import { BorshSerializer, BorshDeserializer } from "@cidt/as-borsh";
import { Interface_Transaction } from "../wrap";
import { Action } from "./Action";
import { PublicKey } from "./PublicKey";

export class Transaction {
  signerId: string;
  publicKey: PublicKey;
  nonce: u64;
  receiverId: string;
  actions: Action[];
  blockHash: ArrayBuffer;

  constructor(transaction: Interface_Transaction) {
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
    serializer.encode_array(this.actions);
  }

  decode(deserializer: BorshDeserializer): Transaction {
    this.signerId = deserializer.decode_string();
    this.publicKey = deserializer.decode_object<PublicKey>();
    this.nonce = deserializer.decode_number<u64>();
    this.receiverId = deserializer.decode_string();
    this.blockHash = deserializer.decoBuffer.consume_slice(32);
    this.actions = deserializer.decode_array<Action[]>();
    return this;
  }
}
