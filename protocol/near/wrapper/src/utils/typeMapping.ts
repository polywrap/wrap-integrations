import {
  Interface_AccessKey as AccessKey,
  Interface_Action as Action,
  Near_Near_AccessKey,
  Near_Near_Action,
  Near_Near_PublicKey,
  Near_Near_Transaction,
  Interface_PublicKey as PublicKey,
  Interface_Transaction as Transaction,
  Interface_Transaction,
} from "../wrap";

export function toPluginTransaction(
  transaction: Interface_Transaction
): Near_Near_Transaction {
  return {
    signerId: transaction.signerId,
    actions: transaction.actions.map<Near_Near_Action>((action) =>
      toPluginAction(action)
    ),
    blockHash: transaction.blockHash,
    nonce: transaction.nonce,
    publicKey: toPluginPublicKey(transaction.publicKey),
    receiverId: transaction.receiverId,
  };
}
export function fromPluginTransaction(
  transaction: Near_Near_Transaction
): Transaction {
  return {
    signerId: transaction.signerId,
    actions: transaction.actions.map<Action>((action) =>
      fromPluginAction(action)
    ),
    blockHash: transaction.blockHash,
    nonce: transaction.nonce,
    publicKey: fromPluginPublicKey(transaction.publicKey),
    receiverId: transaction.receiverId,
  };
}

export function toPluginAction(action: Action): Near_Near_Action {
  let result = {} as Near_Near_Action;

  if (action.accessKey != null) {
    result.accessKey = toPluginAccessKey(action.accessKey!);
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
    result.publicKey = toPluginPublicKey(action.publicKey!);
  }
  if (action.stake) {
    result.stake = action.stake!;
  }

  return result;
}

export function fromPluginAction(action: Near_Near_Action): Action {
  let result = {} as Action;
  //TODO deserializtion?
  return result;
}

export function toPluginPublicKey(publicKey: PublicKey): Near_Near_PublicKey {
  return { keyType: publicKey.keyType, data: publicKey.data };
}

export function fromPluginPublicKey(publicKey: Near_Near_PublicKey): PublicKey {
  return { keyType: publicKey.keyType, data: publicKey.data };
}

export function toPluginAccessKey(accessKey: AccessKey): Near_Near_AccessKey {
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
