import { PolywrapClient } from "@polywrap/client-js";
import {
  buildWrapper
} from "@polywrap/test-env-js";
import { getClientConfig } from "./utils";

jest.setTimeout(300000);

describe("e2e", () => {
  let client: PolywrapClient;
  let ensUri: string;

  beforeAll(async () => {
    await buildWrapper(`${__dirname}/integration`);
    const clientConfig = getClientConfig();
    client = new PolywrapClient(clientConfig);
    ensUri = `fs/${__dirname}/integration/build`;
  });

  test("asyncBatchFetch", async () => {
    const result = await client.invoke({
      uri: ensUri,
      method: "asyncBatchFetch",
      args: { delays: ["1", "2", "3"] },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toHaveLength(3);
  });

  test("batchFetch", async () => {
    const result = await client.invoke({
      uri: ensUri,
      method: "batchFetch",
      args: { delays: ["1", "2", "3"] },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toHaveLength(3);
  });
});
