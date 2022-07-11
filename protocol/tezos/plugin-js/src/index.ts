import {
  Module,
  manifest,
  Args_callContractMethod,
  Args_callContractMethodAndConfirmation,
  Args_batchContractCalls,
  Args_transfer,
  Args_transferAndConfirm,
  Args_signMessage,
  Args_originate,
  Args_originateAndConfirm,
  Args_connectTempleWallet,
  Args_walletContractCallMethod,
  Args_walletOriginate,
  Args_batchWalletContractCalls,
  TxOperation,
  CallContractMethodConfirmationResponse,
  TransferConfirmation,
  SignResult,
  OriginationResponse,
  OriginationConfirmationResponse,
  AccountDetails,
  Args_getContractCallTransferParams,
  Args_callContractView,
  Args_encodeMichelsonExpressionToBytes,
  Args_getWalletPKH,
  Args_getOperationStatus,
  Args_getContractStorage,
  Args_executeTzip16View,
  Args_getPublicKey,
  Args_getPublicKeyHash,
  Args_getRevealEstimate,
  Args_getTransferEstimate,
  Args_getOriginateEstimate,
  Args_checkAddress,
  Args_getBalance,
  SendParams,
  OperationStatus,
  EstimateResult,
  Connection as SchemaConnection,
} from "./wrap";
import * as Mapping from "./common/mapping";
import { parseArgs, parseValue, stringify } from "./common/parsing";
import { getConnection, Connections, Connection, getConnections } from "./common/Connection";
import { getOperation } from "./common/indexer";

import { char2Bytes } from "@taquito/utils";
import { TempleWallet, TempleDAppNetwork } from "@temple-wallet/dapp";
import { TransactionOperation } from "@taquito/taquito";

import { tzip16 } from "@taquito/tzip16";
import { Schema } from "@taquito/michelson-encoder";
import { MichelsonType, packDataBytes } from "@taquito/michel-codec";
import { MichelsonMap, BigMapAbstraction } from "@taquito/taquito";
import { TezosConfig } from "./common/TezosConfig";
import { PluginFactory } from "@polywrap/core-js";

export type TezosPluginConfig = TezosConfig & Record<string, unknown>;

export class TezosPlugin extends Module<TezosPluginConfig> {
  private _connections: Connections;
  private _defaultNetwork: string;

  constructor(config: TezosPluginConfig) {
    super(config);

    const connectionsCfg = getConnections(config)
    this._connections = connectionsCfg.connections;
    this._defaultNetwork = connectionsCfg.defaultNetwork
  }

  public async getContractCallTransferParams(
    input: Args_getContractCallTransferParams
  ): Promise<SendParams> {
    const connection = await this._getConnection(input.connection);
    const contract = await connection.getProvider().contract.at(input.address);
    const sendParams = input.params ? Mapping.fromSendParams(input.params) : {};
    const params = await contract.methods[input.method](...parseArgs(input.args)).toTransferParams(sendParams);
    return Mapping.toTransferParams(params);
  }

  public async callContractView(
    input: Args_callContractView
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    const contract = await connection.getContract(input.address);
    return contract.views[input.view](...parseArgs(input.args)).read();
  }

  public async encodeMichelsonExpressionToBytes(
    input: Args_encodeMichelsonExpressionToBytes
  ): Promise<string> {
    const expression = parseValue(input.expression) as unknown as MichelsonType;
    const value: any = parseValue(input.value);
    const schema = new Schema(expression);
    const encoded = schema.Encode(value)
    const packed = packDataBytes(encoded, expression);
    return packed.bytes;
  }

  public async getWalletPKH(
    input: Args_getWalletPKH
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    return await connection.getProvider().wallet.pkh();
  }

  public async getOperationStatus(
    input: Args_getOperationStatus
  ): Promise<OperationStatus> {
    const network = input.network.toString();
    const response = await getOperation(network, input.hash);
    return response;
  }

  public async getContractStorage(
    input: Args_getContractStorage
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
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
    return stringify(storage);
  }

  public async executeTzip16View(
    input: Args_executeTzip16View
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    const contract = await connection.getProvider().contract.at(input.address, tzip16);
    const views = await contract.tzip16().metadataViews()
    const data = await views[input.viewName]().executeView(...parseArgs(input.args))
    return stringify(data);
  }

  public async getPublicKey(
    input: Args_getPublicKey
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    return await connection.getSigner().publicKey();
  }

  public async getPublicKeyHash(
    input: Args_getPublicKeyHash
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    return await connection.getSigner().publicKeyHash();
  }

  public async getRevealEstimate(
    input: Args_getRevealEstimate
  ): Promise<EstimateResult> {
    try {
      const connection = await this._getConnection(input.connection);
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
    input: Args_getTransferEstimate
  ): Promise<EstimateResult> {
    try {
      const connection = await this._getConnection(input.connection);
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
    input: Args_getOriginateEstimate
  
  ): Promise<EstimateResult> {
    try {
      const connection = await this._getConnection(input.connection);
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

  public async checkAddress(
    input: Args_checkAddress
  ): Promise<boolean> {
    try {
      const connection = await this._getConnection(input.connection);
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

  public async getBalance(
    input: Args_getBalance
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    const balance = await connection.getProvider().tz.getBalance(input.address);
    return balance.toString();
  }

  private async _getConnection(
    connection?: SchemaConnection | null
  ): Promise<Connection> {
    return getConnection(this._connections, this._defaultNetwork, connection);
  }

  public async callContractMethod(
    input: Args_callContractMethod
  ): Promise<TxOperation> {
    const transactionOperation = await this._callContractMethod(input);
    return Mapping.toTxOperation(transactionOperation);
  }

  public async callContractMethodAndConfirmation(
    input: Args_callContractMethodAndConfirmation
  ): Promise<CallContractMethodConfirmationResponse> {
    const res = await this._callContractMethod(input);
    const initialConfirmation = input.confirmations ? input.confirmations : 0;
    const timeout = input.timeout ? input.timeout : 180;
    const finalConfirmation = await res.confirmation(initialConfirmation, timeout);
    return {
      confirmation: finalConfirmation,
      operation: Mapping.toTxOperation(res),
    };
  }

  public async batchContractCalls(
    input: Args_batchContractCalls
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    const paramsWithKind = input.params.map(Mapping.toTransferParamsWithTransactionKind)
    const batchCalls = connection.getProvider().contract.batch(paramsWithKind);
    const operation = await batchCalls.send()
    return operation.hash;
  }

  public async transfer(input: Args_transfer): Promise<string> {
    const connection = await this._getConnection(input.connection);
    const sendParams = Mapping.fromSendParams(input.params);
    const transferOperation = await connection
      .getProvider()
      .wallet
      .transfer(sendParams);
    const walletOperation = await transferOperation.send();
    return walletOperation.opHash;
  }

  public async transferAndConfirm(
    input: Args_transferAndConfirm
  ): Promise<TransferConfirmation> {
    const connection = await this._getConnection(input.connection);
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
    input: Args_signMessage
  ): Promise<SignResult> {
    const connection = await this._getConnection(input.connection);
    const bytes = char2Bytes(input.message);
    const result = await connection.getSigner().sign(bytes);
    return Mapping.toSignResult(result);
  }

  public async originate(
    input: Args_originate
  ): Promise<OriginationResponse> {
    try {
      const connection = await this._getConnection(input.connection);
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
    input: Args_originateAndConfirm
  ): Promise<OriginationConfirmationResponse> {
    const connection = await this._getConnection(input.connection);
    const originateParams = Mapping.fromOriginateParams(input.params);
    const originationOperation = await connection
      .getProvider()
      .contract.originate(originateParams);
    const initialConfirmation = input.confirmations
      ? input.confirmations
      : 0;
    const timeout = input.timeout ? input.timeout : 180;
    const finalConfirmation = await originationOperation.confirmation(
      initialConfirmation,
      timeout
    );
    return {
      confirmation: finalConfirmation,
      origination: Mapping.toOriginationOperation(originationOperation),
    };
  }

  public async connectTempleWallet(
    input: Args_connectTempleWallet
  ): Promise<AccountDetails> {
    const isAvailable = await TempleWallet.isAvailable();
    if (!isAvailable) {
      throw new Error('Temple Wallet is not available.');
    }
    const connection = await this._getConnection(input.connection);
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
    input: Args_walletContractCallMethod
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    const contract = await connection.getProvider().wallet.at(input.address);
    const sendParams = input.params ? Mapping.fromSendParams(input.params) : {};
    const walletOperation = await contract.methods[input.method](...parseArgs(input.args)).send(sendParams);
    return walletOperation.opHash;
  }

  public async walletOriginate(
    input: Args_walletOriginate
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    const originateParams = Mapping.fromOriginateParams(input.params);
    const originateWalletOperation = await connection.getProvider()
      .wallet
      .originate(originateParams)
      .send();
    return originateWalletOperation.opHash;
  }

  public async batchWalletContractCalls(
    input: Args_batchWalletContractCalls
  ): Promise<string> {
    const connection = await this._getConnection(input.connection);
    const paramsWithKind = input.params.map(Mapping.toTransferParamsWithTransactionKind)
    const batchCalls = connection.getProvider().wallet.batch(paramsWithKind);
    const operation = await batchCalls.send()
    return operation.opHash;
  }

  private async _callContractMethod(
    input: Args_callContractMethod
  ): Promise<TransactionOperation> {
    const connection = await this._getConnection(input.connection);
    const contract = await connection.getContract(input.address);
    const sendParams = input.params ? Mapping.fromSendParams(input.params) : {};
    return contract.methods[input.method](...parseArgs(input.args)).send(sendParams);
  }
}

export const tezosPlugin: PluginFactory<TezosPluginConfig> = (
  pluginConfig: TezosPluginConfig
) => {
  return {
    factory: () => new TezosPlugin(pluginConfig),
    manifest,
  };
} 

export const plugin = tezosPlugin;
