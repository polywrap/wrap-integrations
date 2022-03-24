/* eslint-disable import/no-extraneous-dependencies */
import { query, mutation } from "./resolvers";
import { manifest, Query, Mutation } from "./w3";
import * as Types from "./w3";
import {
  Address,
  AccountIndex,
  InMemorySigner,
  TezosProvider,
  Connection,
  Connections,
  ConnectionConfig,
  ConnectionConfigs,
} from "./Connection";
import * as Mapping from "./mapping";
import { getOperation } from "./indexer";

import {
  Client,
  Plugin,
  PluginPackageManifest,
  PluginFactory,
} from "@web3api/core-js";
import { tzip16 } from "@taquito/tzip16";
import { char2Bytes } from "@taquito/utils";
import { Schema } from "@taquito/michelson-encoder";
import { MichelsonType, packDataBytes } from "@taquito/michel-codec";
import { TempleWallet, TempleDAppNetwork } from "@temple-wallet/dapp";
import { TransactionOperation, MichelsonMap, BigMapAbstraction } from "@taquito/taquito";

// Export all types that are nested inside of TezosConfig.
// This is required for the extractPluginConfigs.ts script.
export {
  Address,
  AccountIndex,
  InMemorySigner,
  TezosProvider,
  ConnectionConfig,
  ConnectionConfigs,
};

export interface TezosConfig {
  networks: ConnectionConfigs;
  defaultNetwork?: string;
}

export class TezosPlugin extends Plugin {
  private _connections: Connections;
  private _defaultNetwork: string;

  constructor(config: TezosConfig) {
    super();
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

  public static manifest(): PluginPackageManifest {
    return manifest;
  }

  public getModules(
    _client: Client
  ): {
    query: Query.Module;
    mutation: Mutation.Module;
  } {
    return {
      query: query(this),
      mutation: mutation(this),
    };
  }

  // Mutation
  public async callContractMethod(
    input: Mutation.Input_callContractMethod
  ): Promise<Types.TxOperation> {
    const transactionOperation = await this._callContractMethod(input);
    return Mapping.toTxOperation(transactionOperation);
  }

  public async callContractMethodAndConfirmation(
    input: Mutation.Input_callContractMethodAndConfirmation
  ): Promise<Types.CallContractMethodConfirmationResponse> {
    const res = await this._callContractMethod(input);
    const initialConfirmation = input.confirmations ? input.confirmations : 0;
    const interval = input.interval ? input.interval : 10;
    const timeout = input.timeout ? input.timeout : 180;
    const finalConfirmation = await res.confirmation(initialConfirmation, interval, timeout);
    return {
      confirmation: finalConfirmation,
      operation: Mapping.toTxOperation(res),
    };
  }

  public async batchContractCalls(
    input: Mutation.Input_batchWalletContractCalls
  ): Promise<string> {
    const connection = await this.getConnection(input.connection);
    const paramsWithKind = input.params.map(Mapping.toTransferParamsWithTransactionKind)
    const batchCalls = await connection.getProvider().contract.batch(paramsWithKind);
    const operation = await batchCalls.send()
    return operation.hash;
  }

  public async transfer(input: Mutation.Input_transfer): Promise<string> {
    const connection = await this.getConnection(input.connection);
    const sendParams = Mapping.fromSendParams(input.params);
    const transferOperation = await connection
      .getProvider()
      .wallet
      .transfer(sendParams);
    const walletOperation = await transferOperation.send();
    return walletOperation.opHash;
  }

  public async transferAndConfirm(
    input: Mutation.Input_transferAndConfirm
  ): Promise<Types.TransferConfirmation> {
    const connection = await this.getConnection(input.connection);
    const sendParams = Mapping.fromSendParams(input.params);
    const transactionWalletOperation = await connection
      .getProvider()
      .wallet.transfer(sendParams);
    const confirmationResponse = await (
      await transactionWalletOperation.send()
    ).confirmation(input.confirmations);
    return Mapping.toTransferConfirmation(confirmationResponse);
  }

  public async signMessage(
    input: Mutation.Input_signMessage
  ): Promise<Types.SignResult> {
    const connection = await this.getConnection(input.connection);
    const bytes = char2Bytes(input.message);
    const result = await connection.getSigner().sign(bytes);
    return Mapping.toSignResult(result);
  }

  public async originate(
    input: Mutation.Input_originate
  ): Promise<Types.OriginationResponse> {
    try {
      const connection = await this.getConnection(input.connection);
      const originateParams = Mapping.fromOriginateParams(input.params);
      const originationOperation = await connection
        .getProvider()
        .contract.originate(originateParams);
      return {
        error: false,
        origination: Mapping.toOriginationOperation(originationOperation),
      };
    } catch (error) {
      return {
        error: true,
        reason: error.message,
      };
    }
  }

  public async originateAndConfirm(
    input: Mutation.Input_originateAndConfirm
  ): Promise<Types.OriginationConfirmationResponse> {
    const connection = await this.getConnection(input.connection);
    const originateParams = Mapping.fromOriginateParams(input.params);
    const originationOperation = await connection
      .getProvider()
      .contract.originate(originateParams);
    const initialConfirmation = input.confirmations
      ? input.confirmations
      : 0;
    const interval = input.interval ? input.interval : 10;
    const timeout = input.timeout ? input.timeout : 180;
    const finalConfirmation = await originationOperation.confirmation(
      initialConfirmation,
      interval,
      timeout
    );
    return {
      confirmation: finalConfirmation,
      origination: Mapping.toOriginationOperation(originationOperation),
    };
  }

  public async connectTempleWallet(
    input: Mutation.Input_connectTempleWallet
  ): Promise<Types.AccountDetails> {
    const isAvailable = await TempleWallet.isAvailable();
    if (!isAvailable) {
      throw new Error('Temple Wallet is not available.');
    }
    const connection = await this.getConnection(input.connection);
    const wallet = new TempleWallet(input.appName);
    await wallet.connect(<TempleDAppNetwork>input.network);
    const provider = await connection.getProvider();
    provider.setWalletProvider(wallet);
    if (!wallet.connected) {
      throw new Error('Failed to connect Temple wallet ')
    }
    const accountPkh = await provider.wallet.pkh();
    const accountBalance = await provider.tz.getBalance(accountPkh);
    return {
      pkh: accountPkh,
      balance: accountBalance.toString()
    };
  }

  public async walletContractCallMethod(
    input: Mutation.Input_walletContractCallMethod
  ): Promise<string> {
    const connection = await this.getConnection(input.connection);
    const contract = await connection.getProvider().wallet.at(input.address);
    const sendParams = input.params ? Mapping.fromSendParams(input.params) : {};
    const walletOperation = await contract.methods[input.method](...this.parseArgs(input.args)).send(sendParams);
    return walletOperation.opHash;
  }

  public async walletOriginate(
    input: Mutation.Input_walletOriginate
  ): Promise<string> {
    const connection = await this.getConnection(input.connection);
    const originateParams = Mapping.fromOriginateParams(input.params);
    const originateWalletOperation = await connection.getProvider()
      .wallet
      .originate(originateParams)
      .send();
    return originateWalletOperation.opHash;
  }

  public async batchWalletContractCalls(
    input: Mutation.Input_batchWalletContractCalls
  ): Promise<string> {
    const connection = await this.getConnection(input.connection);
    const paramsWithKind = input.params.map(Mapping.toTransferParamsWithTransactionKind)
    const batchCalls = await connection.getProvider().wallet.batch(paramsWithKind);
    const operation = await batchCalls.send()
    return operation.opHash;
  }

  // Query
  public async getContractCallTransferParams(
    input: Query.Input_getContractCallTransferParams
  ): Promise<Types.TransferParams> {
    const connection = await this.getConnection(input.connection);
    const contract = await connection.getProvider().contract.at(input.address);
    const sendParams = input.params ? Mapping.fromSendParams(input.params) : {};
    const params = await contract.methods[input.method](...this.parseArgs(input.args)).toTransferParams(sendParams);
    return Mapping.toTransferParams(params);
  }

  public async callContractView(
    input: Query.Input_callContractView
  ): Promise<string> {
    const response = await this._callContractView(input);
    return JSON.stringify(response);
  }

  public async getWalletPKH(input: Query.Input_getWalletPKH): Promise<string> {
    const connection = await this.getConnection(input.connection);
    return await connection.getProvider().wallet.pkh();
  }

  public async getOperationStatus(input: Query.Input_getOperationStatus): Promise<Types.OperationStatus> {
    const network = input.network.toString();
    const response = await getOperation(network, input.hash);
    return Mapping.toOperationStatus(response);
  }

  public async getPublicKey(input: Query.Input_getPublicKey): Promise<string> {
    const connection = await this.getConnection(input.connection);
    return await connection.getSigner().publicKey();
  }

  public async getPublicKeyHash(
    input: Query.Input_getPublicKeyHash
  ): Promise<string> {
    const connection = await this.getConnection(input.connection);
    return await connection.getSigner().publicKeyHash();
  }

  public async getRevealEstimate(
    input: Query.Input_getRevealEstimate
  ): Promise<Types.EstimateResult> {
    try {
      const connection = await this.getConnection(input.connection);
      const revealParams = Mapping.fromRevealParams(input.params);
      const estimate = await connection
        .getProvider()
        .estimate.reveal(revealParams);
      if (!estimate) {
        throw Error("account is already revealed");
      }
      return {
        error: false,
        estimate: Mapping.toEstimate(estimate),
      };
    } catch (error) {
      return {
        error: true,
        reason: error.message,
      };
    }
  }

  public async getTransferEstimate(
    input: Query.Input_getTransferEstimate
  ): Promise<Types.EstimateResult> {
    try {
      const connection = await this.getConnection(input.connection);
      const sendParams = Mapping.fromSendParams(input.params);
      const estimate = await connection
        .getProvider()
        .estimate.transfer(sendParams);
      return {
        error: false,
        estimate: Mapping.toEstimate(estimate),
      };
    } catch (error) {
      return {
        error: true,
        reason: error.message,
      };
    }
  }

  public async getOriginateEstimate(
    input: Query.Input_getOriginateEstimate
  ): Promise<Types.EstimateResult> {
    try {
      const connection = await this.getConnection(input.connection);
      const originateParams = Mapping.fromOriginateParams(input.params);
      const estimate = await connection
        .getProvider()
        .estimate.originate(originateParams);
      return {
        error: false,
        estimate: Mapping.toEstimate(estimate),
      };
    } catch (error) {
      return {
        error: true,
        reason: error.message,
      };
    }
  }

  public async checkAddress(input: Query.Input_checkAddress): Promise<boolean> {
    try {
      const connection = await this.getConnection(input.connection);
      const balance = await connection
        .getProvider()
        .tz.getBalance(input.address);
      if (!balance.toString()) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getBalance(input: Query.Input_getBalance): Promise<string> {
    const connection = await this.getConnection(input.connection);
    const balance = await connection.getProvider().tz.getBalance(input.address);
    return balance.toString();
  }

  public async getContractStorage(input: Query.Input_getContractStorage): Promise<string> {
    const connection = await this.getConnection(input.connection);
    const contract = await connection.getProvider().contract.at(input.address);
    const regex = /(\[[_,a-zA-Z.0-9\s"]+\])|([_a-zA-Z0-9]+)|([0-9]+)/g
    let storage = await contract.storage();
    let key = input.key.replaceAll("'", '"');
    const keys = key.match(regex) || [];
    for (let newKey of keys) {
      try {
        newKey = JSON.parse(newKey)
      } catch (error) {
        // pass
      }
      if (MichelsonMap.isMichelsonMap(storage) || storage instanceof BigMapAbstraction) {
        storage = await storage.get(newKey);
        // @ts-ignore
      } else if (typeof storage === 'object' && storage[newKey]) {
        // @ts-ignore
        storage = storage[newKey]
      } else {
        throw new Error(`Unsupported type: '${typeof storage}' is supported`)
      }
    }
    if(!!input.field) {
      let field = input.field;
      try {
        field = JSON.parse(<string>input.field);
      } catch (error) {
        // ignore if parsing string fails
      }
      if (storage instanceof BigMapAbstraction) {
        storage = await storage.get(field);
      } else {
        // @ts-ignore
        storage = storage[field];
      }
    }
    return this.stringify(storage);
  }

  public async executeTzip16View(input: Query.Input_executeTzip16View): Promise<string> {
    const connection = await this.getConnection(input.connection);
    const contract = await connection.getProvider().contract.at(input.address, tzip16);
    const views = await contract.tzip16().metadataViews()
    const data = await views[input.viewName]().executeView(...this.parseArgs(input.args))
    return this.stringify(data);
  }

  public async encodeMichelsonExpressionToBytes(input: Query.Input_encodeMichelsonExpressionToBytes): Promise<string> {
    const expression = this.parseValue(input.expression) as unknown as MichelsonType;
    const value: any = this.parseValue(input.value);
    const schema = new Schema(expression);
    const encoded = schema.Encode(value)
    const packed = packDataBytes(encoded, expression);
    return packed.bytes;
  }

  // Utils
  public async getConnection(
    connection?: Types.Connection | null
  ): Promise<Connection> {
    if (!connection) {
      return this._connections[this._defaultNetwork];
    }
    const { networkNameOrChainId, provider } = connection;
    let result: Connection= this._connections[this._defaultNetwork];
    // If a custom network is provided, either get an already
    // established connection, or a create a new one
    if (networkNameOrChainId) {
      const networkStr = networkNameOrChainId.toLowerCase();
      if (this._connections[networkStr]) {
        result = this._connections[networkStr];
      } else {
        try {
          result = Connection.fromNetwork(networkStr);
        } catch (error) {
          // ignore if network is not supported by core
        }
      }
    } 
    // If a custom node endpoint is provided, create a combined
    // connection with the node's endpoint and a connection's signer
    // (if one exists for the network)
    else if (provider) {
      const nodeConnection = Connection.fromNode(provider);
      result = nodeConnection;
    }
    return result;
  }

  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`unable to parse '${value}'`)
    }
  }

  public parseArgs(args?: string | null): unknown[] {
    if (!args) {
      return [];
    }
    const parsedArgs: unknown[] = JSON.parse(args);
    if (!Array.isArray(parsedArgs)) {
      throw new Error(`args must be a stringified array`)
    }
    for (let argKey in parsedArgs) {
      // TODO(abdul): deep parse all values for michelson maps
      // POC
      if (
        typeof parsedArgs[argKey] === "object" && 
        !Array.isArray(parsedArgs[argKey]) && 
        parsedArgs[argKey].isMichelsonMap === true && 
        parsedArgs[argKey].values
      ) {
        const map = new MichelsonMap();
        for (let mapValue of parsedArgs[argKey].values) {
          if (!(mapValue.key && mapValue.value)) {
            throw new Error(`michelson map should have a key and a value`)
          }
          map.set(mapValue.key, mapValue.value);
        }
        parsedArgs[argKey] = map
      }
    }
    return parsedArgs;
  }

  private async _callContractMethod(
    input: Mutation.Input_callContractMethod
  ): Promise<TransactionOperation> {
    const connection = await this.getConnection(input.connection);
    const contract = await connection.getContract(input.address);
    const sendParams = input.params ? Mapping.fromSendParams(input.params) : {};
    return contract.methods[input.method](...this.parseArgs(input.args)).send(sendParams);
  }

  private async _callContractView(
    input: Query.Input_callContractView
  ): Promise<any> {
    const lambaAddress = input.lambaAddress ? input.lambaAddress : undefined;
    const connection = await this.getConnection(input.connection);
    const contract = await connection.getContract(input.address);
    return contract.views[input.view](...this.parseArgs(input.args)).read(lambaAddress);
  }

  private stringify(output: any): string {
    if (!output) {
      return ""
    }
    switch (typeof output) {
      case "number":
      case "string":
      case "boolean":
        output = output.toString();
        break;
      case "object":
        if (typeof output.valueOf() === 'string') {
          output = output.valueOf();
          break;
        }
        if (MichelsonMap.isMichelsonMap(output)) {
          const keys = output.keys()
          const michelsonObject: Record<string, string> = {}
          for (let key of keys) {
            michelsonObject[key] = output.get(key)
          }
          output = JSON.stringify(michelsonObject);
          break;
        }
        const keys = Object.keys(output)
        if (keys.length > 0) {
          let out: Record<string, any> = {};
          for (const key of keys) {
            out[key] = this.stringify(output[key]);
          }
          output = JSON.stringify(out);
        }
        break;  
    }
    return output;
  }
}

export const tezosPlugin: PluginFactory<TezosConfig> = (opts: TezosConfig) => {
  return {
    factory: () => new TezosPlugin(opts),
    manifest: manifest,
  };
};
export const plugin = tezosPlugin;
