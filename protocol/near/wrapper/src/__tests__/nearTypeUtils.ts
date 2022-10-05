import {
  Interface_PublicKey as PublicKey,
  Interface_Signature as Signature,
  Interface_Transaction as Transaction,
  Interface_Action,
  Interface_AccessKey as Near_AccessKey,
  Interface_Transaction,
  Interface_SignedTransaction,
} from "../wrap";
import {
  isAddKey,
  isCreateAccount,
  isDeleteAccount,
  isDeleteKey,
  isDeployContract,
  isFunctionCall,
  isStake,
  isTransfer,
  keyTypeFromStr,
  publicKeyToStr,
} from "./typeUtils";

import * as nearApi from "near-api-js";
import BN from "bn.js";

export const fromAction = (
  action: Interface_Action
): nearApi.transactions.Action => {
  if (isCreateAccount(action)) {
    return nearApi.transactions.createAccount();
  } else if (isDeployContract(action)) {
    return nearApi.transactions.deployContract(action.code as Uint8Array);
  } else if (isFunctionCall(action)) {
    return nearApi.transactions.functionCall(
      action.methodName!,
      action.args ?? new Uint8Array(),
      new BN(action.gas!.toString()),
      new BN(action.deposit!.toString())
    );
  } else if (isTransfer(action)) {
    return nearApi.transactions.transfer(new BN(action.deposit!.toString()));
  } else if (isStake(action)) {
    const publicKey = fromPublicKey(action.publicKey!);
    return nearApi.transactions.stake(
      new BN(action.stake!.toString()),
      publicKey
    );
  } else if (isAddKey(action)) {
    const publicKey = fromPublicKey(action.publicKey!);
    const accessKey = fromAccessKey(action.accessKey!);
    return nearApi.transactions.addKey(publicKey, accessKey);
  } else if (isDeleteKey(action)) {
    const publicKey = fromPublicKey(action.publicKey!);
    return nearApi.transactions.deleteKey(publicKey);
  } else if (isDeleteAccount(action)) {
    return nearApi.transactions.deleteAccount(action.beneficiaryId!);
  } else {
    throw Error("Failed to map type Action to nearApi.transactions.Action");
  }
};

export const fromTx = (
  tx: Transaction | Interface_Transaction
): nearApi.transactions.Transaction => {
  return new nearApi.transactions.Transaction({
    signerId: tx.signerId,
    publicKey: fromPublicKey(tx.publicKey),
    nonce: Number.parseInt(tx.nonce.toString()),
    receiverId: tx.receiverId,
    blockHash: tx.blockHash,
    actions: tx.actions.map(fromAction),
  });
};

export const fromSignedTx = (
  signedTx: Interface_SignedTransaction
): nearApi.transactions.SignedTransaction => {
  return new nearApi.transactions.SignedTransaction({
    //@ts-ignore
    transaction: fromTx(signedTx.transaction),
    signature: fromSignature(signedTx.signature),
  });
};

export const fromSignature = (
  signature: Signature
): nearApi.transactions.Signature => {
  const keyType =
    typeof signature.keyType === "number"
      ? (signature.keyType as number)
      : "ed25519";
  return new nearApi.transactions.Signature({
    keyType: keyType,
    data: signature.data,
  });
};

export const toPublicKey = (
  key: nearApi.utils.PublicKey | string
): PublicKey => {
  if (typeof key === "string") {
    const [keyTypeStr, keyStr] = key.split(":");
    const decodedData: Uint8Array = nearApi.utils.serialize.base_decode(keyStr);
    return { keyType: keyTypeFromStr(keyTypeStr), data: decodedData };
  } else {
    return { keyType: key.keyType as number, data: key.data };
  }
};

export const fromPublicKey = (key: PublicKey): nearApi.utils.PublicKey => {
  return nearApi.utils.PublicKey.from(publicKeyToStr(key));
};

export const fromAccessKey = (
  key: Near_AccessKey
): nearApi.transactions.AccessKey => {
  //https://github.com/near/near-api-js/blob/26b3dd2f55ef97107c429fdfa704de566617c9b3/lib/transaction.js#L23
  if (key.permission.isFullAccess) {
    return nearApi.transactions.fullAccessKey();
  } else {
    const functionCallPermission = key.permission;
    const args: [string, string[], BN?] = [
      functionCallPermission.receiverId!,
      functionCallPermission.methodNames!,
    ];
    if (functionCallPermission.allowance !== null) {
      args.push(new BN(functionCallPermission.allowance!.toString()));
    }
    return nearApi.transactions.functionCallAccessKey(...args);
  }
};
