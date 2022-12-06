import { SignerProvider } from "../SignerProvider";
import { Account } from "../wrap";

import { Keyring } from "@polkadot/ui-keyring";
import { Signer } from '@polkadot/api/types';
import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from "@polkadot/types/types";
import { objectSpread, hexToU8a, u8aToHex } from '@polkadot/util';

export type KeyringPartial = Pick<Keyring, "getAccounts" | "getPair">

export class KeyringSignerProvider implements SignerProvider {
  private _registry: TypeRegistry;
  private _signers: Map<string, Signer>;

  constructor(
    public keyring: KeyringPartial,
    registry?: TypeRegistry
  ) {
    this._registry = registry || new TypeRegistry();
    this._signers = new Map();
  }

  public get registry(): TypeRegistry {
    return this._registry;
  }

  public async getAccounts(): Promise<Account[]> {
    return this.keyring.getAccounts();
  }

  public async getSigner(address: string): Promise<Signer> {
    let signer = this._signers.get(address);

    if (signer) {
      return signer;
    }

    const pair = this.keyring.getPair(address);
    let id = 0;

    // Implementation based on @polkadot/api/src/test/SingleAccountSigner.ts
    signer = {
      signPayload: async (payload: SignerPayloadJSON): Promise<SignerResult> => {
        if (payload.address !== pair.address) {
          throw new Error("Payload address does not match the keyringPair address.");
        }

        return new Promise((resolve): void => {
          const signed = this.registry.createType(
            'ExtrinsicPayload',
            payload,
            { version: payload.version }
          ).sign(pair);
  
          resolve(objectSpread({ id: ++id }, signed));
        });
      },
      signRaw: async (payload: SignerPayloadRaw): Promise<SignerResult> => {
        if (payload.address !== pair.address) {
          throw new Error("Payload address does not match the keyringPair address.");
        }

        return new Promise((resolve): void => {
          const signature = u8aToHex(
            pair.sign(hexToU8a(payload.data)),
          );
  
          resolve({
            id: ++id,
            signature
          });
        });
      }
    };

    this._signers.set(address, signer);
    return signer;
  }
} 
