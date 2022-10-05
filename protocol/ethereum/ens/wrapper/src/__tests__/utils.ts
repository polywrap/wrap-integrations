import { PluginRegistration } from "@polywrap/client-js";
import {Connection, Connections, ethereumPlugin} from "@polywrap/ethereum-plugin-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ipfsResolverPlugin } from "@polywrap/ipfs-resolver-plugin-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";

export function getPlugins(
  ethereum: string,
  ipfs: string,
  ensAddress: string,
  signer?: string
): PluginRegistration[] {
  const connections = new Connections({
    networks: {
      testnet: new Connection({
        provider: ethereum,
        signer,
      }),
    },
    defaultNetwork: "testnet"
  })

  return [
    {
      uri: "ens/ethereum.polywrap.eth",
      plugin: ethereumPlugin({ connections }),
    },
    {
      uri: "ens/ipfs-resolver.polywrap.eth",
      plugin: ipfsResolverPlugin({}),
    },
    {
      uri: "ens/ipfs.polywrap.eth",
      plugin: ipfsPlugin({ provider: ipfs }),
    },
    {
      uri: "ens/ens-resolver.polywrap.eth",
      plugin: ensResolverPlugin({ addresses: { testnet: ensAddress } }),
    },
  ];
}
