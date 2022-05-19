// TIP: All user-defined code lives in the module folders (./query, ./mutation)

import * as Internal from "./w3";
import { TezosConfig } from "./common/TezosConfig";

import { PluginFactory } from "@web3api/core-js";

export { manifest, schema } from "./w3";

export interface TezosPluginConfigs
  extends TezosConfig,
    Record<string, unknown> {}

export class TezosPlugin extends Internal.TezosPlugin {
  constructor(config: TezosPluginConfigs) {
    super({
      query: config,
      mutation: config,
    });
  }
}

export const tezosPlugin: PluginFactory<TezosPluginConfigs> = (
  opts: TezosPluginConfigs
) =>
  Internal.tezosPlugin({
    query: opts,
    mutation: opts,
  });

export const plugin = tezosPlugin;
