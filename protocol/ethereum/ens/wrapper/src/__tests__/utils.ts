import { PluginRegistration } from "@polywrap/client-js";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ensPlugin } from "@polywrap/ens-plugin-js";

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
        },
        defaultNetwork: "testnet",
      }),
    },
    {
      uri: "ens/ipfs.polywrap.eth",
      plugin: ipfsPlugin({ provider: ipfs }),
    },
    {
      uri: "ens/ens.polywrap.eth",
      plugin: ensPlugin({ addresses: { testnet: ensAddress } }),
    },
  ];
}
