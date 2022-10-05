import {
  Args_serializeTransaction,
  Args_deserializeTransaction,
  Args_serializeSignedTransaction,
  Interface_Transaction,
  Interface_SignedTransaction,
  Args_deserializeSignedTransaction,
} from "./wrap";
import { BorshDeserializer, BorshSerializer } from "@cidt/as-borsh";
import { Transaction } from "./classes/Transaction";
import { SignedTransaction } from "./classes/SignedTransaction";
import { Signature } from "./classes/Signature";
import { toSignedTransaction, toTransaction } from "./utils/toInterface";

export function serializeTransaction(
  args: Args_serializeTransaction
): ArrayBuffer {
  const transaction = new Transaction(args.transaction);

  const serializer = new BorshSerializer();
  serializer.encode_object(transaction);

  return serializer.get_encoded_object();
}

export function serializeSignedTransaction(
  args: Args_serializeSignedTransaction
): ArrayBuffer {
  const signedTx = args.signedTransaction;

  const nearSignedTx = new SignedTransaction(
    new Transaction(signedTx.transaction),
    new Signature(signedTx.signature)
  );

  const serializer = new BorshSerializer();
  serializer.encode_object(nearSignedTx);

  return serializer.get_encoded_object();
}

export function deserializeTransaction(
  args: Args_deserializeTransaction
): Interface_Transaction {
  const deserializer = new BorshDeserializer(args.transactionBytes);

  const decoded = deserializer.decode_object<Transaction>();

  return toTransaction(decoded);
}

export function deserializeSignedTransaction(
  args: Args_deserializeSignedTransaction
): Interface_SignedTransaction {
  const deserializer = new BorshDeserializer(args.signedTxBytes);

  const decoded = deserializer.decode_object<SignedTransaction>();

  return toSignedTransaction(decoded);
}
