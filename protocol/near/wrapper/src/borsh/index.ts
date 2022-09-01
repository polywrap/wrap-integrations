import { BigInt } from "@polywrap/wasm-as";
import {
  Transaction as Near_Transaction,
  Action as Near_Action,
} from "../wrap";
import {
  Args_deserializeTransaction,
  Args_serializeTransaction,
} from "../wrap/Module/serialization";
import { BorshSerializer, BorshDeserializer } from "@serial-as/borsh";
import { Transaction } from "./classes/Transaction";

export function serializeTransaction(
  args: Args_serializeTransaction
): ArrayBuffer {
  const transaction = new Transaction(args.transaction);

  const serializer = new BorshSerializer();
  serializer.encode_object(transaction);

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
