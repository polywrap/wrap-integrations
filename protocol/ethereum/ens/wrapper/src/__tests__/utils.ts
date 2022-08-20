import { PluginRegistration } from "@polywrap/client-js";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ipfsResolverPlugin } from "@polywrap/ipfs-resolver-plugin-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";

export function getPlugins(
  ethereum: string,
  ipfs: string,
  ensAddress: string,
  signer?: string
): PluginRegistration[] {
  return [
    {
      uri: "ens/ethereum.polywrap.eth",
      plugin: ethereumPlugin({
        networks: {
          testnet: {
            provider: ethereum,
            signer,
          },
          mainnet: {
            provider:
              "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
          },
          goerli: {
            provider:
              "https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
          },
        },
        defaultNetwork: "testnet",
      }),
    },
    {
      uri: "ens/ipfs-resolver.polywrap.eth",
      plugin: ipfsResolverPlugin({}),
    },
    {
      uri: "ens/ipfs.polywrap.eth",
      plugin: ipfsPlugin({ provider: ipfs, fallbackProviders: ["ipfs.wrappers.io", "https://ipfs.io"] }),
    },
    {
      uri: "ens/ens-resolver.polywrap.eth",
      plugin: ensResolverPlugin({ addresses: { testnet: ensAddress } }),
    },
  ];
}
