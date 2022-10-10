import { PolywrapClient } from "@polywrap/client-js";
import path from "path";
import fs from "fs";
import * as Ipfs from "./types";
import { TextEncoder } from "util";
import { ipfsProvider, initInfra, stopInfra } from "./utils/infra";
import { defaultIpfsProviders } from "../../../../../../../monorepo/packages/js/client-config-builder/src";

jest.setTimeout(360000);

describe("e2e", () => {
  const singleFileCid = "QmXjuLkuAKVtfg9ZxhWyLanMZasYwhza2EozCH7cg3VY31";
  const addFileCid = "QmWjGyqGNWMAH9pCXK1nJo2Do68EHLb7zUqt6fHuq5pRU4";
  const encoder = new TextEncoder();

  let client: PolywrapClient;
  let fsUri: string;

  beforeAll(async () => {
    await initInfra();

    // create client
    client = new PolywrapClient({
      envs: [
        {
          uri: "wrap://ens/ipfs.polywrap.eth",
          env: {
            provider: ipfsProvider,
            fallbackProviders: defaultIpfsProviders,
          },
        },
      ]
    })

    const apiPath = path.resolve(path.join(__dirname, "/../../../"));
    fsUri = `wrap://fs/${apiPath}/build`;

    // upload test file
    const buffer: Buffer = fs.readFileSync(path.join(__dirname, "testData", "test.txt"));
    const bytes: Ipfs.Bytes = Uint8Array.from(buffer);
    await client.invoke({
      uri: "wrap://ens/ipfs.polywrap.eth",
      method: "addFile",
      args: {
        data: bytes,
      },
    });
  });

  afterAll(async () => {
    await stopInfra();
  })

  it("addFile", async () => {
    const buffer: Buffer = fs.readFileSync(path.join(__dirname, "testData", "addTest.txt"));
    const bytes: Ipfs.Bytes = Uint8Array.from(buffer);

    const result = await client.invoke<Ipfs.Ipfs_AddResult>({
      uri: fsUri,
      method: "addFile",
      args: {
        data: {
          name: "addTest.txt",
          data: bytes,
        },
        ipfsProvider,
        timeout: 5000,
      }
    });

    if (!result.ok) fail(result.error);
    expect(result.value.hash).toEqual(addFileCid);
  });

  it("addFile with onlyHash option", async () => {
    const buffer: Buffer = fs.readFileSync(path.join(__dirname, "testData", "addTest.txt"));
    const bytes: Ipfs.Bytes = Uint8Array.from(buffer);

    const result = await client.invoke<Ipfs.Ipfs_AddResult>({
      uri: fsUri,
      method: "addFile",
      args: {
        data: {
          name: "addTest.txt",
          data: bytes,
        },
        ipfsProvider,
        timeout: 5000,
        options: {
          onlyHash: true
        },
      }
    });

    if (!result.ok) fail(result.error);
    expect(result.value.hash).toEqual(addFileCid);
  });

  it("resolve", async () => {
    const result = await client.invoke<Ipfs.String>({
      uri: fsUri,
      method: "resolve",
      args: {
        cid: singleFileCid,
        ipfsProvider,
        timeout: 5000,
      }
    });

    if (!result.ok) fail(result.error);
    expect(result.value).toEqual("/ipfs/" + singleFileCid);
  });

  it("throws when trying to resolve non-existent cid", async () => {
    const nonExistentFileCid = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    let result = await client.invoke<Ipfs.String>({
      uri: fsUri,
      method: "resolve",
      args: {
        cid: nonExistentFileCid,
        ipfsProvider,
        timeout: 1000,
      }
    });

    expect(result.ok).toBeFalsy();
    result = result as { ok: false; error: Error | undefined };
    expect(result.error).toContain("IpfsError");
  });

  it("cat", async () => {
    const buffer: Buffer = fs.readFileSync(path.join(__dirname, "testData", "test.txt"));
    const bytes: Ipfs.Bytes = Uint8Array.from(buffer);

    const result = await client.invoke<Ipfs.Bytes>({
      uri: fsUri,
      method: "cat",
      args: {
        cid: singleFileCid,
        ipfsProvider,
        timeout: 5000,
      }
    });

    if (!result.ok) fail(result.error);
    expect(result.value).toEqual(bytes);
  });

  it("cat with offset and length", async () => {
    const expected = encoder.encode("From IPFS!");

    const result = await client.invoke<Ipfs.Bytes>({
      uri: fsUri,
      method: "cat",
      args: {
        cid: singleFileCid,
        ipfsProvider,
        timeout: 5000,
        catOptions: {
          offset: 6,
          length: 10,
        },
      }
    });

    if (!result.ok) fail(result.error);
    expect(result.value).toEqual(expected);
  });

  // TODO: write test for addDir
  // it("addDir", async () => {
  // });
});
