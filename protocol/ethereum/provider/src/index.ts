import {
  Module,
  manifest,
  Args_request,
} from "./wrap";
import { ethers, Wallet } from "ethers";
import { PluginFactory } from "@polywrap/core-js";

export interface ProviderConfig {
  url: string
  wallet?: Wallet
}

export class EthereumProviderPlugin extends Module<ProviderConfig> {
  _provider: ethers.providers.JsonRpcProvider;
  _wallet: Wallet;

  constructor(config: ProviderConfig) {
    super(config)
    this._provider = new ethers.providers.JsonRpcProvider(config.url);
    if (config.wallet) {
      this._wallet = config.wallet;
    }
  }

  public async request(
    args: Args_request
  ): Promise<string> {
    if (args.method === "personal_signDigest") {
      if (this._wallet && args.params) {
        return ethers.utils.joinSignature(
          this._wallet._signingKey().signDigest(JSON.parse(args.params))
        );
      }
    } else if (args.method === "personal_signTypedData") {
      return "";
    } else if (args.method === "personal_address") {
      if (this._wallet) {
        return await this._wallet.getAddress();
      }
    } else if (args.method === "personal_chainId") {
      const network = await this._provider.getNetwork();
      return network.chainId.toString()
    } else if (args.method === "personal_withChainId") {
      return "";
    }
    const req = await this._provider.send(args.method, JSON.parse(args?.params ?? "[]"));
    return JSON.stringify(req);
  }
}

export const ethereumProviderPlugin: PluginFactory<ProviderConfig> = (
  pluginConfig: ProviderConfig
) => {
  return {
    factory: () => new EthereumProviderPlugin(pluginConfig),
    manifest,
  };
} 

export const plugin = ethereumProviderPlugin;

