import {
  Module,
  NetworkString,
  Args_getAcquisitionInfo,
  AcquisitionInfo,
  Args_bytesToHex,
  Args_char2Bytes,
  Network,
  manifest
} from "./wrap";
import { PluginFactory } from "@polywrap/core-js";
import { sha512 } from "sha.js"
import { Tzip16Module } from "@taquito/tzip16"
import { char2Bytes as taquitoChar2Bytes } from "@taquito/utils"
import { TezosToolkit  } from "@taquito/taquito"
import { SupportedNetworkType } from "@tezos-domains/core";
import { TaquitoTezosDomainsClient } from "@tezos-domains/taquito-client"

export type TezosDomainConfig = {
  defaultNetwork: NetworkString
}

export interface TezosDomainPluginConfig extends TezosDomainConfig, Record<string, unknown> { }

export interface TezosClient {
  tezos: TezosToolkit;
  network: SupportedNetworkType;
}

export class TezosDomainPlugin extends Module<TezosDomainPluginConfig> {
  private static defaultNetwork: NetworkString = "mainnet";
  private _connections: Record<NetworkString, string> = {
    mainnet: 'https://rpc.tzstats.com',
    ghostnet: 'https://rpc.ghost.tzstats.com',
  }

  constructor(config: TezosDomainPluginConfig) {
    super(config);

    if (config.defaultNetwork) {
      TezosDomainPlugin.defaultNetwork = config.defaultNetwork
    }
  }

  public async getAcquisitionInfo(
    input: Args_getAcquisitionInfo
  ): Promise<AcquisitionInfo> {
    let duration = 365;
    const domainsClient = await this.getTezosDomainsClient(input.network)
    const info = await domainsClient.manager.getAcquisitionInfo(input.domain)
    const acquisitionInfo = <AcquisitionInfo>{
      state: info.acquisitionState
    }
    if (input.duration) {
      duration = input.duration
    }
    if (info.acquisitionState === 'CanBeBought') {
      acquisitionInfo.cost = info.calculatePrice(duration)
      acquisitionInfo.duration = duration
    }
    return acquisitionInfo
  }

  public bytesToHex(
    input: Args_bytesToHex
  ): string {
    return new sha512().update(this.textToArray(input.bytes)).digest('hex');
  }

  public char2Bytes(
    input: Args_char2Bytes
  ): string {
    return taquitoChar2Bytes(input.text);
  }

  // Utils
  private async getTezosDomainsClient(network: Network | undefined | null): Promise<TaquitoTezosDomainsClient> {
    let tezosNetworkClient = TezosDomainPlugin.defaultNetwork;
    if (network) {
      tezosNetworkClient = <NetworkString>network;
    }
    const { tezos, network: selectedNetwork} = await this.getTezosClient(tezosNetworkClient)
    tezos.addExtension(new Tzip16Module())
    return new TaquitoTezosDomainsClient({ tezos, network: selectedNetwork })
  }

  private async getTezosClient(network: NetworkString): Promise<TezosClient> { 
    return {
      tezos: new TezosToolkit(this._connections[network]),
      network: network,
    }
  }

  private textToArray(text: string): Uint8Array {
    return new Uint8Array(text.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
  }
}

export const tezosDomainsPlugin: PluginFactory<TezosDomainConfig> = (
  pluginConfig: TezosDomainConfig
) => {
  return {
    factory: () => new TezosDomainPlugin(pluginConfig),
    manifest,
  };
} 

export const plugin = tezosDomainsPlugin;