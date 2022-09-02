import { BorshSerializer } from "@serial-as/borsh";
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
}
