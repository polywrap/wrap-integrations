import {
  Module,
  manifest,
  Args_request,
  Args_signDigest,
  Args_address,
  Args_chainId,
} from "./wrap";
import { ethers, Wallet } from "ethers";
import { Client, PluginFactory } from "@polywrap/core-js";

export interface ProviderConfig {
  url: string
  wallet?: Wallet
}

export class EthereumProviderPlugin extends Module<ProviderConfig> {
  _provider: ethers.providers.JsonRpcProvider;
  _wallet?: Wallet;

  constructor(config: ProviderConfig) {
    super(config)
    this._provider = new ethers.providers.JsonRpcProvider(config.url);
    if (config.wallet) {
      this._wallet = config.wallet;
    }
  }

  public async request(
    args: Args_request,
    client: Client
  ): Promise<string> {
    const req = await this._provider.send(args.method, JSON.parse(args?.params ?? "[]"));
    return JSON.stringify(req);
  }

  public async signDigest(
    args: Args_signDigest,
    client: Client
  ): Promise<string> {
    if (!this._wallet) {
      throw Error("Cannot sign digest without a wallet");
    }
    const signature = this._wallet._signingKey().signDigest(args.digest);
    return ethers.utils.joinSignature(signature);
  }

  public async address(
    args: Args_address,
    client: Client
  ): Promise<string> {
    if (!this._wallet) {
      throw Error("Cannot obtain signer address without a wallet");
    }
    return await this._wallet.getAddress();
  }

  public async chainId(
    args: Args_chainId,
    client: Client
  ): Promise<string> {
    const network = await this._provider.getNetwork();
    return network.chainId.toString();
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

