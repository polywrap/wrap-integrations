import {
  Args_serializeTransaction,
  Args_deserializeTransaction,
  Transaction as Near_Transaction,
  Interface_Action as Near_Action,
  Args_serializeSignedTransaction,
  Interface_Transaction,
} from "./wrap";
import { BorshDeserializer, BorshSerializer } from "@serial-as/borsh";
import { Transaction } from "./classes/Transaction";
import { BigInt } from "@polywrap/wasm-as";
import { SignedTransaction } from "./classes/SignedTransaction";
import { Signature } from "./classes/Signature";

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
): Near_Transaction {
  const deserializer = new BorshDeserializer(args.transactionBytes);

  const decoded = deserializer.decode_object<Transaction>();

  return {
    signerId: decoded.signerId,
    receiverId: decoded.receiverId,
    blockHash: decoded.blockHash,
    nonce: BigInt.from(decoded.nonce),
    publicKey: {
      keyType: decoded.publicKey.keyType,
      data: decoded.publicKey.data,
    },
    actions: decoded.actions.map<Near_Action>((action) =>
      action.toNearAction()
    ),
  };
}
/* 
export function encodeBool(args: Args_encodeBool): ArrayBuffer {
  const encoder = new BorshSerializer();
  encoder.encode_bool(args.value);
  return encoder.get_encoded_object();
}

export function encodeString(args: Args_encodeString): ArrayBuffer {
  const encoder = new BorshSerializer();
  encoder.encode_string(args.value);
  return encoder.get_encoded_object();
}

export function encodeBuffer(args: Args_encodeBuffer): ArrayBuffer {
  const encoder = new BorshSerializer();
  encoder.buffer.store_bytes(
    changetype<usize>(args.value),
    args.value.byteLength
  );
  //encoder.encode_array(Uint8Array.wrap(args.bytes));
  return encoder.get_encoded_object();
}
 */
