import { NearPluginConfig } from "../../../../plugin-js"; //TODO change to appropriate package
import * as testUtils from "../testUtils";

import { PolywrapClient } from "@polywrap/client-js";
import { BigInt } from "@polywrap/wasm-as";
import * as nearApi from "near-api-js";
import {
  initTestEnvironment,
  stopTestEnvironment,
  providers,
  ensAddresses,
} from "@polywrap/test-env-js";

jest.setTimeout(360000);

describe("Amount format", () => {
  let client: PolywrapClient;
  let apiUri: string;
  let nearConfig: NearPluginConfig;

  beforeAll(async () => {
    // set up test env and deploy api
    await initTestEnvironment();

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

  test.each(testUtils.valuesToFormat)("Should format near amount", async (amount) => {
    const result = await client.invoke<string>({
      uri: apiUri,
      method: "formatNearAmount",
      args: {
        amount,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    expect(result.data).toBeTruthy();
    expect(result.data).toEqual(
      nearApi.utils.format.formatNearAmount(amount, 24)
    );
  });

  test.each(testUtils.valuesToParse)("Should parse near amount", async (amount) => {
    const result = await client.invoke<BigInt>({
      uri: apiUri,
      method: "parseNearAmount",
      args: {
        amount,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const parsed = result.data;
    expect(parsed?.toString()).toBeTruthy();

    const nearParsed = nearApi.utils.format.parseNearAmount(amount);
    expect(parsed).toEqual(nearParsed);
  });
});
