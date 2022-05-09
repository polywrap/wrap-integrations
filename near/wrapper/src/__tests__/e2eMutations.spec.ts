import * as testUtils from "./testUtils";
import { Near_FinalExecutionOutcome } from "../w3";

import { Web3ApiClient } from "@web3api/client-js";
import { NearPluginConfig } from "../../../plugin-js"; //TODO change to appropriate package
import * as nearApi from "near-api-js";
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import path from "path";

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
    //const newAccountPublicKey = testUtils.publicKeyFromStr("9AhWenZ3JddamBoyMqnTbp7yVbRuvqAv3zwfrWgfVRJE");
    const newPublicKey = await near.connection.signer.createKey(newAccountId, near.connection.networkId);

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
        amount: "100000000000000000000",
        signerId: testUtils.testAccountId,
      },
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();
  });

  it("Add key", async () => {
    const keyPair = nearApi.utils.KeyPair.fromRandom("ed25519");

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
        publicKey: keyPair.getPublicKey(),
        contractId: contractId,
        methodNames: [],
        amount: "1000000000",
        signerId: workingAccount.accountId,
      },
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const addKeyResult = result.data!.addKey;

    expect(addKeyResult.status.SuccessValue).toBeTruthy();

    //expect(details.authorizedApps).toEqual(jasmine.arrayContaining(expectedResult.authorizedApps));
  });
});
