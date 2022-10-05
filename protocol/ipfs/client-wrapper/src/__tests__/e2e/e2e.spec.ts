import { buildWrapper } from "@polywrap/test-env-js";
import { PolywrapClient } from "@polywrap/client-js";
import { httpPlugin } from "@polywrap/http-plugin-js";
import path from "path";
import fs from "fs";
import * as Ipfs from "./types";

jest.setTimeout(360000);

describe("e2e", () => {

  const singleFileCid = "QmcUZ2oVczdFaRsY8Fcqi8f27GLF8fY6mVboGZGYS8JE72";
  const ipfsProvider = "https://ipfs.wrappers.io";

  const encoder = new TextEncoder();

  let client: PolywrapClient;
  let fsUri: string;

  beforeAll(async () => {
    // create client
    client = new PolywrapClient({
      plugins: [
        {
          uri: "wrap://ens/http.polywrap.eth",
          plugin: httpPlugin({}),
        },
      ]
    })

    // build wrapper
    const apiPath = path.join(__dirname, "/../../../");
    await buildWrapper(apiPath);

    // save uri
    fsUri = `wrap://fs/${apiPath}/build`;
  });

  it("cat", async () => {
    const expected = fs.readFileSync(path.join(__dirname, "testData", "test.txt"));

    const result = await client.invoke<Ipfs.Bytes>({
      uri: fsUri,
      method: "cat",
      args: {
        cid: singleFileCid,
        ipfsProvider
      }
    });

    if (!result.ok) fail(result.error);
    expect(result.value).toBeTruthy();
    expect(result.value.buffer).toEqual(expected);
  });

  it("cat with options", async () => {
    const expected = encoder.encode("From IPFS!");

    const result = await client.invoke<Ipfs.Bytes>({
      uri: fsUri,
      method: "cat",
      args: {
        cid: singleFileCid,
        ipfsProvider,
        catOptions: {
          offset: 6,
          length: 10,
        },
      }
    });

    if (!result.ok) fail(result.error);
    expect(result.value).toEqual(expected);
  });

  it("resolve", async () => {
    const result = await client.invoke<Ipfs.String>({
      uri: fsUri,
      method: "resolve",
      args: {
        cid: singleFileCid,
        ipfsProvider
      }
    });

    if (!result.ok) fail(result.error);
    expect(result.value).toEqual(singleFileCid);
  });

  it("add", async () => {

  });

  it("addDir", async () => {

  });
});
