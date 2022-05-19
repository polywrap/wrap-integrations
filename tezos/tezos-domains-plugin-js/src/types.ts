import { TezosToolkit } from "@taquito/taquito";
import { SupportedNetworkType } from "@tezos-domains/core";

export interface TezosClient {
    tezos: TezosToolkit;
    network: SupportedNetworkType;
}