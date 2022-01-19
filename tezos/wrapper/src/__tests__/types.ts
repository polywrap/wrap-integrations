import { InMemorySigner } from "@web3api/tezos-plugin-js"

export interface GetPluginsParams {
    ipfs: string 
    ensAddress: string
    ethereum: string
    tezos?: TezosConnectionConfig
}

export interface TezosConnectionConfig {
    name: string
    signer?: InMemorySigner,
    provider: string
}