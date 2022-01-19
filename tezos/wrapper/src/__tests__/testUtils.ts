import path from "path"
import { ensPlugin } from "@web3api/ens-plugin-js"
import { ipfsPlugin } from "@web3api/ipfs-plugin-js"
import { tezosPlugin } from "@web3api/tezos-plugin-js"
import { ethereumPlugin  } from "@web3api/ethereum-plugin-js"
import { PluginRegistration } from "@web3api/client-js"
import { buildAndDeployApi } from "@web3api/test-env-js"

import { GetPluginsParams, TezosConnectionConfig } from "./types"

const DefaultTezosNetworks = {
    mainnet: {
        provider: "https://rpc.tzstats.com"
    },
    granadanet: {
        provider: "https://rpc.granada.tzstats.com",
    },
}

export const getPlugins = (params: GetPluginsParams): PluginRegistration<string>[] => {
    const { ipfs, ensAddress, ethereum, tezos } = params
    let defaultNetwork = "granadanet"
    let additionalNetwork: Record<string, TezosConnectionConfig> = {}
    if (tezos) {
        additionalNetwork[tezos.name] = tezos
        defaultNetwork = tezos.name
    }
    return [
        {
            uri: "w3://ens/tezos.web3api.eth",
            plugin: tezosPlugin({
                networks: {
                    ...DefaultTezosNetworks,
                    ...additionalNetwork
                },
                defaultNetwork
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

export const getEnsUri = async (ipfs: string, ensAddress: string): Promise<string> => {
    const apiPath = path.join(__dirname, "/../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
    return `ens/testnet/${api.ensDomain}`;
}