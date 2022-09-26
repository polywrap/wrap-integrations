import {
  Module,
  manifest,
  Args_request,
} from "./wrap";
import { ethers } from "ethers";
import { PluginFactory } from "@polywrap/core-js";

export interface ProviderConfig {
	url: string
}

export class EthereumProviderPlugin extends Module<ProviderConfig> {
  constructor(config: ProviderConfig) {
    super(config);
  }

  public async request(
    args: Args_request
  ): Promise<string> {
    const p = new ethers.providers.JsonRpcProvider(this.config.url);
    const req = await p.send(args.method, args?.params ?? []);
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

