import { NearPluginConfig } from "../../../plugin-js"; //TODO change to appropriate package
import * as testUtils from "./testUtils";

import { PolywrapClient } from "@polywrap/client-js";
import { BigInt } from "@polywrap/wasm-as";
import * as nearApi from "near-api-js";
import { buildAndDeployWrapper, initTestEnvironment, stopTestEnvironment, providers } from "@polywrap/test-env-js";
import path from "path";

jest.setTimeout(360000);

describe("e2e", () => {
  let client: PolywrapClient;
  let apiUri: string;
  let nearConfig: NearPluginConfig;

  beforeAll(async () => {
    // set up test env and deploy api
    await initTestEnvironment();
    const apiPath: string = path.resolve(__dirname + "/../../");
    const api = await buildAndDeployWrapper({
      wrapperAbsPath: apiPath,
      ipfsProvider: providers.ipfs,
      ethereumProvider: providers.ethereum
    });

    // set up client
    apiUri = `ens/testnet/${api.ensDomain}`;
    const polywrapConfig = testUtils.getPlugins(ethereum, ensAddress, ipfs, nearConfig);
    client = new PolywrapClient(polywrapConfig);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it.each(testUtils.valuesToFormat)("Format Near amount", async (amount) => {
    const result = await client.query<{ formatNearAmount: string }>({
      uri: apiUri,
      query: `query {
          formatNearAmount(
          amount: $amount
        )
      }`,
      variables: {
        amount: amount,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const formatted: string = result.data!.formatNearAmount;
    expect(formatted).toBeTruthy();

    expect(formatted).toEqual(nearApi.utils.format.formatNearAmount(amount, 24));
  });

  it.each(testUtils.valuesToParse)("Parse near amount", async (amount) => {
    const result = await client.query<{ parseNearAmount: BigInt }>({
      uri: apiUri,
      query: `query {
        parseNearAmount(
          amount: $amount
        )
      }`,
      variables: {
        amount: amount,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const parsed: string = result.data!.parseNearAmount.toString();
    expect(parsed).toBeTruthy();

    const nearParsed = nearApi.utils.format.parseNearAmount(amount);
    expect(parsed).toEqual(nearParsed);
  });
});
