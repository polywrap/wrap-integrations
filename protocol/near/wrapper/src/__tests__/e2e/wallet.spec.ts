/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  Args_requestSignIn,
  Args_signOut,
  Args_isSignedIn,
  Args_getAccountId,
} from "../../wrap/imported/Near_Module/serialization";
import * as testUtils from "../testUtils";
import { NearPluginConfig } from "../../../../plugin-js/build";

import "localstorage-polyfill";
import {
  ensAddresses,
  initTestEnvironment,
  providers,
  stopTestEnvironment,
} from "@polywrap/test-env-js";
import { PolywrapClient } from "@polywrap/client-js";
import * as nearApi from "near-api-js";

const MockBrowser = require("mock-browser").mocks.MockBrowser;

jest.setTimeout(360000);
jest.retryTimes(3);

describe("Wallet", () => {
  let apiUri: string;
  let client: PolywrapClient;
  let nearConfig: NearPluginConfig;
  let contractId: string;
  let workingAccount: nearApi.Account;
  let near: nearApi.Near;

  const mock = new MockBrowser();

  beforeAll(async () => {
    global["document"] = mock.getDocument();
    global["window"] = mock.getWindow();
    global["localStorage"] = localStorage;

    // set up test env and deploy api
    await initTestEnvironment();

    const absPath = __dirname + "/../../../build";
    apiUri = `fs/${absPath}`;
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

  test("Should request sign in", async () => {
    const result = await client.invoke<Args_requestSignIn>({
      uri: apiUri,
      method: "requestSignIn",
      args: {
        contractId,
        methodNames: ["hello"],
        successUrl: "http://example.com/success",
        failureUrl: "http://example.com/fail",
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const requestSignInSuccess = result.data;

    expect(requestSignInSuccess).toBeTruthy();
  });

  test("Should sign out", async () => {
    const result = await client.invoke<Args_signOut>({
      uri: apiUri,
      method: "signOut",
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const signOutSuccess = result.data;

    expect(signOutSuccess).toBeTruthy();
  });

  test("Should be signed in", async () => {
    const result = await client.invoke<Args_isSignedIn>({
      uri: apiUri,
      method: "isSignedIn",
    });
    expect(result.error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  test("Should get account id", async () => {
    const result = await client.invoke<Args_getAccountId>({
      uri: apiUri,
      method: "getAccountId",
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeDefined();
  });
});
