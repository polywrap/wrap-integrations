import { Substrate_Mutation } from "./w3";

import { Uri, Web3ApiClient } from "@web3api/client-js";
import { runCLI } from "@web3api/test-env-js";
import path from "path";

jest.setTimeout(360000);

describe("e2e", () => {
  let client: Web3ApiClient;
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
    client = new Web3ApiClient();
  });

  it("chainGetBlockHash", async () => {
    // You can use the client directly
    await client.invoke({
      uri,
      module: "mutation",
      method: "chainGetBlockHash"
    });

    // Or use the test app's codegen types (see web3api.app.yaml)
    const result = await Substrate_Mutation.chainGetBlockHash(
      {
        argument: "argument value"
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data?.prop).toBeTruthy();

    const httpResponse = JSON.parse(result.data?.prop || "");
    expect(httpResponse.url).toContain("https://via.placeholder.com/");
  });

  it("chainGetMetadata", async () => {
    // You can use the client directly
    await client.invoke({
      uri,
      module: "mutation",
      method: "chainGetMetadata"
    });

    // Or use the test app's codegen types (see web3api.app.yaml)
    const result = await Substrate_Mutation.chainGetMetadata(
      {
          url: "http://localhost:9933"
      },
      client,
      uri
    );

      console.log("http response: ", result);
  });
});
