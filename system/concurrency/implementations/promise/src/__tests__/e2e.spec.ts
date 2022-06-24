import { PolywrapClient } from "@polywrap/client-js";
import {
  initTestEnvironment,
  runCLI,
  stopTestEnvironment,
} from "@polywrap/test-env-js";
import { getPlugins } from "./utils";
import fs from "fs";

jest.setTimeout(300000);

describe("e2e", () => {
  let client: PolywrapClient;
  let ensUri: string;

  const POLYWRAP_CLI = `${__dirname}/../../node_modules/polywrap/bin/polywrap`;

  beforeAll(async () => {
    await initTestEnvironment(POLYWRAP_CLI);
    // get client
    await runCLI({
      args: ["build"],
      cwd: `${__dirname}/integration`,
      cli: POLYWRAP_CLI,
    });
    const clientConfig = getPlugins();
    client = new PolywrapClient({ ...clientConfig, tracingEnabled: true });
    ensUri = `fs/${__dirname}/integration/build`;
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  test("asyncBatchFetch", async () => {
    const result = await client.invoke({
      uri: ensUri,
      method: "asyncBatchFetch",
      input: {},
    });

    fs.writeFileSync("hello.json", JSON.stringify(result, null, 2));
  });

  // test("checkFetch", async () => {
  //   const result = await client.invoke({
  //     uri: "w3://ens/http.web3api.eth",
  //     module: "query",
  //     method: "get",
  //     input: Uint8Array.from([
  //       130,
  //       163,
  //       117,
  //       114,
  //       108,
  //       217,
  //       42,
  //       104,
  //       116,
  //       116,
  //       112,
  //       115,
  //       58,
  //       47,
  //       47,
  //       106,
  //       115,
  //       111,
  //       110,
  //       112,
  //       108,
  //       97,
  //       99,
  //       101,
  //       104,
  //       111,
  //       108,
  //       100,
  //       101,
  //       114,
  //       46,
  //       116,
  //       121,
  //       112,
  //       105,
  //       99,
  //       111,
  //       100,
  //       101,
  //       46,
  //       99,
  //       111,
  //       109,
  //       47,
  //       117,
  //       115,
  //       101,
  //       114,
  //       115,
  //       167,
  //       114,
  //       101,
  //       113,
  //       117,
  //       101,
  //       115,
  //       116,
  //       132,
  //       167,
  //       104,
  //       101,
  //       97,
  //       100,
  //       101,
  //       114,
  //       115,
  //       144,
  //       169,
  //       117,
  //       114,
  //       108,
  //       80,
  //       97,
  //       114,
  //       97,
  //       109,
  //       115,
  //       144,
  //       172,
  //       114,
  //       101,
  //       115,
  //       112,
  //       111,
  //       110,
  //       115,
  //       101,
  //       84,
  //       121,
  //       112,
  //       101,
  //       0,
  //       164,
  //       98,
  //       111,
  //       100,
  //       121,
  //       160,
  //     ]).buffer,
  //   });

  //   console.log(result);
  // });

  test("async", async () => {
    const result = await client.invoke({
      uri: ensUri,
      method: "schedule",
      input: {},
    });
    console.log(result.data);

    const result2 = await client.invoke({
      uri: ensUri,
      method: "result",
      input: {
        taskIds: result.data,
      },
    });

    console.log(result2.data);
  });

  test("test", async () => {
    const res = await client.invoke({
      uri: "wrap://ens/http.polywrap.eth",
      method: "get",
      input: Uint8Array.from([
        130, 163, 117, 114, 108, 217, 42, 104, 116, 116, 112, 115, 58, 47, 47,
        106, 115, 111, 110, 112, 108, 97, 99, 101, 104, 111, 108, 100, 101, 114,
        46, 116, 121, 112, 105, 99, 111, 100, 101, 46, 99, 111, 109, 47, 112,
        111, 115, 116, 115, 167, 114, 101, 113, 117, 101, 115, 116, 132, 167,
        104, 101, 97, 100, 101, 114, 115, 144, 169, 117, 114, 108, 80, 97, 114,
        97, 109, 115, 144, 172, 114, 101, 115, 112, 111, 110, 115, 101, 84, 121,
        112, 101, 0, 164, 98, 111, 100, 121, 160,
      ]),
      noDecode: true
    });
    console.log(res);
  });

  // it("schedule", async () => {
  //   let result = await client.invoke({
  //     uri: ensUri,
  //     method: "schedule",
  //     input: {
  //       tasks: [
  //         {
  //           uri: "wrap://ens/js-logger.polywrap.eth",
  //           method: "ping",
  //           input: undefined,
  //         },
  //       ],
  //     },
  //   });
  //   result = await client.invoke({
  //     uri,
  //     method: "schedule",
  //     input: {
  //       tasks: [
  //         {
  //           uri: "w3://ipfs/QmT6QsSVsEGPUDbwvjSRSz3jvkxFJAe15tensof49gxGUo",
  //           module: "query",
  //           method: "ping",
  //           input: undefined,
  //         },
  //         {
  //           uri: "w3://coingecko.defiwrapper.eth",
  //           module: "query",
  //           method: "ping",
  //           input: undefined,
  //         },
  //         {
  //           uri: "w3://ens/rinkeby/coingecko.defiwrapper.eth",
  //           module: "query",
  //           method: "ping",
  //           input: undefined,
  //         },
  //       ],
  //     },
  //   });

  //   console.log(result);

  //   // result = await client.invoke({
  //   //   uri,
  //   //   module: "query",
  //   //   method: "result",
  //   //   input: {
  //   //     taskIds: result.data,
  //   //     returnWhen: "ALL_COMPLETED"
  //   //   }
  //   // });

  //   result = await client.query({
  //     uri,
  //     query: `
  //       query {
  //         result(taskIds: $taskIds, returnWhen: $returnWhen)
  //       }
  //     `,
  //     variables: {
  //       taskIds: result.data,
  //       returnWhen: "ALL_COMPLETED",
  //     },
  //   });

  //   console.log(result);
  // });
});
