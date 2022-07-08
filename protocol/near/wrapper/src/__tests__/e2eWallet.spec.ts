/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  Args_requestSignIn,
  Args_signOut,
  Args_isSignedIn,
  Args_getAccountId,
} from "../wrap";
import * as testUtils from "./testUtils";
import "localstorage-polyfill";
import {
  ensAddresses,
  initTestEnvironment,
  providers,
} from "@polywrap/test-env-js";
import { PolywrapClient } from "@polywrap/client-js";
import * as nearApi from "near-api-js";
import { NearPluginConfig } from "../../../plugin-js/build";

const MockBrowser = require("mock-browser").mocks.MockBrowser;

jest.setTimeout(360000);
jest.retryTimes(3);

describe("e2e", () => {
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

    const absPath = __dirname + "/../../build";
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
    await workingAccount.deleteAccount(testUtils.testAccountId);
  });

  // requestSignIn +
  it("Request sign in", async () => {
    const result = await client.query<{
      requestSignIn: Args_requestSignIn;
    }>({
      uri: apiUri,
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
    expect(result.data).toBeTruthy();

    const requestSignInSuccess = result.data?.requestSignIn;

    expect(requestSignInSuccess).toBeTruthy();
  });

  // signOut +
  it("Sign out", async () => {
    const result = await client.query<{
      signOut: Args_signOut;
    }>({
      uri: apiUri,
      query: `query {
              signOut
          }`,
      variables: {},
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const signOutSuccess = result.data?.signOut;

    expect(signOutSuccess).toBeTruthy();
  });

  // isSignedIn +
  it("Is signed in", async () => {
    const result = await client.query<{
      isSignedIn: Args_isSignedIn;
    }>({
      uri: apiUri,
      query: `query {
        isSignedIn
      }`,
      variables: {},
    });
    expect(result.errors).toBeFalsy();
    expect(result).toBeTruthy();
  });

  // getAccountId +
  it("Get account id", async () => {
    const result = await client.query<{
      getAccountId: Args_getAccountId;
    }>({
      uri: apiUri,
      query: `query {
        getAccountId
          }`,
      variables: {},
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const getAccountIdSuccess = result.data?.getAccountId;

    expect(getAccountIdSuccess).toBeDefined();
  });
});
