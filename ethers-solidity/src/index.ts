import { query } from "./resolvers";
import { manifest, Query } from "./w3";

import * as ethers from "@ethersproject/solidity";
import {
  Plugin,
  PluginFactory,
  PluginPackageManifest,
  PluginModules,
} from "@web3api/core-js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EthersSolidityConfig {}

export class EthersSolidity extends Plugin {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  constructor(private _config: EthersSolidityConfig) {
    super();
  }

  public static manifest(): PluginPackageManifest {
    return manifest;
  }

  public getModules(): PluginModules {
    return {
      query: query(this),
    };
  }

  public pack(input: Query.Input_pack): string {
    return ethers.pack(input.types, input.values);
  }

  public keccak256(input: Query.Input_keccak256): string {
    return ethers.keccak256(input.types, input.values);
  }

  public sha256(input: Query.Input_sha256): string {
    return ethers.sha256(input.types, input.values);
  }
}

export const ethersSolidity: PluginFactory<EthersSolidityConfig> = (
  opts: EthersSolidityConfig
) => {
  return {
    factory: () => new EthersSolidity(opts),
    manifest: EthersSolidity.manifest(),
  };
};

export const plugin = ethersSolidity;
