import * as testUtils from "./testUtils";
import { Near_FinalExecutionOutcome } from "../w3";

import { Web3ApiClient } from "@web3api/client-js";
import { KeyPair, NearPluginConfig } from "../../../plugin-js"; //TODO change to appropriate package
import * as nearApi from "near-api-js";
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import path from "path";
import { BN } from "bn.js";

jest.setTimeout(360000);

describe("e2e", () => {
  let client: Web3ApiClient;
  let apiUri: string;
  let near: nearApi.Near;
  let nearConfig: NearPluginConfig;
  let contractId: string;
  let workingAccount: nearApi.Account;

  beforeAll(async () => {
    // set up test env and deploy api
    const { ethereum, ensAddress, ipfs } = await initTestEnvironment();
    const apiPath: string = path.resolve(__dirname + "/../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);

    nearConfig = await testUtils.setUpTestConfig();
    near = await nearApi.connect(nearConfig);
    // set up client
    apiUri = `ens/testnet/${api.ensDomain}`;
    const polywrapConfig = testUtils.getPlugins(ethereum, ensAddress, ipfs, nearConfig);
    client = new Web3ApiClient(polywrapConfig);

    contractId = testUtils.generateUniqueString("test");
    workingAccount = await testUtils.createAccount(near);
    await testUtils.deployContract(workingAccount, contractId);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("Create account", async () => {
    const newAccountId = testUtils.generateUniqueString("test");
    const keyPair = KeyPair.fromRandom("ed25519");

    const accountToCreate = await near.account(newAccountId);

    expect(accountToCreate.state()).rejects.toThrow();

    const { amount } = await workingAccount.state();
    const newAmount = new BN(amount).div(new BN(10)).toString();

    const newPublicKey = keyPair.getPublicKey();

    const result = await client.query<{ createAccount: Near_FinalExecutionOutcome }>({
      uri: apiUri,
      query: `mutation {
        createAccount(
          newAccountId: $newAccountId
          publicKey: $publicKey
          amount: $amount
          signerId: $signerId
        )
      }`,
      variables: {
        newAccountId: newAccountId,
        publicKey: newPublicKey,
        amount: newAmount,
        signerId: testUtils.testAccountId,
      },
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const creationResult = result.data!.createAccount;

    expect(creationResult).toBeTruthy();
    expect(creationResult.status.failure).toBeFalsy();
    expect(creationResult.status.SuccessValue).toBeDefined();

    const accountCreated = await near.account(newAccountId);

    expect(accountCreated.state()).resolves;

    await accountCreated.deleteAccount(testUtils.testAccountId);
  });

  it("Delete account", async () => {
    const accountToDelete = await testUtils.createAccount(near);

    expect(accountToDelete.state()).resolves;

    const result = await client.query<{ deleteAccount: Near_FinalExecutionOutcome }>({
      uri: apiUri,
      query: `mutation {
        deleteAccount(
          accountId: $accountId
          beneficiaryId: $beneficiaryId
          signerId: $signerId
          )
        }`,
      variables: {
        accountId: accountToDelete.accountId,
        beneficiaryId: testUtils.testAccountId,
        signerId: accountToDelete.accountId,
      },
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const deletionResult = result.data!.deleteAccount;

    expect(deletionResult).toBeTruthy();
    expect(deletionResult.status.failure).toBeFalsy();
    expect(deletionResult.status.SuccessValue).toBeDefined();
    expect(accountToDelete.state()).rejects.toThrow();
  });

  it("Add key", async () => {
    const newPublicKey = nearApi.utils.KeyPair.fromRandom("ed25519").getPublicKey();

    const { amount } = await workingAccount.state();
    const newAmount = new BN(amount).div(new BN(10)).toString();

    const detailsBefore = await workingAccount.getAccountDetails();

    const result = await client.query<{ addKey: Near_FinalExecutionOutcome }>({
      uri: apiUri,
      query: `mutation {
        addKey(
          publicKey: $publicKey
          contractId: $contractId
          methodNames: $methodNames
          amount: $amount
          signerId: $signerId
          )
        }`,
      variables: {
        publicKey: newPublicKey,
        contractId: contractId,
        methodNames: [],
        amount: newAmount,
        signerId: workingAccount.accountId,
      },
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const addKeyResult = result.data!.addKey;

    expect(addKeyResult).toBeTruthy();
    expect(addKeyResult.status.failure).toBeFalsy();
    expect(addKeyResult.status.SuccessValue).toBeDefined();

    const detailsAfter = await workingAccount.getAccountDetails();

    expect(detailsAfter.authorizedApps.length).toBeGreaterThan(detailsBefore.authorizedApps.length);
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

  it("Delete key", async () => {
    const newPublicKey = nearApi.utils.KeyPair.fromRandom("ed25519").getPublicKey();

    const detailsBefore = await workingAccount.getAccountDetails();

    workingAccount.addKey(newPublicKey, contractId, "", new BN(400000));

    const detailsAfterAddKey = await workingAccount.getAccountDetails();

    expect(detailsAfterAddKey.authorizedApps.length).toBeGreaterThan(detailsBefore.authorizedApps.length);

    const result = await client.query<{ deleteKey: Near_FinalExecutionOutcome }>({
      uri: apiUri,
      query: `mutation {
        deleteKey(
          publicKey: $publicKey
          signerId: $signerId
          )
        }`,
      variables: {
        publicKey: newPublicKey,
        signerId: workingAccount.accountId,
      },
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const deleteKeyResult = result.data!.deleteKey;

    expect(deleteKeyResult).toBeTruthy();
    expect(deleteKeyResult.status.failure).toBeFalsy();
    expect(deleteKeyResult.status.SuccessValue).toBeDefined();

    const detailsAfterDeleteKey = await workingAccount.getAccountDetails();

    expect(detailsBefore.authorizedApps.length).toEqual(detailsAfterDeleteKey.authorizedApps.length);
  });
});
