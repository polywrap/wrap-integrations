import { InMemorySigner } from "@taquito/signer";
import { TezosToolkit } from "@taquito/taquito";
import { SupportedNetworkType } from "@tezos-domains/core";

export interface TezosClient {
    tezos: TezosToolkit;
    network: SupportedNetworkType;
    signer?: InMemorySigner;
}

export interface FundraiserAccount {
    mnemonic: string[]
    secret: string
    amount: string
    pkh: string
    password: string
    email: string
}

export interface SecretAccount {
    address: string
    secretKey: string
}

export interface DomainInfo {
    name: string
    address: string
    fundraiser: FundraiserAccount
}