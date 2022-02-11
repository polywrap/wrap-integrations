import path from "path"
import { ensPlugin } from "@web3api/ens-plugin-js"
import { ipfsPlugin } from "@web3api/ipfs-plugin-js"
import { tezosPlugin, InMemorySigner } from "@web3api/tezos-plugin-js"
import { ethereumPlugin  } from "@web3api/ethereum-plugin-js"
import { PluginRegistration } from "@web3api/client-js"
import { tezosDomainsPlugin } from "@web3api/tezos-domains-plugin-js"
import { buildAndDeployApi } from "@web3api/test-env-js"

export const getEnsUri = async (ipfs: string, ensAddress: string) => {
    const apiPath = path.join(__dirname, "/../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
    return `ens/testnet/${api.ensDomain}`;
}

export const getPlugins = (ipfs: string, ensAddress: string, ethereum: string, signer?: InMemorySigner): PluginRegistration<string>[] => {
    return [
        {
            uri: "w3://ens/tezos.web3api.eth",
            plugin: tezosPlugin({
                networks: {
                    mainnet: {
                        provider: "https://rpc.tzstats.com"
                    },  
                    hangzhounet: {
                        provider: "https://rpc.hangzhou.tzstats.com",
                        signer,
                    }
                },
                defaultNetwork: "hangzhounet"
              })
        },
        {
            uri: "w3://ens/tezosDomainsPlugin.web3api.eth",
            plugin: tezosDomainsPlugin({
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