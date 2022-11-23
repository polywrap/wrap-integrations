import { defaultIpfsProviders, PolywrapClient } from "@polywrap/client-js";
import path from "path";
import fs from "fs";
import * as Ipfs from "./types";
import { ipfsProvider, initInfra, stopInfra } from "./utils/infra";

jest.setTimeout(60000);

describe("IPFS Uri Resolver HTTP Client", () => {
  const singleFileCid = "QmXjuLkuAKVtfg9ZxhWyLanMZasYwhza2EozCH7cg3VY31";

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

    if (result.ok == false) fail(result.error);
    expect(result.value).toEqual(bytes);
  });
});
