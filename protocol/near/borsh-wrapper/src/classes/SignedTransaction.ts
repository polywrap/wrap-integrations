import { BorshDeserializer, BorshSerializer } from "@cidt/as-borsh";
import { Transaction } from "./Transaction";
import { Signature } from "./Signature";

export class SignedTransaction {
  transaction: Transaction;
  signature: Signature;
  constructor(transaction: Transaction, signature: Signature) {
    this.transaction = transaction;
    this.signature = signature;
  }

  encode(serializer: BorshSerializer): void {
    serializer.encode_object<Transaction>(this.transaction);
    serializer.encode_object<Signature>(this.signature);
  }
  decode(deserializer: BorshDeserializer): SignedTransaction {
    this.transaction = deserializer.decode_object<Transaction>();
    this.signature = deserializer.decode_object<Signature>();
    return this;
  }
}
