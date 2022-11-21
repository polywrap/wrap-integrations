import * as testUtils from "../testUtils";
import { Interface_FinalExecutionOutcome as Near_FinalExecutionOutcome } from "../../wrap";
import { KeyPair, NearPluginConfig } from "../../../../plugin-js"; //TODO change to appropriate package

import { PolywrapClient } from "@polywrap/client-js";
import * as nearApi from "near-api-js";
import {
  ensAddresses,
  initTestEnvironment,
  providers,
  stopTestEnvironment,
} from "@polywrap/test-env-js";
import { BN } from "bn.js";
import * as fs from "fs";

import "localstorage-polyfill";

const MockBrowser = require("mock-browser").mocks.MockBrowser;
const mock = new MockBrowser();

global["document"] = mock.getDocument();
global["window"] = mock.getWindow();
global["localStorage"] = localStorage;

jest.setTimeout(360000);
jest.retryTimes(3);

describe("Write operations", () => {
  let client: PolywrapClient;
  let apiUri: string;
  let near: nearApi.Near;
  let nearConfig: NearPluginConfig;
  let contractId: string;
  let workingAccount: nearApi.Account;
  let masterAccount: nearApi.Account;

  beforeAll(async () => {
    // set up test env and deploy api
    await initTestEnvironment();
    nearConfig = await testUtils.setUpTestConfig();
    near = await nearApi.connect(nearConfig);
    // set up client
    const absPath = __dirname + "/../../../build";
    apiUri = `fs/${absPath}`;
    const polywrapConfig = testUtils.getPlugins(
      providers.ethereum,
      ensAddresses.ensAddress,
      providers.ipfs,
      nearConfig
    );
    client = new PolywrapClient(polywrapConfig);

    contractId = testUtils.generateUniqueString("test");
    workingAccount = await testUtils.createAccount(near);
    await testUtils.deployContract(workingAccount, contractId);

    masterAccount = await near.account(testUtils.testAccountId);
  });

  afterAll(async () => {
    await stopTestEnvironment();
    try {
      await workingAccount.deleteAccount(testUtils.testAccountId);
    } catch (e) {
      console.log(e);
    }
  });

  test("Should create account", async () => {
    const newAccountId = testUtils.generateUniqueString("test");

    const accountToCreate = await near.account(newAccountId);

    expect(accountToCreate.state()).rejects.toThrow();

    const { amount } = await workingAccount.state();
    const newAmount = new BN(amount).div(new BN(10)).toString();

    const newPublicKey = await near.connection.signer.createKey(
      newAccountId,
      testUtils.networkId
    );

    const result = await client.invoke<Near_FinalExecutionOutcome>({
      uri: apiUri,
      method: "createAccount",
      args: {
        newAccountId: newAccountId,
        publicKey: newPublicKey,
        amount: newAmount,
        signerId: testUtils.testAccountId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const creationResult = result.data as Near_FinalExecutionOutcome;

    expect(creationResult).toBeTruthy();
    expect(creationResult.status.failure).toBeFalsy();
    expect(creationResult.status.SuccessValue).toBeDefined();

    const accountCreated = await near.account(newAccountId);

    expect(accountCreated.state()).resolves;

    await accountCreated.deleteAccount(testUtils.testAccountId);
  });

  test("Should delete account", async () => {
    const accountToDelete = await testUtils.createAccount(near);

    expect(accountToDelete.state()).resolves;

    const result = await client.invoke<Near_FinalExecutionOutcome>({
      uri: apiUri,
      method: "deleteAccount",
      args: {
        accountId: accountToDelete.accountId,
        beneficiaryId: testUtils.testAccountId,
        signerId: accountToDelete.accountId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const deletionResult = result.data as Near_FinalExecutionOutcome;

    expect(deletionResult).toBeTruthy();
    expect(deletionResult.status.failure).toBeFalsy();
    expect(deletionResult.status.SuccessValue).toBeDefined();
    await expect(async () => await accountToDelete.state()).rejects.toThrow();
  });

  test("Should add key", async () => {
    const newPublicKey = nearApi.utils.KeyPair.fromRandom(
      "ed25519"
    ).getPublicKey();

    const { amount } = await workingAccount.state();
    const newAmount = new BN(amount).div(new BN(10)).toString();

    const detailsBefore = await workingAccount.getAccountDetails();

    const result = await client.invoke<Near_FinalExecutionOutcome>({
      uri: apiUri,
      method: "addKey",
      args: {
        publicKey: newPublicKey,
        contractId: contractId,
        methodNames: [],
        amount: newAmount,
        signerId: workingAccount.accountId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const addKeyResult = result.data as Near_FinalExecutionOutcome;

    expect(addKeyResult).toBeTruthy();
    expect(addKeyResult.status.failure).toBeFalsy();
    expect(addKeyResult.status.SuccessValue).toBeDefined();

    const detailsAfter = await workingAccount.getAccountDetails();

    expect(detailsAfter.authorizedApps.length).toBeGreaterThan(
      detailsBefore.authorizedApps.length
    );
    expect(detailsAfter.authorizedApps).toEqual(
      expect.arrayContaining([
        {
          contractId: contractId,
          amount: newAmount,
          publicKey: newPublicKey.toString(),
        },
      ])
    );
  });

  test("Should delete key", async () => {
    const newPublicKey = nearApi.utils.KeyPair.fromRandom(
      "ed25519"
    ).getPublicKey();

    const detailsBefore = await workingAccount.getAccountDetails();

    await workingAccount.addKey(newPublicKey, contractId, "", new BN(400000));

    const detailsAfterAddKey = await workingAccount.getAccountDetails();

    expect(detailsAfterAddKey.authorizedApps.length).toBeGreaterThan(
      detailsBefore.authorizedApps.length
    );

    const result = await client.invoke<Near_FinalExecutionOutcome>({
      uri: apiUri,
      method: "deleteKey",
      args: {
        publicKey: newPublicKey,
        signerId: workingAccount.accountId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const deleteKeyResult = result.data as Near_FinalExecutionOutcome;

    expect(deleteKeyResult).toBeTruthy();
    expect(deleteKeyResult.status.failure).toBeFalsy();
    expect(deleteKeyResult.status.SuccessValue).toBeDefined();

    const detailsAfterDeleteKey = await workingAccount.getAccountDetails();

    expect(detailsBefore.authorizedApps.length).toEqual(
      detailsAfterDeleteKey.authorizedApps.length
    );
  });

  test("Should send money", async () => {
    const receiver = masterAccount;
    const receiverBalanceBefore = await receiver.getAccountBalance();

    const { amount } = await workingAccount.state();
    const newAmount = new BN(amount).div(new BN(10)).toString();

    const result = await client.invoke<Near_FinalExecutionOutcome>({
      uri: apiUri,
      method: "sendMoney",
      args: {
        amount: newAmount,
        receiverId: receiver.accountId,
        signerId: workingAccount.accountId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const sendMoneyResult = result.data as Near_FinalExecutionOutcome;

    expect(sendMoneyResult).toBeTruthy();
    expect(sendMoneyResult.status.failure).toBeFalsy();
    expect(sendMoneyResult.status.SuccessValue).toBeDefined();

    const receiverBalanceAfter = await receiver.getAccountBalance();

    expect(
      new BN(receiverBalanceAfter.total).gt(new BN(receiverBalanceBefore.total))
    ).toEqual(true);

    expect(
      new BN(receiverBalanceAfter.total).sub(new BN(newAmount)).toString()
    ).toEqual(receiverBalanceBefore.total);
  });

  test("Should create and deploy contract", async () => {
    const newContractId = testUtils.generateUniqueString("test_contract");

    const data = fs.readFileSync(testUtils.HELLO_WASM_PATH);

    const { amount } = await masterAccount.state();
    const newAmount = new BN(amount).div(new BN(10)).toString();

    const signerPublicKey = await masterAccount.connection.signer.getPublicKey(
      masterAccount.accountId,
      testUtils.networkId
    );

    const result = await client.invoke<Near_FinalExecutionOutcome>({
      uri: apiUri,
      method: "createAndDeployContract",
      args: {
        contractId: newContractId,
        data: data,
        amount: newAmount,
        publicKey: signerPublicKey,
        signerId: masterAccount.accountId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const createAndDeployContractResult = result.data as Near_FinalExecutionOutcome;

    expect(createAndDeployContractResult).toBeTruthy();
    expect(createAndDeployContractResult.status.failure).toBeFalsy();
    expect(createAndDeployContractResult.status.SuccessValue).toBeDefined();
  });

  test("Should deploy contract", async () => {
    const newContractId = testUtils.generateUniqueString("test_contract");

    const data = fs.readFileSync(testUtils.HELLO_WASM_PATH);

    const keyPair = KeyPair.fromRandom("ed25519");
    const newPublicKey = keyPair.getPublicKey();

    const { amount } = await masterAccount.state();
    const newAmount = new BN(amount).div(new BN(100));

    await masterAccount.createAccount(newContractId, newPublicKey, newAmount);

    const result = await client.invoke<Near_FinalExecutionOutcome>({
      uri: apiUri,
      method: "deployContract",
      args: {
        data: data,
        contractId: masterAccount.accountId,
        signerId: masterAccount.accountId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const deployContractResult = result.data as Near_FinalExecutionOutcome;

    expect(deployContractResult).toBeTruthy();
    expect(deployContractResult.status.failure).toBeFalsy();
    expect(deployContractResult.status.SuccessValue).toBeDefined();
  });

  test("Should executing FunctionCall with json stringified args", async () => {
    const jsonArgs = JSON.stringify({ name: "trex" });

    const result = await client.invoke<Near_FinalExecutionOutcome>({
      uri: apiUri,
      method: "functionCall",
      args: {
        contractId: contractId,
        methodName: "hello",
        args: jsonArgs,
        gas: new BN("20000000000000").toString(),
        deposit: new BN("20000000000000").toString(),
        signerId: workingAccount.accountId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const functionResult = result.data as Near_FinalExecutionOutcome;

    expect(functionResult).toBeTruthy();
    expect(functionResult.status.failure).toBeFalsy();
    expect(functionResult.status.SuccessValue).toBeDefined();
  });
});
