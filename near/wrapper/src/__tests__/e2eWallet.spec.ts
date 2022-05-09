/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/naming-convention */
import { Input_requestSignIn, Input_signOut, Input_isSignedIn, Input_getAccountId } from "../query/w3";
import * as testUtils from "./testUtils";

const BN = require("bn.js");

import "localstorage-polyfill";
import { buildAndDeployApi, initTestEnvironment } from "@web3api/test-env-js";
import { Web3ApiClient } from "@web3api/client-js";
import * as nearApi from "near-api-js";
import { nearPlugin, NearPluginConfig } from "../../../plugin-js/build";
import path from "path";

const MockBrowser = require("mock-browser").mocks.MockBrowser;
const uri = "w3://ens/near.web3api.eth";

jest.setTimeout(360000);

describe("e2e", () => {
  let ensUri: string;
  let client: Web3ApiClient;
  let nearConfig: NearPluginConfig;
  let contractId: string;
  let workingAccount: nearApi.Account;
  let near: nearApi.Near;

  const mock = new MockBrowser();

  global["document"] = mock.getDocument();
  global["window"] = mock.getWindow();
  global["localStorage"] = localStorage;

  beforeAll(async () => {
    nearConfig = await testUtils.setUpTestConfig();
    near = await nearApi.connect(nearConfig);
    client = new Web3ApiClient({
      plugins: [
        {
          uri: uri,
          plugin: nearPlugin(nearConfig),
        },
      ],
    });
  });

  beforeEach(async () => {
    const { ensAddress: ensRegistryAddress, ipfs, ethereum, ensAddress } = await initTestEnvironment();
    const apiPath: string = path.resolve(__dirname + "/../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensRegistryAddress);
    ensUri = `ens/testnet/${api.ensDomain}`;
    nearConfig = await testUtils.setUpTestConfig();
    contractId = testUtils.generateUniqueString("test");
    workingAccount = await testUtils.createAccount(near);

    const keyPair = await nearApi.KeyPair.fromRandom("ed25519");
    await workingAccount.addKey(
      keyPair.getPublicKey(),
      contractId,
      testUtils.HELLO_WASM_METHODS.changeMethods,
      new BN("2000000000000000000000000")
    );
    await nearConfig.keyStore!.setKey(testUtils.networkId, workingAccount.accountId, keyPair);
    await testUtils.deployContract(workingAccount, contractId);
    const polywrapConfig = await testUtils.getPlugins(ethereum, ensAddress, ipfs, nearConfig);
    workingAccount = await testUtils.createAccount(near);
    client = await new Web3ApiClient(polywrapConfig);
  });

  it("Request sign in", async () => {
    const result = await client.query<{
      requestSignIn: Input_requestSignIn;
    }>({
      uri: ensUri,
      query: `query {
              requestSignIn(
                contractId: $contractId,
                methodNames: $methodNames,
                successUrl: $successUrl,
                failureUrl: $failureUrl,
            )
          }`,
      variables: {
        contractId: contractId,
        methodNames: ["hello"],
        successUrl: "http://example.com/success",
        failureUrl: "http://example.com/fail",
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toEqual({ requestSignIn: true });
    expect(result.errors).toEqual(undefined);
    expect(result).toBeTruthy();
  });

  it("Sign out", async () => {
    const result = await client.query<{
      signOut: Input_signOut;
    }>({
      uri: ensUri,
      query: `query {
              signOut
          }`,
      variables: {},
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toEqual({ signOut: true });
    expect(result.errors).toEqual(undefined);
    expect(result).toBeTruthy();
  });

  it("Is signed in", async () => {
    const result = await client.query<{
      isSignedIn: Input_isSignedIn;
    }>({
      uri: ensUri,
      query: `query {
        isSignedIn
          }`,
      variables: {},
    });
    expect(result.errors).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it("Get account id", async () => {
    const result = await client.query<{
      getAccountId: Input_getAccountId;
    }>({
      uri: ensUri,
      query: `query {
        getAccountId
          }`,
      variables: {},
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toEqual({ getAccountId: "" });
    expect(result.errors).toEqual(undefined);
    expect(result).toBeTruthy();
  });
});
