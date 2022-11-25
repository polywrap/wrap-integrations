import {
  Args_getAccounts,
  Args_signPayload,
  Args_signRaw, 
  Module,
  manifest,
  SignerResult,
  Account,
  SignerPayloadJSON
} from "./wrap";
import type { SignerPayloadJSON as StringifiedSignerPayloadJSON } from '@polkadot/types/types';

import { Client, PluginFactory } from "@polywrap/core-js";
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import type { Signer } from '@polkadot/api/types';
import { TypeRegistry } from '@polkadot/types';
import { UInt } from '@polkadot/types-codec';

export interface SubstrateSignerProviderPluginConfig {}

export class SubstrateSignerProviderPlugin extends Module<SubstrateSignerProviderPluginConfig> {
  private _isProviderEnabled: boolean = false;
  private _registry: TypeRegistry;

  constructor(config: SubstrateSignerProviderPluginConfig) {
    super(config);
    this._registry = new TypeRegistry();
  }

  /**
   * Return the accounts managed by the connected polkadot-js plugin.
   * args is an empty arg just included to meet the function signature requirements
   */
  async getAccounts(
    args: Args_getAccounts,
    client: Client
  ): Promise<Account[]> {
    await this._enableProvider();
    return await web3Accounts();
  }

  /**
   * Sign a substrate transaction payload.
   * This should always be used in preference to `signRaw` for transaction as it 
   * displays a more informative dialog to the user
   */
  async signPayload(
    { payload }: Args_signPayload,
    client: Client
  ): Promise<SignerResult> {
    await this._enableProvider();
    const { address } = payload;
    const signer = await this._getSigner(address);
    if (!signer || !signer?.signPayload) {
      throw new Error("Provider for account: " + address + " does not have payload signing capabilities");
    }
    return signer.signPayload(
      this._stringifyPayloadFields(payload)
    );
  }

  /**
   * Sign arbitrary non-transaction data.
   * User will be presented with the hex encoded string of the payload.
   * This is opaque so the user may not know what they are signing.
   */
  async signRaw(
    { payload }: Args_signRaw,
    client: Client
  ): Promise<SignerResult> {
    await this._enableProvider();
    const { address } = payload;
    const signer = await this._getSigner(address);
    if (!signer || !signer?.signRaw) {
      throw new Error("Provider for account: " + address + " does not have raw signing capabilities");
    }
    return signer.signRaw({ ...payload, type: 'bytes' });
  }

  private async _enableProvider(): Promise<void> {
    if (this._isProviderEnabled) {
      return;
    }
    await web3Enable("substrate-signer-provider-plugin");
    this._isProviderEnabled = true;
  }


  /**
   * Searches the injected web3 providers for any accounts that match the 
   * given address and then return associated Signer.
   *
   * Requires this._enableProvider() be called first
   */
  private async _getSigner(address: String): Promise<Signer> {
    const accounts = await await web3Accounts();
    const signingAccount = accounts.find(acc => acc.address == address);

    if (!signingAccount) {
      throw new Error("Provider does not contain account: " + address);
    }

    const injector = await web3FromSource(signingAccount.meta.source);
    return injector?.signer
  }

  /**
   * The extension is expecting all numeric to be hex encoded strings
   * This performs that conversion from the numeric types provided by the GraphQL generated type of the payload
   */
  private _stringifyPayloadFields(payload: SignerPayloadJSON): StringifiedSignerPayloadJSON {
    return {
      ...payload,
      nonce: new UInt(this._registry, payload.nonce, 32).toHex(),
      specVersion: new UInt(this._registry, payload.specVersion, 32).toHex(),
      tip: new UInt(this._registry, payload.tip, 128).toHex(),
      transactionVersion: new UInt(this._registry, payload.transactionVersion, 32).toHex(),
      blockNumber: new UInt(this._registry, payload.blockNumber, 32).toHex(),
    };
  }

}

export const substrateSignerProviderPlugin: PluginFactory<SubstrateSignerProviderPluginConfig> = (
  config: SubstrateSignerProviderPluginConfig
) => {
  return {
    factory: () => new SubstrateSignerProviderPlugin(config),
    manifest: manifest
  };
};

export const plugin = substrateSignerProviderPlugin;
