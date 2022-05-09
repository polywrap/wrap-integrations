import {
  ExecutionOutcomeWithId,
  FinalExecutionOutcome,
  ExecutionStatus,
  SignTransactionResult,
  Transaction,
  Action,
} from "./tsTypes";
import * as testUtils from "./testUtils";
import { HELLO_WASM_METHODS } from "./testUtils";

import * as nearApi from "near-api-js";
import { KeyPair, NearPluginConfig } from "../../../plugin-js";
import { Web3ApiClient } from "@web3api/client-js";
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import path from "path";

const BN = require("bn.js");

jest.setTimeout(360000);

describe("e2e", () => {
  let client: Web3ApiClient;
  let apiUri: string;

  let nearConfig: NearPluginConfig;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  let contractId: string;

  const prepActions = (): Action[] => {
    const setCallValue = testUtils.generateUniqueString("setCallPrefix");
    const args = { value: setCallValue };
    const stringify = (obj: unknown): Buffer => Buffer.from(JSON.stringify(obj));
    const value: Buffer = stringify(args);
    return [{ methodName: "setValue", args: value, gas: "3000000000000", deposit: "0" }];
  };

  beforeAll(async () => {
    // set up test env and deploy api
    const { ethereum, ensAddress, ipfs } = await initTestEnvironment();
    const apiPath: string = path.resolve(__dirname + "/../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
    apiUri = `ens/testnet/${api.ensDomain}`;
    // set up client
    nearConfig = await testUtils.setUpTestConfig();
    near = await nearApi.connect(nearConfig);

    const polywrapConfig = testUtils.getPlugins(ethereum, ensAddress, ipfs, nearConfig);
    client = new Web3ApiClient(polywrapConfig);

    // set up contract account
    contractId = testUtils.generateUniqueString("test");
    workingAccount = await testUtils.createAccount(near);
    await testUtils.deployContract(workingAccount, contractId);
    // set up access key
    const keyPair = KeyPair.fromRandom("ed25519");
    await workingAccount.addKey(
      keyPair.getPublicKey(),
      contractId,
      HELLO_WASM_METHODS.changeMethods,
      new BN("2000000000000000000000000")
    );
    await nearConfig.keyStore!.setKey(testUtils.networkId, workingAccount.accountId, keyPair);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("Creates a transaction without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.query<{ createTransaction: Transaction }>({
      uri: apiUri,
      query: `query {
        createTransaction(
          receiverId: $receiverId
          actions: $actions
          signerId: $signerId
        )
      }`,
      variables: {
        receiverId: contractId,
        actions: actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const transaction: Transaction = result.data!.createTransaction;

    expect(transaction.signerId).toEqual(workingAccount.accountId);
    expect(transaction.publicKey).toBeTruthy();
    expect(transaction.nonce).toBeTruthy();
    expect(transaction.receiverId).toBeTruthy();
    expect(transaction.blockHash).toBeTruthy();
    expect(transaction.actions.length).toEqual(1);
    expect(transaction.actions[0].methodName).toEqual(actions[0].methodName);
    expect(transaction.actions[0].args).toEqual(Uint8Array.from(actions[0].args!));
    expect(transaction.actions[0].gas).toEqual(actions[0].gas);
    expect(transaction.actions[0].deposit).toEqual(actions[0].deposit);
    expect(transaction.actions[0].publicKey).toBeFalsy();
    expect(transaction.actions[0].beneficiaryId).toBeFalsy();
    expect(transaction.actions[0].accessKey).toBeFalsy();
    expect(transaction.actions[0].stake).toBeFalsy();
    expect(transaction.actions[0].code).toBeFalsy();
  });

  it("Signs a transaction without wallet", async () => {
    // create transaction
    const actions: Action[] = prepActions();
    const txQuery = await client.query<{ createTransaction: Transaction }>({
      uri: apiUri,
      query: `query {
        createTransaction(
          receiverId: $receiverId
          actions: $actions
          signerId: $signerId
        )
      }`,
      variables: {
        receiverId: contractId,
        actions: actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(txQuery.errors).toBeFalsy();
    expect(txQuery.data).toBeTruthy();
    const transaction: Transaction = txQuery.data!.createTransaction;

    const result = await client.query<{
      signTransaction: SignTransactionResult;
    }>({
      uri: apiUri,
      query: `query {
        signTransaction(
          transaction: $transaction
        )
      }`,
      variables: {
        transaction: transaction,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const signedTx = result.data!.signTransaction.signedTx;
    const txHash = result.data!.signTransaction.hash;
    expect(signedTx.transaction).toStrictEqual(transaction);
    expect(txHash).toBeTruthy();
    expect(signedTx.signature.data).toBeTruthy();
  });

  it("creates, signs, sends, and awaits mining of a transaction without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.query<{
      signAndSendTransaction: FinalExecutionOutcome;
    }>({
      uri: apiUri,
      query: `mutation {
        signAndSendTransaction(
          receiverId: $receiverId
          actions: $actions
          signerId: $signerId
        )
      }`,
      variables: {
        receiverId: contractId,
        actions: actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const status: ExecutionStatus = result.data!.signAndSendTransaction.status;
    expect(status.successValue).toBeTruthy();
    expect(status.failure).toBeFalsy();
    const txOutcome: ExecutionOutcomeWithId = result.data!.signAndSendTransaction.transaction_outcome;
    expect(txOutcome.id).toBeTruthy();
    expect(txOutcome.outcome.status.successReceiptId).toBeTruthy();
    expect(txOutcome.outcome.status.failure).toBeFalsy();
    const receiptsOutcome: ExecutionOutcomeWithId[] = result.data!.signAndSendTransaction.receipts_outcome;
    expect(receiptsOutcome.length).toBeGreaterThan(0);
  });

  it("creates, signs, and sends a transaction asynchronously without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.query<{ signAndSendTransactionAsync: string }>({
      uri: apiUri,
      query: `mutation {
        signAndSendTransactionAsync(
          receiverId: $receiverId
          actions: $actions
          signerId: $signerId
        )
      }`,
      variables: {
        receiverId: contractId,
        actions: actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const txHash: string = result.data!.signAndSendTransactionAsync;
    expect(txHash).toBeTruthy();
  });
});
