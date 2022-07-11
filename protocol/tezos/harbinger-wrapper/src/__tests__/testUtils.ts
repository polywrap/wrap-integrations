import { ensPlugin } from "@polywrap/ens-plugin-js"
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js"
import { ethereumPlugin  } from "@polywrap/ethereum-plugin-js"
import { PluginRegistration } from "@polywrap/client-js"

export const getPlugins = (ipfs: string, ensAddress: string, ethereum: string): PluginRegistration<string>[] => {
    return [
        {
            uri: "w3://ens/ipfs.polywrap.eth",
            plugin: ipfsPlugin({ provider: ipfs }),
        },
        {
            uri: "w3://ens/ens.polywrap.eth",
            plugin: ensPlugin({ query: { addresses: { testnet: ensAddress } } }),
        },
        {
            uri: "w3://ens/ethereum.polywrap.eth",
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