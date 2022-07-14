import { NearPluginConfig } from "../../../../plugin-js"; //TODO change to appropriate package
import {
  BlockReference,
  AccountView,
  PublicKey,
  AccessKeyInfo,
} from "./../tsTypes";
import * as testUtils from "./../testUtils";
import { ContractStateResult, ViewContractCode } from "../../wrap";

import { PolywrapClient } from "@polywrap/client-js";
import * as nearApi from "near-api-js";
import {
  ensAddresses,
  initTestEnvironment,
  providers,
  stopTestEnvironment,
} from "@polywrap/test-env-js";
import { AccountAuthorizedApp, AccountBalance } from "near-api-js/lib/account";

jest.setTimeout(360000);
jest.retryTimes(3);

describe("e2e", () => {
  let client: PolywrapClient;
  let apiUri: string;

  let nearConfig: NearPluginConfig;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  let contractId: string;

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

  test("Should get block information", async () => {
    const blockQuery: BlockReference = { finality: "final" };
    const result = await client.invoke({
      uri: apiUri,
      method: "getBlock",
      args: {
        blockQuery,
      },
    });
    // const result = await client.query<{ getBlock: BlockResult }>({
    //   uri: apiUri,
    //   query: `query {
    //     getBlock(
    //       blockQuery: $blockQuery
    //     )
    //   }`,
    //   variables: {
    //     blockQuery: blockQuery,
    //   },
    // });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    // const block: BlockResult = result.data!.getBlock;
    // expect(block.author).toBeTruthy();
    // expect(block.header).toBeTruthy();
    // expect(block.chunks.length).toBeGreaterThan(0);
    // expect(block.chunks[0]).toBeTruthy();
    //
    // const nearBlock = await (near.connection
    //   .provider as nearApi.providers.JsonRpcProvider).block({
    //   blockId: Number.parseInt(block.header.height),
    // });
    // expect(block.author).toStrictEqual(nearBlock.author);
    // expect(block.header.hash).toStrictEqual(nearBlock.header.hash);
    // expect(block.header.signature).toStrictEqual(nearBlock.header.signature);
    // expect(block.chunks[0].chunk_hash).toStrictEqual(
    //   nearBlock.chunks[0].chunk_hash
    // );
  });

  test("Should get account state", async () => {
    const result = await client.query<{ getAccountState: AccountView }>({
      uri: apiUri,
      query: `query {
        getAccountState(
          accountId: $accountId
        )
      }`,
      variables: {
        accountId: workingAccount.accountId,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const state: AccountView = result.data!.getAccountState;
    expect(state).toBeTruthy();

    const nearState = await workingAccount.state();

    expect(state.amount).toStrictEqual(nearState.amount);
    expect(state.locked).toStrictEqual(nearState.locked);
    expect(state.codeHash).toStrictEqual(nearState.code_hash);
    expect(state.storagePaidAt).toStrictEqual(
      nearState.storage_paid_at.toString()
    );
    expect(state.storageUsage).toStrictEqual(
      nearState.storage_usage.toString()
    );
  });

  test("Should get contract state", async () => {
    const blockQuery = {
      block_id: null,
      finality: "final",
      syncCheckpoint: null,
    };
    const result = await client.query<{
      viewContractState: ContractStateResult;
    }>({
      uri: apiUri,
      query: `query {
        viewContractState(
          prefix: $prefix
          blockQuery: $blockQuery,
          accountId: $accountId
        )
      }`,
      variables: {
        prefix: "",
        blockQuery: blockQuery,
        accountId: workingAccount.accountId,
      },
    });
    const state: ContractStateResult = result.data!.viewContractState;
    const resultState = await workingAccount.viewState("final");
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(state).toBeTruthy();
    expect(result.data).toEqual({ viewContractState: { values: [] } });
    expect(result.errors).toEqual(undefined);
    expect(resultState).toBeTruthy();
    expect(resultState).toEqual([]);
  });

  test("Should get contract code", async () => {
    const result = await client.query<{ viewContractCode: ViewContractCode }>({
      uri: apiUri,
      query: `query {
        viewContractCode(
          accountId: $accountId
        )
      }`,
      variables: {
        accountId: contractId,
      },
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const response = await near.connection.provider.query({
      account_id: contractId,
      finality: "optimistic",
      request_type: "view_code",
    });

    expect(response).toBeTruthy();
    //@ts-ignore
    expect(response?.code_base64).toStrictEqual(
      result.data?.viewContractCode.code_base64
    );
  });

  test("Should get account balance", async () => {
    const result = await client.query<{ getAccountBalance: AccountBalance }>({
      uri: apiUri,
      query: `query {
        getAccountBalance(
          accountId: $accountId
        )
      }`,
      variables: {
        accountId: workingAccount.accountId,
      },
    });

    const resultBalance: AccountBalance = result.data!.getAccountBalance;
    const actualBalance = await workingAccount.getAccountBalance();
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(resultBalance).toBeTruthy();
    expect(resultBalance.available).toStrictEqual(actualBalance.available);
    expect(resultBalance.staked).toStrictEqual(actualBalance.staked);
    expect(resultBalance.stateStaked).toStrictEqual(actualBalance.stateStaked);
    expect(resultBalance.total).toStrictEqual(actualBalance.total);
  });

  test("Should get account details", async () => {
    const result = await client.query<{
      getAccountDetails: AccountAuthorizedApp[];
    }>({
      uri: apiUri,
      query: `query {
        getAccountDetails(
          accountId: $accountId
        )
      }`,
      variables: {
        accountId: workingAccount.accountId,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const authorizedApps: AccountAuthorizedApp[] = result.data!
      .getAccountDetails;
    expect(authorizedApps).toBeTruthy();
    expect(authorizedApps).toBeInstanceOf(Array);

    const {
      authorizedApps: nearAuthorizedApps,
    } = await workingAccount.getAccountDetails();

    expect(authorizedApps.length).toEqual(nearAuthorizedApps.length);
    expect(authorizedApps).toEqual(nearAuthorizedApps);
  });

  test("Should get access keys", async () => {
    const result = await client.invoke<AccessKeyInfo[]>({
      uri: apiUri,
      method: "getAccessKeys",
      args: {
        accountId: workingAccount.accountId,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const accessKeys = result.data as AccessKeyInfo[];
    expect(accessKeys).toBeTruthy();
    expect(accessKeys).toBeInstanceOf(Array);

    const nearAccessKeys = await workingAccount.getAccessKeys();

    expect(accessKeys.length).toEqual(nearAccessKeys.length);
  });

  test("Should get public key", async () => {
    const result = await client.invoke<PublicKey>({
      uri: apiUri,
      method: "getPublicKey",
      args: {
        accountId: workingAccount.accountId,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const publicKey = result.data as PublicKey;

    expect(publicKey).toBeTruthy();

    const nearKey = await near.connection.signer.getPublicKey(
      workingAccount.accountId,
      testUtils.networkId
    );
    expect(publicKey.data).toStrictEqual(nearKey.data);

    const publicKeyStr: string = testUtils.publicKeyToStr(publicKey);
    const nearKeyStr = nearApi.utils.PublicKey.from(nearKey).toString();
    expect(publicKeyStr).toStrictEqual(nearKeyStr);
  });

  test("Should find access key", async () => {
    const result = await client.invoke<AccessKeyInfo>({
      uri: apiUri,
      method: "findAccessKey",
      args: {
        accountId: workingAccount.accountId,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const accessKeyInfo = result.data as AccessKeyInfo;

    expect(accessKeyInfo.publicKey).toBeTruthy();
    expect(accessKeyInfo.accessKey).toBeTruthy();

    //const apiKey: AccessKey = accessKeyInfo.accessKey;

    const nearAccessKey = await workingAccount.findAccessKey(
      workingAccount.accountId,
      []
    );

    expect(accessKeyInfo.publicKey).toEqual(nearAccessKey.publicKey.toString());

    expect(accessKeyInfo.publicKey).toStrictEqual(
      nearAccessKey.publicKey.toString()
    );
  });

  test("Should view function via account", async () => {
    const methodName = "hello"; // this is the function defined in hello.wasm file that we are calling
    const args = { name: "world" };

    const result = await client.invoke({
      uri: apiUri,
      method: "viewFunction",
      args: {
        contractId,
        methodName,
        args: JSON.stringify(args),
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const viewFunctionResult = result.data;

    expect(viewFunctionResult).toBeTruthy();
    const fnResult = JSON.parse(viewFunctionResult as any).result;
    expect(fnResult).toBeTruthy();

    const parsedResult = new TextDecoder()
      .decode(Uint8Array.from(fnResult).buffer)
      .replace(/\"/g, "");

    const nearViewFunctionResult = await workingAccount.viewFunction(
      contractId,
      methodName,
      args
    );

    expect(parsedResult).toEqual(nearViewFunctionResult);
  });
});
