import { ensPlugin } from "@web3api/ens-plugin-js"
import { ipfsPlugin } from "@web3api/ipfs-plugin-js"
import { tezosPlugin, InMemorySigner, ConnectionConfigs } from "@blockwatch-cc/tezos-plugin-js"
import { ethereumPlugin  } from "@web3api/ethereum-plugin-js"
import { PluginRegistration } from "@web3api/client-js"

export interface Connection {
    provider: string,
    network: string,
    signer?: InMemorySigner,
}

export const getPlugins = (ipfs: string, ensAddress: string, ethereum: string, tezosConnection?: Connection): PluginRegistration<string>[] => {
    const connections: ConnectionConfigs = {
        mainnet: {
            provider: "https://rpc.tzstats.com"
        },
        hangzhounet: {
            provider: "https://rpc.hangzhou.tzstats.com",
        }
    };
    if (tezosConnection) {
        connections[tezosConnection.network] = {
            ...connections[tezosConnection.network],
            provider: tezosConnection.provider,
            signer: tezosConnection.signer
        }
    }
    return [
        {
            uri: "w3://ens/tezos.web3api.eth",
            plugin: tezosPlugin({
                networks: connections,
                defaultNetwork: "hangzhounet"
              })
        },
        {
            uri: "w3://ens/ipfs.web3api.eth",
            plugin: ipfsPlugin({ provider: ipfs }),
        },
        {
            uri: "w3://ens/ens.web3api.eth",
            plugin: ensPlugin({ addresses: { testnet: ensAddress } }),
        },
        {
            uri: "w3://ens/ethereum.web3api.eth",
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