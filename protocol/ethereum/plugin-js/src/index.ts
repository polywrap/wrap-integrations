import {
  Module,
  manifest,
  TxReceipt,
  Network,
  TxResponse,
  Connection as ConnectionType,
  Args_sendTransaction,
  Args_getNetwork,
  Args_sendTransactionAndWait,
  Args_signMessage,
  Args_sendRPC,
  Args_callView
} from "./wrap";
import * as Mapping from "./mapping";
import { Connections, Connection } from "./Connection";

import { PluginFactory } from "@polywrap/core-js";
import { ConnectionConfigs } from "./Connection";

export interface EthereumConfig {
  networks: ConnectionConfigs;
  defaultNetwork?: string;
}

export class EthereumSignerPlugin extends Module<EthereumConfig> {
  private _connections: Connections;
  private _defaultNetwork: string;

  constructor(config: EthereumConfig) {
    super(config);

    this._connections = Connection.fromConfigs(config.networks);

    // Assign the default network (mainnet if not provided)
    if (config.defaultNetwork) {
      this._defaultNetwork = config.defaultNetwork;
    } else {
      this._defaultNetwork = "mainnet";
    }

    // Create a connection for the default network if none exists
    if (!this._connections[this._defaultNetwork]) {
      this._connections[this._defaultNetwork] = Connection.fromNetwork(
        this._defaultNetwork
      );
    }
  }

  public async sendTransaction(
    args: Args_sendTransaction
  ): Promise<TxResponse> {
    const connection = await this.getConnection(args.connection);
    const signer = connection.getSigner();
    const res = await signer.sendTransaction(
      Mapping.fromTxRequest(args.txRequest)
    );
    return Mapping.toTxResponse(res);
  }

  public async sendTransactionAndWait(
    args: Args_sendTransactionAndWait
  ): Promise<TxReceipt> {
    const connection = await this.getConnection(args.connection);
    const signer = connection.getSigner();
    const response = await signer.sendTransaction(
      Mapping.fromTxRequest(args.txRequest)
    );
    const receipt = await response.wait();
    return Mapping.toTxReceipt(receipt);
  }

  public async signMessage(args: Args_signMessage): Promise<string> {
    const connection = await this.getConnection(args.connection);
    return await connection.getSigner().signMessage(args.message);
  }

  public async sendRPC(args: Args_sendRPC): Promise<string> {
    const connection = await this.getConnection(args.connection);
    const provider = connection.getProvider();
    const response = await provider.send(args.method, args.params);
    return response.toString();
  }

  public async getNetwork(
    args: Args_getNetwork
  ): Promise<Network> {
    const connection = await this.getConnection(args.connection);
    const provider = connection.getProvider();
    const network = await provider.getNetwork();
    return {
      name: network.name,
      chainId: network.chainId,
      ensAddress: network.ensAddress,
    };
  }

  public async callView(args: Args_callView): Promise<string> {
    const connection = await this.getConnection(args.connection);
    const res = await connection
      .getProvider()
      .call(Mapping.fromTxRequest(args.txRequest));
    return res.toString();
  }

  public async getConnection(
    connection?: ConnectionType | null
  ): Promise<Connection> {
    if (!connection) {
      return this._connections[this._defaultNetwork];
    }

    const { networkNameOrChainId, node } = connection;
    let result: Connection;

    // If a custom network is provided, either get an already
    // established connection, or a create a new one
    if (networkNameOrChainId) {
      const networkStr = networkNameOrChainId.toLowerCase();
      if (this._connections[networkStr]) {
        result = this._connections[networkStr];
      } else {
        const chainId = Number.parseInt(networkStr);

        if (!isNaN(chainId)) {
          result = Connection.fromNetwork(chainId);
        } else {
          result = Connection.fromNetwork(networkStr);
        }
      }
    } else {
      result = this._connections[this._defaultNetwork];
    }

    // If a custom node endpoint is provided, create a combined
    // connection with the node's endpoint and a connection's signer
    // (if one exists for the network)
    if (node) {
      const nodeConnection = Connection.fromNode(node);
      const nodeNetwork = await nodeConnection.getProvider().getNetwork();

      const establishedConnection =
        this._connections[nodeNetwork.chainId.toString()] ||
        this._connections[nodeNetwork.name];

      if (establishedConnection) {
        try {
          nodeConnection.setSigner(establishedConnection.getSigner());
        } catch (e) {
          // It's okay if there isn't a signer available.
        }
      }

      result = nodeConnection;
    }

    return result;
  }

  public parseArgs(args?: string[] | null): unknown[] {
    if (!args) {
      return [];
    }

    return args.map((arg: string) =>
      (arg.startsWith("[") && arg.endsWith("]")) ||
      (arg.startsWith("{") && arg.endsWith("}"))
        ? JSON.parse(arg)
        : arg
    );
  }
}

export const ethereumSignerPlugin: PluginFactory<EthereumConfig> = (
  pluginConfig: EthereumConfig
) => {
  return {
    factory: () => new EthereumSignerPlugin(pluginConfig),
    manifest,
  };
} 

export const plugin = ethereumSignerPlugin;
