import {
  Borsh_Interface_AccessKey,
  Borsh_Interface_Action,
  Borsh_Interface_PublicKey,
  Borsh_Interface_Signature,
  Borsh_Interface_Transaction,
  Borsh_Interface_SignedTransaction as Borsh_SignedTransaction,
  Interface_AccessKey,
  Interface_Action,
  Interface_PublicKey,
  Interface_Signature,
  Interface_SignedTransaction,
  Interface_Transaction,
} from "../wrap";

export function toBorshSignedTransaction(
  signedTransaction: Interface_SignedTransaction
): Borsh_SignedTransaction {
  return {
    transaction: toBorshTransaction(signedTransaction.transaction),
    signature: toBorshSignature(signedTransaction.signature),
  };
}
export function toBorshTransaction(
  transaction: Interface_Transaction
): Borsh_Interface_Transaction {
  return {
    signerId: transaction.signerId,
    actions: transaction.actions.map<Borsh_Interface_Action>((action) =>
      toBorshAction(action)
    ),
    blockHash: transaction.blockHash,
    nonce: transaction.nonce,
    publicKey: toBorshPublicKey(transaction.publicKey),
    receiverId: transaction.receiverId,
  };
}

export function toBorshAction(
  action: Interface_Action
): Borsh_Interface_Action {
  let result = {} as Borsh_Interface_Action;

  if (action.accessKey != null) {
    result.accessKey = toBorshAccessKey(action.accessKey!);
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
    result.deposit = action.deposit!;
  }
  if (action.gas) {
    result.gas = action.gas;
  }

  if (action.methodName != null) {
    result.methodName = action.methodName;
  }
  if (action.publicKey != null) {
    result.publicKey = toBorshPublicKey(action.publicKey!);
  }
  if (action.stake) {
    result.stake = action.stake!;
  }

  return result;
}

export function toBorshPublicKey(
  publicKey: Interface_PublicKey
): Borsh_Interface_PublicKey {
  return { keyType: publicKey.keyType, data: publicKey.data };
}

export function toBorshAccessKey(
  accessKey: Interface_AccessKey
): Borsh_Interface_AccessKey {
  return {
    nonce: accessKey.nonce,
    permission: {
      allowance: accessKey.permission.allowance,
      isFullAccess: accessKey.permission.isFullAccess,
      methodNames: accessKey.permission.methodNames,
      receiverId: accessKey.permission.receiverId,
    },
  };
}

export function toBorshSignature(
  signature: Interface_Signature
): Borsh_Interface_Signature {
  return {
    keyType: signature.keyType,
    data: signature.data,
  };
}
