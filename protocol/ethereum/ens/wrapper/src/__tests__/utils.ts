import { Connection, Connections, ethereumProviderPlugin } from "ethereum-provider-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ipfsResolverPlugin } from "@polywrap/ipfs-resolver-plugin-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";
import { ClientConfigBuilder } from "@polywrap/client-js";
import { providers as testEnvProviders } from "@polywrap/test-env-js";

const wrappers = {
  ethereum: "wrap://ipfs/QmfXVjDkyRWzBvpRMKpTHE7Cu1gSvUfQJQwfKPUCubspnW",
  ethereumProviderInterface:
    "wrap://ipfs/QmRNDF5U43dmYVgNBfCswNcfjvrKzfkU1XMmTAGYHezNmy",
};

export function getConfig(
  ethereum: string,
  ensAddress: string,
  ipfsProvider: string,
  uts46Uri: string,
  sha3Uri: string,
  signer?: string,
): any {
  const connections = new Connections({
    networks: {
      testnet: new Connection({
        provider: ethereum,
        signer,
      }),
    },
    defaultNetwork: "testnet"
  })

  return new ClientConfigBuilder()
    .addDefaults()
    .removePackage("wrap://ens/ethereum.polywrap.eth")
    .addPackages(
      [
        {
          uri: "wrap://plugin/ethereum-provider",
          package: ethereumProviderPlugin({ connections }),
        },
        {
          uri: "ens/ipfs-resolver.polywrap.eth",
          package: ipfsResolverPlugin({}),
        },
        {
          uri: "ens/ipfs.polywrap.eth",
          package: ipfsPlugin({}),
        },
        {
          uri: "ens/ens-resolver.polywrap.eth",
          package: ensResolverPlugin({ addresses: { testnet: ensAddress } }),
        },
      ]
    )
    .addRedirects(
    [
      {
        from: "wrap://ens/uts46.polywrap.eth",
        to: uts46Uri
      },
      {
        from: "wrap://ens/sha3.polywrap.eth",
        to: sha3Uri
      },
      {
        from: "wrap://ens/ethereum.polywrap.eth",
        to: wrappers.ethereum,
      },
      {
        from: "wrap://ens/iprovider.polywrap.eth",
        to: wrappers.ethereumProviderInterface,
      },
    ]
  ).addEnvs(
    [{
      uri: "ens/ipfs.polywrap.eth",
      env: {
        provider: testEnvProviders.ipfs,
        fallbackProviders: ["https://ipfs.wrappers.io"]
      },
    }]
  ).addInterfaceImplementations(
    "wrap://ens/iprovider.polywrap.eth",
      ["wrap://plugin/ethereum-provider"]
  ).buildCoreConfig()
}
