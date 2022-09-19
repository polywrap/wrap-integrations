import {
  Args_getAccounts,
  Args_signPayload,
  Args_signRaw, 
  Module,
  manifest,
  SignerResult,
  Account
} from "./wrap";

import { Client, PluginFactory } from "@polywrap/core-js";
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import type { Signer } from '@polkadot/api/types';

export interface SubstrateSignerProviderPluginConfig {}

export class SubstrateSignerProviderPlugin extends Module<SubstrateSignerProviderPluginConfig> {
  private _isProviderEnabled: boolean = false;

  constructor(config: SubstrateSignerProviderPluginConfig) {
    super(config);
  }

  async getAccounts(
    args: Args_getAccounts,
    client: Client
  ): Promise<Account[]> {
    await this._enableProvider();
    return await web3Accounts();
  }

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
    return signer.signPayload(payload);
  }

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
