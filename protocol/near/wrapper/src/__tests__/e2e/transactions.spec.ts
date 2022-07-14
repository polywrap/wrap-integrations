import {
  FinalExecutionOutcome,
  SignTransactionResult,
  Transaction,
  Action,
} from "../tsTypes";
import * as testUtils from "../testUtils";
import { NearPluginConfig } from "../../../../plugin-js";

import * as nearApi from "near-api-js";
import { PolywrapClient } from "@polywrap/client-js";
import {
  ensAddresses,
  initTestEnvironment,
  providers,
  stopTestEnvironment,
} from "@polywrap/test-env-js";

jest.setTimeout(360000);
jest.retryTimes(3);

describe("Transactions", () => {
  let client: PolywrapClient;
  let apiUri: string;

  let nearConfig: NearPluginConfig;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  let contractId: string;

  const prepActions = (): Action[] => {
    const setCallValue = testUtils.generateUniqueString("setCallPrefix");
    const args = { value: setCallValue };
    const stringify = (obj: unknown): Buffer =>
      Buffer.from(JSON.stringify(obj));
    const value: Buffer = stringify(args);
    return [
      {
        methodName: "setValue",
        args: value,
        gas: "3000000000000",
        deposit: "0",
      },
    ];
  };

  beforeAll(async () => {
    // set up test env and deploy api
    await initTestEnvironment();
    const absPath = __dirname + "/../../../build";
    apiUri = `fs/${absPath}`;
    // set up client
    nearConfig = await testUtils.setUpTestConfig();
    near = await nearApi.connect(nearConfig);

    const polywrapConfig = testUtils.getPlugins(
      providers.ethereum,
      ensAddresses.ensAddress,
      providers.ipfs,
      nearConfig
    );
    client = new PolywrapClient(polywrapConfig);

    // set up contract account
    contractId = testUtils.generateUniqueString("test");
    workingAccount = await testUtils.createAccount(near);
    await testUtils.deployContract(workingAccount, contractId);
  });

  afterAll(async () => {
    await stopTestEnvironment();
    try {
      await workingAccount.deleteAccount(testUtils.testAccountId);
    } catch (e) {
      console.log(e);
    }
  });

  test("Should create a transaction without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.invoke<Transaction>({
      uri: apiUri,
      method: "createTransaction",
      args: {
        receiverId: contractId,
        actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const transaction = result.data as Transaction;

    expect(transaction.signerId).toEqual(workingAccount.accountId);
    expect(transaction.publicKey).toBeTruthy();
    expect(transaction.nonce).toBeTruthy();
    expect(transaction.receiverId).toBeTruthy();
    expect(transaction.blockHash).toBeTruthy();
    expect(transaction.actions.length).toEqual(1);
    expect(transaction.actions[0].methodName).toEqual(actions[0].methodName);
    expect(transaction.actions[0].args).toEqual(
      Uint8Array.from(actions[0].args!)
    );
    expect(transaction.actions[0].gas).toEqual(actions[0].gas);
    expect(transaction.actions[0].deposit).toEqual(actions[0].deposit);
    expect(transaction.actions[0].publicKey).toBeFalsy();
    expect(transaction.actions[0].beneficiaryId).toBeFalsy();
    expect(transaction.actions[0].accessKey).toBeFalsy();
    expect(transaction.actions[0].stake).toBeFalsy();
    expect(transaction.actions[0].code).toBeFalsy();
  });

  test("Should sign a transaction without wallet", async () => {
    // create transaction
    const actions: Action[] = prepActions();
    const tx = await client.invoke<Transaction>({
      uri: apiUri,
      method: "createTransaction",
      args: {
        receiverId: contractId,
        actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(tx.error).toBeFalsy();
    expect(tx.data).toBeTruthy();
    const transaction = tx.data as Transaction;

    const result = await client.invoke<SignTransactionResult>({
      uri: apiUri,
      method: "signTransaction",
      args: {
        transaction,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const signedTx = result.data?.signedTx;
    const hash = result.data?.hash;
    expect(signedTx?.transaction).toStrictEqual(transaction);
    expect(hash).toBeTruthy();
    expect(signedTx?.signature.data).toBeTruthy();
  });

  test("Should create, sign, send, and await mining of a transaction without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.invoke<FinalExecutionOutcome>({
      uri: apiUri,
      method: "signAndSendTransaction",
      args: {
        receiverId: contractId,
        actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const status = result.data?.status;
    expect(status?.SuccessValue).toBeTruthy();
    expect(status?.failure).toBeFalsy();
    const txOutcome = result.data?.transaction_outcome;
    expect(txOutcome?.id).toBeTruthy();
    expect(txOutcome?.outcome.status.SuccessReceiptId).toBeTruthy();
    expect(txOutcome?.outcome.status.failure).toBeFalsy();
    const receiptsOutcome = result.data?.receipts_outcome;
    expect(receiptsOutcome?.length).toBeGreaterThan(0);
  });

  test("Should create, sign, and send a transaction asynchronously without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.invoke<string>({
      uri: apiUri,
      method: "signAndSendTransactionAsync",
      args: {
        receiverId: contractId,
        actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const txHash = result.data;
    expect(txHash).toBeTruthy();
  });
});
