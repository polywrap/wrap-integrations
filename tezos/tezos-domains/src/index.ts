/* eslint-disable import/no-extraneous-dependencies */
import { query, mutation } from "./resolvers";
import { manifest, Query, Mutation } from "./w3";
import * as Types from "./w3"
import * as Mapping from "./mapping"
import { TezosClient } from "./types";

import {
  Client,
  Plugin,
  PluginPackageManifest,
  PluginFactory,
} from "@web3api/core-js";
import { TaquitoTezosDomainsClient } from "@tezos-domains/taquito-client"
import { InMemorySigner } from "@taquito/signer"
import { TezosToolkit  } from "@taquito/taquito"
import { Tzip16Module } from "@taquito/tzip16"
import { validateAddress } from "@taquito/utils"
import { generateNonce, RecordMetadata, SupportedNetworkType } from '@tezos-domains/core';

export type TezosSigner = InMemorySigner;
export type TezosProvider = string;  

export type ConnectionConfig = {
    provider: TezosProvider;
    signer?: TezosSigner;
}

export interface Connections {
  [network: string]: ConnectionConfig;
}

export interface TezosDomainConfig {
  connections?: Connections;
  defaultNetwork?: SupportedNetworkType
}

export class TezosDomainPlugin extends Plugin {
  public static defaultNetwork: SupportedNetworkType = "mainnet"
  public static defaultConnection: ConnectionConfig = {
    provider: "https://rpc.tzstats.com"
  }
  private _client: TezosClient;
  private _connections: Connections = {};

  constructor(private _config: TezosDomainConfig) {
    super();
    if(this._config.connections) {
      this.setConnections(this._config.connections);
    }
    if(this._config.defaultNetwork && this._config.connections?.[this._config.defaultNetwork]) {
      TezosDomainPlugin.defaultNetwork = this._config.defaultNetwork;
      TezosDomainPlugin.defaultConnection = this._config.connections?.[this._config.defaultNetwork];
    }
  }

  public static manifest(): PluginPackageManifest {
    return manifest;
  }

  public getModules(
    client: Client
  ): {
    query: Query.Module;
    mutation: Mutation.Module;
  } {
    return {
      query: query(this, client),
      mutation: mutation(this, client)
    };
  }

  public setConnections(connections: Connections): void {
    for (let network of Object.keys(connections)) {
      const lowerCasedNetwork = network.toLowerCase()
      this._connections[lowerCasedNetwork] = connections[network]
    }
  }

  // Query
  public async resolveDomain(input: Types.Query.Input_resolveDomain): Promise<string> {
    const domainsClient = await this.getTezosDomainsClient(input.connection);
    if(!domainsClient.validator.validateDomainName(input.domain)) {
      throw new Error(`Address is not valid: ${input.domain}`);
    }
    const address = await domainsClient.resolver.resolveNameToAddress(input.domain);
    if (!address) {
      throw new Error(`Address: ${address} could not be resolved to a valid tezos address`);
    }
    return address;
  }

  public async resolveAddressToDomain(
    input: Types.Query.Input_resolveAddressToDomain
  ): Promise<string> {
    const domainsClient = await this.getTezosDomainsClient(input.connection)
    const address = await domainsClient.resolver.resolveAddressToName(input.address)
    if(!address) {
      throw new Error(`
      reverse record with the specified address does not exist or 
      reverse record with the specified address does not specify a name or
      record with the name specified by the reverse record does not exist or
      record with the name specified by the reverse record is expired or`)
    }
    return address
  }

  public async resolveDomainRecords(
    input: Types.Query.Input_resolveDomainRecords
  ): Promise<Types.DomainRecords | null> {
    const domainsClient = await this.getTezosDomainsClient(input.connection)
    const records = await domainsClient.resolver.resolveDomainRecord(input.domain)
    if(records) {
      // @ts-ignore
      return Mapping.toDomainRecords(records)
    }
    return records
  }

  public async getAcquisitionInfo(
    input: Types.Query.Input_getAcquisitionInfo
  ): Promise<Types.AcquisitionInfo> {
    let cost: number | undefined;
    const domainsClient = await this.getTezosDomainsClient(input.connection)
    const info = await domainsClient.manager.getAcquisitionInfo(input.domain)
    if (input.duration) {
      cost = info.calculatePrice(input.duration)
    }
    return {
      state:  info.acquisitionState,
      cost
    }
  }

  public async getSupportedTlds(
    input: Types.Query.Input_getSupportedTlds
  ): Promise<string[]> {
    const domainsClient = await this.getTezosDomainsClient(input.connection)
    return domainsClient.validator.supportedTLDs
  }

  // Mutations
  public async setSignerWithSecretKeyParams(
    input: Types.Mutation.Input_setSignerWithSecretKeyParams
  ): Promise<Types.Result> {
    try {
      await this.getTezosDomainsClient(input.connection)
      const { key, passphrase } = input.params
      const signer = await InMemorySigner.fromSecretKey(key, passphrase as string | undefined )
      this.setSigner(signer)
      return {
        status: true
      }
    } catch (error) {
      return {
        status: false,
        error
      }
    }
  }

  public async setSignerWithFundraiserParams(
    input: Types.Mutation.Input_setSignerWithFundraiserParams
  ): Promise<Types.Result> {
    try {
      await this.getTezosDomainsClient(input.connection)
      const { email, password, mnemonic } = input.params
      const signer = await InMemorySigner.fromFundraiser(email, password, mnemonic)
      this.setSigner(signer)
      return {
        status: true
      }
    } catch (error) {
      return {
        status: false,
        error
      }
    }
  }

  public async updateDomainRecord(
    input: Types.Mutation.Input_updateDomainRecord
  ): Promise<Types.Result> {
    const { address, domain, owner, records, confirmation } =  input
    if(!validateAddress(owner)) {
      return {
        status: false,
        error: `Owner address '${owner}' is not valid`
      }
    }
    if(address && !validateAddress(address)) {
      return {
        status: false,
        error: `Address '${address}' is not valid`
      }
    }
    const domainsClient = await this.getTezosDomainsClient(input.connection)
    if(!this._client.signer) {
      return {
        status: false,
        error: 'Signer not available. Signer need to be set to be able to purchase a doamin'
      }
    }
    const [name, tld] = domain.split(".")
    const domainValidationResult = this.validateDomain(domainsClient, name, tld)
    if(!domainValidationResult.status) {
      return domainValidationResult
    }
    const domainRecords = await domainsClient.resolver.resolveDomainRecord(domain)
    let data = new RecordMetadata();
    if (domainRecords && !!domainRecords.data) {
      // @ts-ignore
      data = domainRecords.data
    }
    // @ts-ignore
    // ignore records type being string
    for (const key in records) {
      data.setJson(key, records[key])
    }
    // @ts-ignore
    const operation = await domainsClient.manager.updateRecord({ name: domain, owner, address: address as string | null, data })
    await operation.confirmation(confirmation as number || undefined)
    return {
      status: true
    }
  }
  
  public async createSubDomain(
  input: Types.Mutation.Input_createSubDomain
  ): Promise<Types.Result> {
    const { domain, subdomain, owner } =  input
    let { confirmation } = input
    if (!confirmation) {
      confirmation = 5
    }
    if(!validateAddress(owner)) {
      return {
        status: false,
        error: `Address '${owner}' is not valid`
      }
    }
    const domainsClient = await this.getTezosDomainsClient(input.connection)
    if(!this._client.signer) {
      return {
        status: false,
        error: 'Signer not available. Signer need to be set to be able to purchase a doamin'
      }
    }
    const [name, tld] = domain.split(".")
    const domainValidationResult = this.validateDomain(domainsClient, name, tld)
    if(!domainValidationResult.status) {
      return domainValidationResult
    }
    // @ts-ignore
    const recordOperation = await domainsClient.manager.setChildRecord({ label: subdomain, parent: domain, owner, address: owner, data: new RecordMetadata() });
    await recordOperation.confirmation(confirmation as number || undefined);
    const reverseRecordOperation = await domainsClient.manager.claimReverseRecord({ owner, name: `${subdomain}.${domain}` });
    await reverseRecordOperation.confirmation(confirmation as number || undefined);
    return {
      status: true
    }
  }
    
  public async buyDomain(
    input: Types.Mutation.Input_buyDomain
  ): Promise<Types.Result> {
    const { domain, duration, owner } =  input
    let { confirmation } = input 
    if(!confirmation) {
      confirmation = 5
    }
    if(!validateAddress(owner)) {
      return {
        status: false,
        error: `Address '${owner}' is not valid`
      }
    }
    const domainsClient = await this.getTezosDomainsClient(input.connection)
    if(!this._client.signer) {
      return {
        status: false,
        error: 'Signer not available. Signer need to be set to be able to purchase a domain'
      }
    }
    const [name, tld] = domain.split(".");
    const domainValidationResult = this.validateDomain(domainsClient, name, tld);
    if(!domainValidationResult.status) {
      return domainValidationResult;
    }
    const address = await domainsClient.resolver.resolveNameToAddress(`${name}.${tld}`)
    if (address) {
      return {
        status: false,
        error: `Domain name '${name}.${tld}' is already taken`
      }
    }
    const nonce = generateNonce();
    const request = {
        label: name,
        owner,
        nonce
    };
    const commitOperation = await domainsClient.manager.commit(tld, request);
    await commitOperation.confirmation(confirmation);
    // @ts-ignore
    const buyOperation = await domainsClient.manager.buy(tld, { ...request, duration, address: owner, data: new RecordMetadata(), nonce })
    await buyOperation.confirmation(confirmation)
    return {
      status: true
    }
  }

  // Utils
  private validateDomain(client: TaquitoTezosDomainsClient, name: string, tld: string): Types.Result {
    if (!name) {
      return {
        status: false,
        error: `Domain name: '${name}' is not a valid name for a domain` 
      }
    }
    if (!tld || !client.validator.supportedTLDs.includes(tld)) {
      return {
        status: false,
        error: `Domain TLD: '${tld}' is not valid`
      }
    }
    return {
      status: true
    }
  }

  public setSigner(signer: InMemorySigner): void {
    this._client.tezos.setSignerProvider(signer)
    this._client.signer = signer
  }

  private async getTezosDomainsClient(conn: Types.Connection | null | undefined): Promise<TaquitoTezosDomainsClient> {
    const { tezos, network} = await this.getTezosClient(conn)
    tezos.addExtension(new Tzip16Module())

    return new TaquitoTezosDomainsClient({ tezos, network })
  }

  private async getTezosClient(conn: Types.Connection | null | undefined ): Promise<TezosClient> { 
    // use existing client if connection is not provided
    if(!conn && this._client) {
      return this._client
    }
    
    let tezosClient: TezosClient | undefined;
    
    // use connection with provider if available 
    if(conn && conn.provider) {
      tezosClient = {
        tezos: new TezosToolkit(conn.provider),
        network: conn.network as SupportedNetworkType,
      }
      if(conn.secretKey) {
        const signer = await InMemorySigner.fromSecretKey(conn.secretKey)
        tezosClient.signer = signer
      }
    } else if(conn) {
      for (const network of Object.keys(this._connections)) {
        if(network === conn.network.toLowerCase()) {
          tezosClient = {
            tezos: new TezosToolkit(this._connections[network].provider),
            network: network as SupportedNetworkType,
            signer: this._connections[network].signer
          }
          break
        }
      }
    }
    
    // use default connection if otherwise
    if(!tezosClient) {
      tezosClient = {
        network: TezosDomainPlugin.defaultNetwork,
        tezos: new TezosToolkit(TezosDomainPlugin.defaultConnection.provider),
        signer: TezosDomainPlugin.defaultConnection.signer
      } 
    }
    
    this._client = tezosClient

    if(this._client.signer) {
      this.setSigner(this._client.signer)
    }

    return this._client
  }
}

export const tezosDomainsPlugin: PluginFactory<TezosDomainConfig> = (opts: TezosDomainConfig) => {
  return {
    factory: () => new TezosDomainPlugin(opts),
    manifest: manifest,
  };
};
export const plugin = tezosDomainsPlugin;
