import {
  Interface_AccessKey as AccessKey,
  Interface_PublicKey as PublicKey,
  Interface_AccessKeyPermission as AccessKeyPermission,
  Interface_PublicKey,
} from "../wrap";
import * as bs58 from "as-base58";
import { BigInt } from "@polywrap/wasm-as";

export function keyTypeToStr(keyType: u8): string {
  switch (keyType) {
    case 0:
      return "ed25519";
    default:
      throw new Error(`Unknown key type ${keyType}`);
  }
}

export function keyTypeFromStr(keyType: string): u8 {
  if (keyType == "ed25519") return 0;
  throw new Error(`Unknown key type ${keyType}`);
}

export const publicKeyToStr = (key: Interface_PublicKey): string => {
  const keyTypeStr = keyTypeToStr(key.keyType);
  // @ts-ignore
  const encodedData = bs58.encode(Uint8Array.wrap(key.data));
  return `${keyTypeStr}:${encodedData}`;
};

export const publicKeyFromStr = (encodedKey: string): Interface_PublicKey => {
  const parts = encodedKey.split(":");
  if (parts.length == 1) {
    return {
      keyType: 0,
      data: bs58.decode(parts[0]).buffer,
    };
  } else if (parts.length == 2) {
    return {
      keyType: keyTypeFromStr(parts[0]),
      data: bs58.decode(parts[1]).buffer,
    };
  } else {
    throw new Error(
      "Invalid encoded key format, must be <curve>:<encoded key>"
    );
  }
};

export function fullAccessKey(): AccessKey {
  return {
    nonce: BigInt.fromString("0"),
    permission: {
      isFullAccess: true,
      allowance: null,
      methodNames: null,
      receiverId: null,
    } as AccessKeyPermission,
  };
}

export function functionCallAccessKey(
  receiverId: string,
  methodNames: string[],
  allowance: BigInt
): AccessKey {
  return {
    nonce: BigInt.fromString("0"),
    permission: { receiverId, methodNames, allowance } as AccessKeyPermission,
  };
}
