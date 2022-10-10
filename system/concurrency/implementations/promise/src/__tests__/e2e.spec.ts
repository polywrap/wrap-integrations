import { PolywrapClient } from "@polywrap/client-js";
import { buildWrapper } from "@polywrap/test-env-js";
import { concurrentPromisePlugin } from "../index";

jest.setTimeout(300000);

describe("e2e", () => {
  let client: PolywrapClient;
  let fsUri: string;

  beforeAll(async () => {
    client = new PolywrapClient({
      plugins: [
        {
          uri: "wrap://ens/interface.concurrent.polywrap.eth",
          plugin: concurrentPromisePlugin({}),
        },
      ],
    });
    await buildWrapper(`${__dirname}/integration`)
    fsUri = `fs/${__dirname}/integration/build`;
  });

  test("asyncBatchFetch", async () => {
    const result = await client.invoke({
      uri: fsUri,
      method: "asyncBatchFetch",
      args: { delays: ["1", "2", "3"] },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toHaveLength(3);
  });

  test("batchFetch", async () => {
    const result = await client.invoke({
      uri: fsUri,
      method: "batchFetch",
      args: { delays: ["1", "2", "3"] },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toHaveLength(3);
  });
});
