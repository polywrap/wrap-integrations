/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  manifest,
  Module,
  Transaction,
  SignedTransaction,
  Signature,
  SignTransactionResult,
  FinalExecutionOutcome,
  PublicKey,
  Json,
  Args_requestSignIn,
  Args_sendJsonRpc,
  Args_getAccountId,
  Args_sendTransactionAsync,
  Args_createKey,
  Args_requestSignTransactions,
  Args_signTransaction,
  Args_isSignedIn,
  Args_signOut,
  Args_sendTransaction,
  Args_signMessage,
  Args_createTransactionWithWallet,
  Args_getPublicKey,
} from "./wrap";
import { fromAction, fromSignedTx, fromTx, toPublicKey } from "./typeMapping";
import { parseJsonFinalExecutionOutcome } from "./jsonMapping";
import { JsonFinalExecutionOutcome } from "./jsonTypes";

import { ConnectConfig } from "near-api-js";
import { PluginFactory, PluginPackageManifest } from "@polywrap/core-js";
import * as nearApi from "near-api-js";
import sha256 from "js-sha256";

export { keyStores as KeyStores, KeyPair } from "near-api-js";

export interface NearPluginConfig
  extends ConnectConfig,
    Record<string, unknown> {}

export class NearPlugin extends Module<NearPluginConfig> {
  private near: nearApi.Near;
  private wallet?: nearApi.WalletConnection;
  private _nextId = 123;

  constructor(private _nearConfig: NearPluginConfig) {
    super(_nearConfig);
    void this.connect();
  }

  public static manifest(): PluginPackageManifest {
    return manifest;
  }

  public async requestSignIn(input: Args_requestSignIn): Promise<boolean> {
    if (!this.wallet) {
      throw Error(
        "Near wallet is unavailable, likely because the NEAR plugin is operating outside of a browser."
      );
    }
    const { contractId, methodNames, successUrl, failureUrl } = input;
    await this.wallet.requestSignIn({
      contractId: contractId ?? undefined,
      methodNames: methodNames ?? undefined,
      successUrl: successUrl ?? undefined,
      failureUrl: failureUrl ?? undefined,
    });
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async signOut(input?: Args_signOut): Promise<boolean> {
    this.wallet?.signOut();
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async isSignedIn(input?: Args_isSignedIn): Promise<boolean> {
    return this.wallet?.isSignedIn() ?? false;
  }

  public async getAccountId(
    input?: Args_getAccountId // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<string | null> {
    return this.wallet?.getAccountId() ?? null;
  }

  public async getPublicKey(
    input: Args_getPublicKey
  ): Promise<PublicKey | null> {
    const { accountId } = input;
    const keyPair = await this._nearConfig.keyStore!.getKey(
      this._nearConfig.networkId,
      accountId
    );
    if (keyPair === null) {
      return null;
    }
    return toPublicKey(keyPair.getPublicKey());
  }

  public async createTransactionWithWallet(
    input: Args_createTransactionWithWallet
  ): Promise<Transaction> {
    const { receiverId, actions } = input;
    if (!this.wallet || !this.wallet.isSignedIn()) {
      throw Error(
        "Near wallet is unavailable, likely because the NEAR plugin is operating outside of a browser."
      );
    }
    const signerId = this.wallet.getAccountId();
    if (!signerId) {
      throw Error("User is not signed in to wallet.");
    }
    const walletAccount = new nearApi.ConnectedWalletAccount(
      this.wallet,
      this.near.connection,
      signerId
    );
    const localKey = await this.near.connection.signer.getPublicKey(
      signerId,
      this.near.connection.networkId
    );
    const accessKey = await walletAccount.accessKeyForTransaction(
      receiverId,
      actions.map(fromAction),
      localKey
    );
    if (!accessKey) {
      throw new Error(
        `Cannot find matching key for transaction sent to ${receiverId}`
      );
    }
    const block = await this.near.connection.provider.block({
      finality: "final",
    });
    const blockHash = block.header.hash;
    const nonce = accessKey.access_key.nonce + 1;
    const publicKey = nearApi.utils.PublicKey.from(accessKey.public_key);

    return {
      signerId: signerId,
      publicKey: toPublicKey(publicKey),
      nonce: nonce.toString(),
      receiverId: receiverId,
      blockHash: nearApi.utils.serialize.base_decode(blockHash),
      actions: actions,
    };
  }

  public async signTransaction(
    input: Args_signTransaction
  ): Promise<SignTransactionResult> {
    const { transaction } = input;
    const tx: nearApi.transactions.Transaction = fromTx(transaction);
    const message = nearApi.utils.serialize.serialize(
      nearApi.transactions.SCHEMA,
      tx
    );
    const hash = new Uint8Array(sha256.sha256.array(message));
    const { signature: data } = await this.near.connection.signer.signMessage(
      message,
      transaction.signerId,
      this.near.connection.networkId
    );
    const signedTx: SignedTransaction = {
      transaction,
      signature: {
        keyType: transaction.publicKey.keyType,
        data,
      },
    };
    return { hash, signedTx };
  }

  public async createKey(input: Args_createKey): Promise<PublicKey> {
    const { networkId, accountId } = input;
    const keyPair = await this._nearConfig.keyStore!.getKey(
      this._nearConfig.networkId,
      accountId
    );
    await this._nearConfig.keyStore!.setKey(networkId, accountId, keyPair);
    return toPublicKey(keyPair.getPublicKey());
  }

  public async sendJsonRpc(input: Args_sendJsonRpc): Promise<Json> {
    const method = input.method;
    const params = JSON.parse(input.params);
    const result = await this._sendJsonRpc({ method, params });
    return JSON.stringify(result);
  }

  public async requestSignTransactions(
    input: Args_requestSignTransactions
  ): Promise<boolean> {
    if (!this.wallet) {
      return false;
    }
    const { transactions, callbackUrl, meta } = input;
    await this.wallet.requestSignTransactions({
      transactions: transactions.map(fromTx),
      callbackUrl: callbackUrl ?? undefined,
      meta: meta ?? undefined,
    });
    return true;
  }
  public async signMessage(input: Args_signMessage): Promise<Signature> {
    const { message, signerId } = input;
    const {
      signature,
      publicKey,
    } = await this.near.connection.signer.signMessage(
      message as Uint8Array,
      signerId,
      this.near.connection.networkId
    );

    return {
      data: signature,
      keyType: toPublicKey(publicKey).keyType,
    };
  }

  public async sendTransaction(
    input: Args_sendTransaction
  ): Promise<FinalExecutionOutcome> {
    const { signedTx } = input;
    const nearSignedTx = fromSignedTx(signedTx);
    const bytes = nearSignedTx.encode();
    const outcome = await this._sendJsonRpc<JsonFinalExecutionOutcome>({
      method: "broadcast_tx_commit",
      params: [Buffer.from(bytes).toString("base64")],
    });
    return parseJsonFinalExecutionOutcome(outcome);
  }

  public async sendTransactionAsync(
    input: Args_sendTransactionAsync
  ): Promise<string> {
    const { signedTx } = input;
    const nearSignedTx = fromSignedTx(signedTx);
    const bytes = nearSignedTx.encode();
    return this._sendJsonRpc<string>({
      method: "broadcast_tx_async",
      params: [Buffer.from(bytes).toString("base64")],
    });
  }

  private async connect(): Promise<boolean> {
    this.near = new nearApi.Near(this._nearConfig);
    if (typeof window !== "undefined") {
      this.wallet = new nearApi.WalletConnection(this.near, null);
    }
    return true;
  }

  private async _sendJsonRpc<T>(input: {
    method: string;
    params: unknown;
  }): Promise<T> {
    const { method, params } = input;
    const request = {
      method,
      params: params,
      id: this._nextId++,
      jsonrpc: "2.0",
    };
    const { result, error } = await nearApi.utils.web.fetchJson(
      this._nearConfig.nodeUrl,
      JSON.stringify(request)
    );
    if (error) {
      throw Error(`[${error.code}] ${error.message}: ${error.data}`);
    }
    if (!result) {
      throw Error(`Exceeded attempts for request to ${method}.`);
    }
    return result;
  }
}

export const nearPlugin: PluginFactory<NearPluginConfig> = (
  opts: NearPluginConfig
) => {
  return {
    factory: () => new NearPlugin(opts),
    manifest: NearPlugin.manifest(),
  };
};

export const plugin = nearPlugin;
