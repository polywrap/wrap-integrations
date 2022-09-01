import {
  Args_getAccounts,
  Args_signAndSubmitExtrinsic,
  Module,
  manifest,
  SignerResult,
  Account
} from "./wrap";

import { Client, PluginFactory } from "@polywrap/core-js";
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

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

  async signAndSubmitExtrinsic(
    args: Args_signAndSubmitExtrinsic,
    client: Client
  ): Promise<SignerResult> {
    await this._enableProvider();
    return {
      id: 0,
      signature: "foo"
    }
  }

  private async _enableProvider(): Promise<void> {
    if (this._isProviderEnabled) {
      return;
    }
    await web3Enable("substrate-signer-provider-plugin");
    this._isProviderEnabled = true;
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
