import * as testUtils from "../testUtils";
import {
  /* KeyPair, */ KeyPair,
  NearPluginConfig,
} from "../../../../plugin-js/build"; //TODO change to appropriate package

import { PolywrapClient } from "@polywrap/client-js";
import {
  ensAddresses,
  initTestEnvironment,
  providers,
  stopTestEnvironment,
} from "@polywrap/test-env-js";

import "localstorage-polyfill";
import { FinalExecutionOutcome } from "../tsTypes";


jest.setTimeout(360000);

describe("Fetch operations", () => {
  let client: PolywrapClient;
  let apiUri: string;
  let nearConfig: NearPluginConfig;

  beforeAll(async () => {
    // set up test env and deploy api
    await initTestEnvironment();
    nearConfig = await testUtils.setUpTestConfig();

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
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  test("Should create master account", async () => {
    const newAccountId = testUtils.generateUniqueString("test");

    const publicKey = KeyPair.fromRandom("ed25519").getPublicKey();

    const result = await client.invoke<FinalExecutionOutcome>({
      uri: apiUri,
      method: "createMasterAccount",
      args: {
        newAccountId,
        publicKey,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const creationResult = result.data!;
    expect(creationResult).toBeTruthy();

    expect(creationResult.status).toBeTruthy();
    expect(creationResult.status.SuccessValue).toBeDefined();
    expect(creationResult.status.failure).toBeFalsy();
  });

  test("Should get stacking deposits", async () => {
    const result = await client.invoke<string>({
      uri: apiUri,
      method: "getStakingDeposits",
      args: {
        accountId: testUtils.testAccountId,
      },
    });

    expect(result).toBeTruthy();

    expect(result.data).toBeTruthy();
    expect(result.error).toBeFalsy();

    const data = JSON.parse(result.data!);

    expect(data).toBeInstanceOf(Array);
  });

  test("Should get NFTs contracts", async () => {
    const result = await client.invoke<string>({
      uri: apiUri,
      method: "listLikelyNftsContracts",
      args: {
        accountId: testUtils.testAccountId,
      },
    });

    expect(result).toBeTruthy();

    expect(result.data).toBeTruthy();
    expect(result.error).toBeFalsy();

    const data = JSON.parse(result.data!);

    expect(data.lastBlockTimestamp).toBeTruthy();
    expect(data.version).toBeTruthy();
    expect(data.list).toBeInstanceOf(Array);
  });

  test("Should get Fungible Tokens contracts", async () => {
    const result = await client.invoke<string>({
      uri: apiUri,
      method: "likelyTokensFromBlock",
      args: {
        accountId: testUtils.testAccountId,
      },
    });

    expect(result).toBeTruthy();

    expect(result.data).toBeTruthy();
    expect(result.error).toBeFalsy();

    const data = JSON.parse(result.data!);

    expect(data.lastBlockTimestamp).toBeTruthy();
    expect(data.version).toBeTruthy();
    expect(data.list).toBeInstanceOf(Array);
  });

  test("Should get accounts bound to stringified Public Key", async () => {
    const ledgerPK = "ed25519:FTYCHJXSu68f3thsKtjuuFkjePw4XbfdZyP763uBNdx5";
    const ledgerAccountId =
      "d6cffd5f97babaf6226e944fb0dde03bda6b2bc3d91e665b724dbf6ea10754f2";
    const result = await client.invoke<string>({
      uri: apiUri,
      method: "accountsAtPublicKey",
      args: {
        publicKeyString: ledgerPK,
      },
    });

    expect(result).toBeTruthy();

    expect(result.data).toBeTruthy();
    expect(result.error).toBeFalsy();

    const data = JSON.parse(result.data!);

    expect(data).toContain(ledgerAccountId);
  });

  test("Should get near to usd ratio", async () => {
    const result = await client.invoke<{
      usd: string;
      last_updated_at: string;
    }>({
      uri: apiUri,
      method: "nearToUsdRatio",
    });

    expect(result).toBeTruthy();

    expect(result.data).toBeTruthy();
    expect(result.error).toBeFalsy();

    const data = result.data;
    expect(data?.usd).toBeTruthy();
    expect(data?.last_updated_at).toBeTruthy();
  });
});
