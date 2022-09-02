import { BigInt } from "@polywrap/wasm-as";
import { AccessKey } from "../classes/AccessKey";
import AccessKeyPermission from "../classes/AccessKeyPermission";
import { Action } from "../classes/Action";
import { PublicKey } from "../classes/PublicKey";
import { Signature } from "../classes/Signature";
import { SignedTransaction } from "../classes/SignedTransaction";
import { Transaction } from "../classes/Transaction";
import {
  Interface_AccessKey,
  Interface_AccessKeyPermission,
  Interface_Action,
  Interface_PublicKey,
  Interface_Signature,
  Interface_SignedTransaction,
  Interface_Transaction,
} from "../wrap";

export function toSignedTransaction(
  signedTx: SignedTransaction
): Interface_SignedTransaction {
  return {
    signature: toSignature(signedTx.signature),
    transaction: toTransaction(signedTx.transaction),
  } as Interface_SignedTransaction;
}

export function toTransaction(transaction: Transaction): Interface_Transaction {
  return {
    signerId: transaction.signerId,
    receiverId: transaction.receiverId,
    blockHash: transaction.blockHash,
    nonce: BigInt.from(transaction.nonce),
    publicKey: toPublicKey(transaction.publicKey),
    actions: transaction.actions.map<Interface_Action>((action) =>
      toAction(action)
    ),
  } as Interface_Transaction;
}

export function toAction(action: Action): Interface_Action {
  const result = <Interface_Action>{};

  if (action.accessKey != null) {
    result.accessKey = toAccessKey(action.accessKey!);
  }
  if (action.args != null) {
    result.args = action.args;
  }
  if (action.beneficiaryId != null) {
    result.beneficiaryId = action.beneficiaryId;
  }
  if (action.code != null) {
    result.code = action.code;
  }

  if (action.deposit) {
    const str = action.deposit!.toString();
    result.deposit = BigInt.from(str);
  }
  if (action.gas) {
    result.gas = BigInt.fromUInt64(action.gas!);
  }

  if (action.methodName != null) {
    result.methodName = action.methodName;
  }
  if (action.publicKey != null) {
    result.publicKey = toPublicKey(action.publicKey!);
  }
  if (action.stake) {
    const str = action.stake!.toString();
    result.stake = BigInt.from(str);
  }
  return result;
}

export function toSignature(signature: Signature): Interface_Signature {
  return {
    keyType: signature.keyType,
    data: signature.data,
  } as Interface_Signature;
}

export function toPublicKey(pk: PublicKey): Interface_PublicKey {
  return { keyType: pk.keyType, data: pk.data } as Interface_PublicKey;
}

export function toAccessKey(accessKey: AccessKey): Interface_AccessKey {
  return {
    nonce: BigInt.from(accessKey.nonce),
    permission: toAccessKeyPermission(accessKey.permission),
  } as Interface_AccessKey;
}

export function toAccessKeyPermission(
  permission: AccessKeyPermission
): Interface_AccessKeyPermission {
  if (permission.isFullAccess) {
    return { isFullAccess: true } as Interface_AccessKeyPermission;
  } else {
    return {
      isFullAccess: false,
      allowance: BigInt.from(permission.allowance!.toString()),
      methodNames: permission.methodNames!,
      receiverId: permission.receiverId!,
    };
  }
}
