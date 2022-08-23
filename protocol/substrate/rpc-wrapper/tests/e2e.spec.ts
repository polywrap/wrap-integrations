import { Substrate_BlockOutput, 
    Substrate_ChainMetadata, 
    Substrate_RuntimeVersion, 
    Substrate_AccountInfo,
    UInt8,
    String,
} from "./wrap";
import { InvokeResult } from "@polywrap/core-js";
import { Uri, PolywrapClient } from "@polywrap/client-js";
import { runCLI } from "@polywrap/test-env-js";
import path from "path";

jest.setTimeout(360000);

describe("e2e", () => {
  let client: PolywrapClient;
  let uri: string;

  beforeAll(async () => {

    const wrapperDir = path.resolve(__dirname, "../");

    const buildOutput = await runCLI({
      args: ["build"],
      cwd: wrapperDir
    });

    if (buildOutput.exitCode !== 0) {
      throw Error(
        `Failed to build wrapper:\n` +
        JSON.stringify(buildOutput, null, 2)
      );
    }

    uri = new Uri(`fs/${wrapperDir}/build`).uri;
    client = new PolywrapClient();
  });

  it("blockHash", async () => {
    // You can use the client directly
    let result = await client.invoke({
      uri,
      method: "blockHash",
        args: {
          url: "http://localhost:9933",
          number: 0
        }
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
  });

  it("retrieves genesis block parent hash is 00000", async () => {
    const result:InvokeResult<Substrate_BlockOutput> = await client.invoke({
      uri,
      method: "chainGetBlock",
        args: {
          url: "http://localhost:9933",
          number: 0
        },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    const block: Substrate_BlockOutput = result.data!;
    expect(block.block).toBeTruthy();

    const json_block = JSON.parse(block.block);
    // The parent hash of genesis is always 00000
    expect(json_block.block.header.parentHash).toStrictEqual("0x0000000000000000000000000000000000000000000000000000000000000000");
  });

  it("retrieves the chain metadata", async () => {
    const result: InvokeResult<Substrate_ChainMetadata> = await client.invoke({
      uri,
      method: "chainGetMetadata",
        args: {
          url: "http://localhost:9933"
        }
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    let chainMetadata: Substrate_ChainMetadata = result.data!;
    expect(chainMetadata.metadata).toBeTruthy();
    expect(chainMetadata.pallets).toBeTruthy();
    expect(chainMetadata.events).toBeTruthy();
    expect(chainMetadata.errors).toBeTruthy();
  });

  it("state get runtime version", async () => {
    // You can use the client directly
    const result: InvokeResult<Substrate_RuntimeVersion> = await client.invoke({
      uri,
      method: "getRuntimeVersion",
        args: {
          url: "http://localhost:9933"
        }
    });

    expect(result.data).toBeTruthy();
    expect(result.error).toBeFalsy();
    let runtimeVersion: Substrate_RuntimeVersion = result.data!;
    expect(runtimeVersion.spec_name).toStrictEqual("forum-node");
    expect(runtimeVersion.impl_name).toStrictEqual("forum-node");
    expect(runtimeVersion.authoring_version).toStrictEqual(1);
    expect(runtimeVersion.spec_version).toStrictEqual(100);
    expect(runtimeVersion.impl_version).toStrictEqual(1);
    expect(runtimeVersion.state_version).toStrictEqual(1);
  });


  it("storage value", async () => {
    // You can use the client directly
    const result:InvokeResult<UInt8[]> = await client.invoke({
      uri,
      method: "getStorageValue",
      args: {
          url: "http://localhost:9933",
          pallet: "TemplateModule",
          storage: "Something"
      },
    });

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeFalsy();
  });

  it("return constant values", async () => {
    // You can use the client directly
    const result:InvokeResult<UInt8[]> = await client.invoke({
      uri,
      method: "constant",
      args: {
          url: "http://localhost:9933",
          pallet: "Balances",
          name: "ExistentialDeposit"
      },
    });

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
    // You can use the client directly
    const result: InvokeResult<String[]> = await client.invoke({
      uri,
      method: "rpcMethods",
      args: {
          url: "http://localhost:9933",
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    let methods = result.data!;
    //There are 85 rpc methods exposed in `examples/substrate-note-template`
    expect(methods.length).toStrictEqual(85);
  });

  it("get storage maps", async () => {
    // You can use the client directly
    const result: InvokeResult<UInt8[]> = await client.invoke({
      uri,
      method: "getStorageMap",
      args: {
          url: "http://localhost:9933",
          pallet: "ForumModule",
          storage: "AllPosts",
          key: "0",
      },
    });

    expect(result.error).toBeFalsy();
    expect(result).toBeTruthy();
  });


  it("get storage maps paged", async () => {
    // You can use the client directly
    const result: InvokeResult<UInt8[]> = await client.invoke({
      uri,
      method: "getStorageMapPaged",
      args: {
          url: "http://localhost:9933",
          pallet: "ForumModule",
          storage: "AllPosts",
          count: 10,
          nextTo: null,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  it("get account info of Alice", async () => {
    const result:InvokeResult<Substrate_AccountInfo> = await client.invoke({
      uri,
      method: "accountInfo",
      args: {
          url: "http://localhost:9933",
          //Alice account
          account: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      },
    });

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    let account_info: Substrate_AccountInfo = result.data!;
    console.log("account info: ", account_info);
  });
});
