import { Substrate_Module } from "./wrap";

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
    await client.invoke({
      uri,
      method: "blockHash"
    });

    // Or use the test app's codegen types (see web3api.app.yaml)
    const result = await Substrate_Module.blockHash(
      {
          url: "http://localhost:9933",
          number: 0
      },
      client,
      uri
    );

      console.log("result:", result);

  });

  it("block", async () => {
    // You can use the client directly
    await client.invoke({
      uri,
      method: "chainGetBlock"
    });

    // Or use the test app's codegen types (see web3api.app.yaml)
    const result = await Substrate_Module.chainGetBlock(
      {
          url: "http://localhost:9933",
          number: 0
      },
      client,
      uri
    );

      console.log("block result:", result);

  });

  it("chainGetMetadata", async () => {
    // You can use the client directly
    await client.invoke({
      uri,
      method: "chainGetMetadata"
    });

    // Or use the test app's codegen types (see web3api.app.yaml)
    const result = await Substrate_Module.chainGetMetadata(
      {
          url: "http://localhost:9933"
      },
      client,
      uri
    );

      console.log("http response: ", result);
  });


  it("storage value", async () => {
    // You can use the client directly
    const invoke_result = await client.invoke({
      uri,
      method: "getStorageValue",
      args: {
          url: "http://localhost:9933",
          pallet: "TemplateModule",
          storage: "Something"
      },
    });

    console.log("invoke result: {}", invoke_result);

    // Or use the test app's codegen types (see web3api.app.yaml)
    const result = await Substrate_Module.getStorageValue(
      {
          url: "http://localhost:9933",
          pallet: "TemplateModule",
          storage: "Something"
      },
      client,
      uri
    );

      console.log("template module Something:", result);

  });

});
