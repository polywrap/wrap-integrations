import { getProvider } from "./Networks";

import {
  ContractAbstraction,
  ContractProvider,
  TezosToolkit,
} from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

export type Address = string;
export type AccountIndex = number;
export type TezosProvider = string;
export type TezosClient = TezosToolkit;

export {
  InMemorySigner
}

export interface ConnectionConfig {
  provider: TezosProvider;
  signer?: InMemorySigner;
}

export interface ConnectionConfigs {
  [network: string]: ConnectionConfig;
}

export interface Connections {
  [network: string]: Connection;
}

export class Connection {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: initialized within setProvider
  private _client: TezosClient;

  constructor(private _config: ConnectionConfig) {
    const { provider, signer } = _config;

    // Sanitize Provider & Signer
    this.setProvider(provider, signer !== undefined ? signer : undefined);
  }

  static fromConfigs(configs: ConnectionConfigs): Connections {
    const connections: Connections = {};

    for (const network of Object.keys(configs)) {
      // Create the connection
      const connection = new Connection(configs[network]);
      const networkStr = network.toLowerCase();

      connections[networkStr] = connection;
    }

    return connections;
  }

  static fromNetwork(network: string): Connection {
    network = network.toLowerCase();

    const provider = getProvider(network);
    if (provider == undefined) {
      throw Error("Provider not available");
    }

    return new Connection({
      provider: getProvider(network),
    });
  }

  static fromNode(node: string): Connection {
    return new Connection({
      provider: node,
    });
  }

  public setProvider(provider: TezosProvider, signer?: InMemorySigner): void {
    this._client = new TezosToolkit(provider);

    if (signer) {
      this._client.setProvider({
        signer: signer,
      });
    }
  }

  public getProvider(): TezosClient {
    return this._client;
  }

  public setSigner(signer: InMemorySigner): void {
    if (!this._client) {
      throw Error(`Please call "setProvider(...)" before calling setSigner`);
    }

    this._config.signer = signer;
    this._client.setProvider({
      signer,
    });
  }

  public getSigner(): InMemorySigner {
    const { signer } = this._config;

    if (signer == undefined) {
      throw Error("Provider does not have a signer");
    }

    return signer;
  }

  public async getContract(
    address: Address
  ): Promise<ContractAbstraction<ContractProvider>> {
    return this._client.contract.at(address);
  }
}
