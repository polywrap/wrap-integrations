import { ensPlugin } from "@polywrap/ens-plugin-js"
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js"
import { ethereumPlugin  } from "@polywrap/ethereum-plugin-js"
import { PluginRegistration, Subscription, PolywrapClient } from "@polywrap/client-js"
import { tezosDomainsPlugin } from "@blockwatch-cc/tezos-domains-plugin-js"

import { Tezos_OperationStatus } from "../wrap"

export const getPlugins = (ipfs: string, ensAddress: string, ethereum: string): PluginRegistration<string>[] => {
    return [
        {
            uri: "wrap://ens/tezosDomainsPlugin.polywrap.eth",
            plugin: tezosDomainsPlugin({
                defaultNetwork: "ithacanet"
            })
        },
        {
            uri: "wrap://ens/ipfs.polywrap.eth",
            plugin: ipfsPlugin({ provider: ipfs }),
        },
        {
            uri: "wrap://ens/ens.polywrap.eth",
            plugin: ensPlugin({ query: { addresses: { testnet: ensAddress } } }),
        },
        {
            uri: "wrap://ens/ethereum.polywrap.eth",
            plugin: ethereumPlugin({
                networks: {
                    testnet: {
                        provider: ethereum
                    },
                },
                defaultNetwork: "testnet"
            }),
        },
    ]
}

export const getRandomString = () => {
    return (Math.floor(Math.random() * 1000000)).toString()
}

export const waitForConfirmation = async (client: PolywrapClient, hash: string, confirmations: number = 3) => {
    const getSubscription: Subscription<{
        getOperationStatus: Tezos_OperationStatus;
      }> = client.subscribe<{
        getOperationStatus: Tezos_OperationStatus;
      }>({
        uri: "wrap://ens/tezos.polywrap.eth",
        query: `
          query {
            getOperationStatus(
              hash: $hash
              network: ithacanet
            )
          }
        `,
        variables: {
          hash,
        },
        frequency: { ms: 4500 },
      });

      for await (let query of getSubscription) {
        if (query.errors) {
          continue
        }
        expect(query.errors).toBeUndefined();
        const operationStatus = query.data?.getOperationStatus;
        if (operationStatus !== undefined) {
          if (operationStatus.confirmations > confirmations) {
            break
          }
        }
      }   
}