import {
  Substrate_Module,
  Substrate_BlockOutput,
  Substrate_ChainMetadata,
  Substrate_RuntimeVersion,
  Substrate_AccountInfo,
} from "./wrap";
import { PolywrapClient, Uri } from "@polywrap/client-js";
// import { runCLI } from "@polywrap/test-env-js";
import path from "path";
// import { up, down } from "substrate-polywrap-test-env";
import { TextEncoder, TextDecoder } from "util";


jest.setTimeout(360000);
let url: string;

describe("e2e", () => {
  let client: PolywrapClient;
  const uri = new Uri("file/" + path.join(__dirname, "../build")).uri;

  beforeAll(async () => {

    // polyfill text encoder
    global.TextEncoder = TextEncoder;
    // @ts-ignore
    global.TextDecoder = TextDecoder;

    // // start up a test chain environment
    // console.log("Starting up test chain. This can take around 1 minute..");
    // const response = await up(false);
    // url = response.node.url;
    // console.log("Test chain running at ", url);

    // const wrapperDir = path.resolve(__dirname, "../");

    // const buildOutput = await runCLI({
    //   args: ["build"],
    //   cwd: wrapperDir
    // });

    // if (buildOutput.exitCode !== 0) {
    //   throw Error(
    //     `Failed to build wrapper:\n` +
    //     JSON.stringify(buildOutput, null, 2)
    //   );
    // }
    url = "http://localhost:9933"

    client = new PolywrapClient();
  });

  afterAll(async () => {
    // await down();
  })

  it("blockHash", async () => {
    const result = await Substrate_Module.blockHash({
        url,
        number: 0
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    console.log(result.data);
  });

  it("retrieves genesis block parent hash is 00000", async () => {
    const result = await Substrate_Module.chainGetBlock({
        url,
        number: 0
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    const block: Substrate_BlockOutput = result.data!;
    expect(block.block).toBeTruthy();

    const json_block = JSON.parse(block.block);
    // The parent hash of genesis is always 00000
    expect(json_block.block.header.parentHash).toStrictEqual("0x0000000000000000000000000000000000000000000000000000000000000000");
  });

  it("retrieves the chain metadata", async () => {
    const result = await Substrate_Module.chainGetMetadata({
        url
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const chainMetadata: Substrate_ChainMetadata = result.data!;
    expect(chainMetadata.metadata).toBeTruthy();
    expect(chainMetadata.pallets).toBeTruthy();
    expect(chainMetadata.events).toBeTruthy();
    expect(chainMetadata.errors).toBeTruthy();
  });

  it("state get runtime version", async () => {
    const result = await Substrate_Module.getRuntimeVersion({
        url
      },
      client,
      uri
    );

    expect(result.data).toBeTruthy();
    expect(result.error).toBeFalsy();
    const runtimeVersion: Substrate_RuntimeVersion = result.data!;
    expect(runtimeVersion.spec_name).toStrictEqual("forum-node");
    expect(runtimeVersion.impl_name).toStrictEqual("forum-node");
    expect(runtimeVersion.authoring_version).toStrictEqual(1);
    expect(runtimeVersion.spec_version).toStrictEqual(100);
    expect(runtimeVersion.impl_version).toStrictEqual(1);
    expect(runtimeVersion.state_version).toStrictEqual(1);
  });


  it("storage value", async () => {
    const result = await Substrate_Module.getStorageValue({
       url,
        pallet: "TemplateModule",
        storage: "Something"
      },
      client,
      uri
    );

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeFalsy();
  });

  it("return constant values", async () => {
    const result = await Substrate_Module.constant({
       url,
        pallet: "Balances",
        name: "ExistentialDeposit"
      },
      client,
      uri
    );

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toStrictEqual([
      244, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0
    ]);
  });

  it("rpc_methods", async () => {
    const result = await Substrate_Module.rpcMethods({
        url,
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    const methods = result.data!;
    //There are 85 rpc methods exposed in `examples/substrate-note-template`
    expect(methods.length).toStrictEqual(85);
  });

  it("get storage maps", async () => {
    const result = await Substrate_Module.getStorageMap({
        url,
        pallet: "ForumModule",
        storage: "AllPosts",
        key: "0",
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result).toBeTruthy();
  });


  it("get storage maps paged", async () => {
    const result = await Substrate_Module.getStorageMapPaged({
        url,
        pallet: "ForumModule",
        storage: "AllPosts",
        count: 10,
        nextTo: null,
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it("get account info of Alice", async () => {
    const result = await Substrate_Module.accountInfo({
        url,
        //Alice account
        account: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      },
      client,
      uri
    );

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const account_info: Substrate_AccountInfo = result.data!;
    console.log("account info: ", account_info);
  });
});
