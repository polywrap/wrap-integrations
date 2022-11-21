import {
  BlockResult,
  Args_createTransaction,
  Near_Module,
  AccessKeyInfo,
  Args_sendMoney,
  Args_signAndSendTransactionAsync,
  Args_deleteKey,
  Args_createAndDeployContract,
  Args_signAndSendTransaction,
  Args_createAccount,
  Args_deployContract,
  Args_functionCall,
  Args_addKey,
  Args_deleteAccount,
  SignTransactionResult,
  Args_sendTransaction,
  Args_sendTransactionAsync,
  Interface_SignedTransaction,
  Interface_AccessKey,
  Interface_Transaction,
  Interface_Action,
  Args_signTransaction,
  Interface_FinalExecutionOutcome,
  Near_Near_Action,
  Borsh_Module,
  Args_createMasterAccount,
} from "../wrap";
import * as bs58 from "as-base58";
import * as bs64 from "as-base64";
import { BigInt, JSON, JSONEncoder } from "@polywrap/wasm-as";
import {
  fullAccessKey,
  functionCallAccessKey,
  publicKeyFromStr,
} from "../utils/typeUtils";
import { toFinalExecutionOutcome } from "../utils/jsonMap";

import * as action from "../utils/actionCreators";
import * as NEAR_READ from "../modules/read";

import { fromPluginTransaction, toPluginAction } from "../utils/typeMapping";
import JsonRpcProvider from "../utils/JsonRpcProvider";
import { toBorshSignedTransaction, toBorshTransaction } from "../utils/toBorsh";

export function createTransaction(
  args: Args_createTransaction
): Interface_Transaction {
  if (args.signerId == null) {
    const result = Near_Module.createTransactionWithWallet({
      receiverId: args.receiverId,
      actions: args.actions.map<Near_Near_Action>((action) =>
        toPluginAction(action)
      ),
    }).unwrap();

    return fromPluginTransaction(result);
  }
  const signerId: string = args.signerId!;

  const block: BlockResult = NEAR_READ.getBlock({
    blockQuery: {
      finality: "final",
      block_id: null,
      syncCheckpoint: null,
    },
  });
  const blockHash: ArrayBuffer = <ArrayBuffer>(
    bs58.decode(block.header.hash).buffer
  );

  // Case if publicKey is provided (Ledger)
  if (args.publicKey != null) {
    let inputNonce: BigInt;
    if (args.nonce) {
      inputNonce = args.nonce!;
    } else {
      inputNonce = BigInt.from(0);
    }
    return {
      signerId: signerId,
      publicKey: args.publicKey!,
      nonce: inputNonce,
      receiverId: args.receiverId,
      blockHash: blockHash,
      actions: args.actions,
    };
  }

  const accessKeyInfo: AccessKeyInfo | null = NEAR_READ.findAccessKey({
    accountId: signerId,
  });

  if (accessKeyInfo == null) {
    throw new Error(
      `Can not sign transactions for account ${signerId} on requested network, no matching key pair found in signer.`
    );
  }

  const accessKey: Interface_AccessKey = accessKeyInfo.accessKey;
  const publicKey = accessKeyInfo.publicKey;

  const nonce = accessKey.nonce.addInt(1);

  return {
    signerId: signerId,
    publicKey: publicKeyFromStr(publicKey),
    nonce: nonce,
    receiverId: args.receiverId,
    blockHash: blockHash,
    actions: args.actions,
  };
}

export function signTransaction(
  args: Args_signTransaction
): SignTransactionResult {
  const transaction = args.transaction;

  const message = Borsh_Module.serializeTransaction({
    transaction: toBorshTransaction(transaction),
  }).unwrap();

  const signature = Near_Module.signMessage({
    signerId: transaction.signerId,
    message: Uint8Array.wrap(message).buffer,
  }).unwrap();

  const signedTx = {
    transaction: transaction,
    signature: {
      keyType: signature.keyType,
      data: signature.data,
    },
  } as Interface_SignedTransaction;

  //const hash = Uint8Array.from(message); =? const hash = new Uint8Array(sha256.sha256.array(message));

  return { hash: message, signedTx } as SignTransactionResult;
}

export function sendTransaction(
  args: Args_sendTransaction
): Interface_FinalExecutionOutcome {
  const signedTxBytes = Borsh_Module.serializeSignedTransaction({
    signedTransaction: toBorshSignedTransaction(args.signedTx),
  }).unwrap();

  const encoder = new JSONEncoder();

  const bytesEncoded = bs64.encode(Uint8Array.wrap(signedTxBytes));

  encoder.pushArray(null);
  encoder.setString(null, bytesEncoded);
  encoder.popArray();

  const params = JSON.parse(encoder.serialize());

  const provider: JsonRpcProvider = new JsonRpcProvider(null);
  const result: JSON.Obj = <JSON.Obj>(
    provider.sendJsonRpc("broadcast_tx_commit", params)
  );

  return toFinalExecutionOutcome(<JSON.Obj>result);
}

export function sendTransactionAsync(args: Args_sendTransactionAsync): string {
  const signedTxBytes = Borsh_Module.serializeSignedTransaction({
    signedTransaction: toBorshSignedTransaction(args.signedTx),
  }).unwrap();

  const encoder = new JSONEncoder();

  const bytesEncoded = bs64.encode(Uint8Array.wrap(signedTxBytes));

  encoder.pushArray(null);
  encoder.setString(null, bytesEncoded);
  encoder.popArray();

  const params = JSON.parse(encoder.serialize());

  const provider: JsonRpcProvider = new JsonRpcProvider(null);

  const result = provider.sendJsonRpc("broadcast_tx_async", params);

  return result.toString();
}

export function signAndSendTransaction(
  args: Args_signAndSendTransaction
): Interface_FinalExecutionOutcome {
  const transaction: Interface_Transaction = createTransaction({
    receiverId: args.receiverId,
    actions: args.actions,
    signerId: args.signerId,
  });

  const signedTxResult = signTransaction({
    transaction: transaction,
  });

  return sendTransaction({ signedTx: signedTxResult.signedTx });
}

export function signAndSendTransactionAsync(
  args: Args_signAndSendTransactionAsync
): string {
  const transaction: Interface_Transaction = createTransaction({
    receiverId: args.receiverId,
    actions: <Interface_Action[]>args.actions,
    signerId: args.signerId,
  });

  const signedTxResult: SignTransactionResult = signTransaction({
    transaction: transaction,
  });
  return sendTransactionAsync({ signedTx: signedTxResult.signedTx });
}

//------ Action specific Transactions

export function addKey(args: Args_addKey): Interface_FinalExecutionOutcome {
  // https://github.com/near/near-api-js/blob/e29a41812ac79579cc12b051f8ef04d2f3606a75/src/account.ts#L445
  let methodNames: string[] = [];
  if (args.methodNames !== null) {
    methodNames = <string[]>args.methodNames;
  }
  let accessKey: Interface_AccessKey;
  if (args.contractId !== null && args.amount !== null) {
    accessKey = functionCallAccessKey(
      <string>args.contractId,
      methodNames,
      <BigInt>args.amount
    );
  } else {
    accessKey = fullAccessKey();
  }
  return signAndSendTransaction({
    receiverId: args.signerId,
    signerId: args.signerId,
    actions: [
      { publicKey: args.publicKey, accessKey: accessKey } as Interface_Action,
    ],
  });
}

export function createAccount(
  args: Args_createAccount
): Interface_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.newAccountId,
    signerId: args.signerId,
    actions: [
      action.createAccount(),
      action.transfer(args.amount),
      action.addKey(args.publicKey, fullAccessKey()),
    ],
  });
}

export function deleteAccount(
  args: Args_deleteAccount
): Interface_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.accountId,
    signerId: args.signerId,
    actions: [action.deleteAccount(args.beneficiaryId)],
  });
}

export function deployContract(
  args: Args_deployContract
): Interface_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.contractId,
    signerId: args.signerId,
    actions: [action.deployContract(args.data)],
  });
}

export function sendMoney(
  args: Args_sendMoney
): Interface_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.receiverId,
    signerId: args.signerId,
    actions: [action.transfer(args.amount)],
  });
}

export function functionCall(
  args: Args_functionCall
): Interface_FinalExecutionOutcome {
  const actions = [
    action.functionCall(args.methodName, args.args, args.gas, args.deposit),
  ];
  if (args.signerId !== null) {
    return signAndSendTransaction({
      receiverId: args.contractId,
      signerId: args.signerId!,
      actions: actions,
    });
  }
  const transaction = createTransaction({
    receiverId: args.contractId,
    actions: actions,
  } as Args_createTransaction);

  const signedTxResult: SignTransactionResult = signTransaction({
    transaction: transaction,
  });
  return sendTransaction({ signedTx: signedTxResult.signedTx });
}

export function deleteKey(
  args: Args_deleteKey
): Interface_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.signerId,
    signerId: args.signerId,
    actions: [action.deleteKey(args.publicKey)],
  });
}

export function createAndDeployContract(
  args: Args_createAndDeployContract
): Interface_FinalExecutionOutcome {
  return signAndSendTransaction({
    receiverId: args.contractId,
    signerId: args.signerId,
    actions: [
      action.createAccount(),
      action.transfer(args.amount),
      action.addKey(args.publicKey, fullAccessKey()),
      action.deployContract(args.data),
    ],
  });
}
