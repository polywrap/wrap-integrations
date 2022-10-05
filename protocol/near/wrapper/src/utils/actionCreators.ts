import { Interface_AccessKey as AccessKey, Interface_Action as Action, Interface_PublicKey as PublicKey } from "../wrap";

import { BigInt, JSON } from "@polywrap/wasm-as";

export function createAccount(): Action {
  return {} as Action;
}

export function deployContract(code: ArrayBuffer):  Action {
  return { code } as Action;
}

export function functionCall(
  methodName: string,
  args: JSON.Value,
  gas: BigInt,
  deposit: BigInt
): Action {
  const argsBuffer = String.UTF8.encode(args.stringify());
  const argsArray: Uint8Array =
    argsBuffer.byteLength > 0 ? Uint8Array.wrap(argsBuffer) : new Uint8Array(0);
  return {
    methodName: methodName,
    args: argsArray.buffer,
    gas,
    deposit,
  } as Action;
}

export function transfer(deposit: BigInt): Action {
  return { deposit: deposit } as Action;
}

export function stake(stake: BigInt, publicKey: PublicKey): Action {
  return {
    stake,
    publicKey,
  } as Action;
}

export function addKey(publicKey: PublicKey, accessKey: AccessKey): Action {
  return { publicKey, accessKey } as Action;
}

export function deleteKey(publicKey: PublicKey): Action {
  return { publicKey } as Action;
}

export function deleteAccount(beneficiaryId: string): Action {
  return { beneficiaryId } as Action;
}
