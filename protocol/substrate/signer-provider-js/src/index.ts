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
import { SignerProvider } from "./SignerProvider";
import { InjectedSignerProvider } from "./providers/InjectedSignerProvider";

import { SignerPayloadJSON as StringifiedSignerPayloadJSON } from '@polkadot/types/types';
import { UInt } from '@polkadot/types-codec';
import { Client, PluginFactory } from "@polywrap/core-js";

export * from "./SignerProvider";
export * from "./providers";

export interface SubstrateSignerProviderPluginConfig {
  provider?: SignerProvider;
}

export class SubstrateSignerProviderPlugin extends Module<SubstrateSignerProviderPluginConfig> {
  private _provider: SignerProvider;

  constructor(config: SubstrateSignerProviderPluginConfig) {
    super(config);

    // If no provider is provided, use the injected signer/provider (polkadot.js extension)
    this._provider = config.provider || new InjectedSignerProvider();
  }

  /**
   * Return the accounts managed by the connected polkadot-js plugin.
   * args is an empty arg just included to meet the function signature requirements
   */
  async getAccounts(
    args: Args_getAccounts,
    client: Client
  ): Promise<Account[]> {
    return await this._provider.getAccounts();
  }

  /**
   * Sign a substrate transaction payload.
   * This should always be used in preference to `signRaw` for transaction as it 
   * displays a more informative dialog to the user
   */
  async signPayload(
    args: Args_signPayload,
    client: Client
  ): Promise<SignerResult> {
    const address = args.payload.address;
    const signer = await this._provider.getSigner(address);
    if (!signer || !signer?.signPayload) {
      throw new Error("Provider for account: " + address + " does not have payload signing capabilities");
    }
    return await signer.signPayload(
      this._stringifyPayloadFields(args.payload)
    );
  }

  /**
   * Sign arbitrary non-transaction data.
   * User will be presented with the hex encoded string of the payload.
   * This is opaque so the user may not know what they are signing.
   */
  async signRaw(
    args: Args_signRaw,
    client: Client
  ): Promise<SignerResult> {
    const address = args.payload.address;
    const signer = await this._provider.getSigner(address);
    if (!signer || !signer?.signRaw) {
      throw new Error("Provider for account: " + address + " does not have raw signing capabilities");
    }

    return await signer.signRaw({ ...args.payload, type: 'bytes' });
  }

  /**
   * The extension is expecting all numeric to be hex encoded strings
   * This performs that conversion from the numeric types provided by the GraphQL generated type of the payload
   */
  private _stringifyPayloadFields(payload: SignerPayloadJSON): StringifiedSignerPayloadJSON {
    const registry = this._provider.registry;
    return {
      ...payload,
      nonce: new UInt(registry, payload.nonce, 32).toHex(),
      specVersion: new UInt(registry, payload.specVersion, 32).toHex(),
      tip: new UInt(registry, payload.tip, 128).toHex(),
      transactionVersion: new UInt(registry, payload.transactionVersion, 32).toHex(),
      blockNumber: new UInt(registry, payload.blockNumber, 32).toHex(),
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
