import { Near_AccessKey, Near_Action, Near_PublicKey } from "../query/w3";

import { BigInt, JSON } from "@web3api/wasm-as";
import * as bs58 from "as-base58";

export function createAccount(): Near_Action {
  return {} as Near_Action;
}

export function deployContract(code: ArrayBuffer): Near_Action {
  return { code } as Near_Action;
}

export function functionCall(methodName: string, args: JSON.Value, gas: BigInt, deposit: BigInt): Near_Action {
  return { methodName: methodName, args: bs58.decode(args.stringify()).buffer, gas, deposit } as Near_Action;
}

export function transfer(deposit: BigInt): Near_Action {
  return { deposit: deposit } as Near_Action;
}

export function stake(stake: BigInt, publicKey: Near_PublicKey): Near_Action {
  return { stake, publicKey } as Near_Action;
}

export function addKey(publicKey: Near_PublicKey, accessKey: Near_AccessKey): Near_Action {
  return { publicKey, accessKey } as Near_Action;
}

export function deleteKey(publicKey: Near_PublicKey): Near_Action {
  return { publicKey } as Near_Action;
}

export function deleteAccount(beneficiaryId: string): Near_Action {
  return { beneficiaryId } as Near_Action;
}
