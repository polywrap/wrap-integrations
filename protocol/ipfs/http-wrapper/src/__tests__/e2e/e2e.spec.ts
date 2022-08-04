/*
TODO:
- catFile
- catFileToString
- resolve
- uri-resolver methods
*/

import {
  buildAndDeployApi,
  initTestEnvironment,
  stopTestEnvironment
} from "@polywrap/test-env-js";
import {
  PolywrapClient,
  createPolywrapClient
} from "@polywrap/client-js";
import path from "path";
import fs from "fs";

jest.setTimeout(360000);

describe("e2e", () => {

  let client: PolywrapClient;
  let ipfsProvider: string;
  let ensUri: string;
  let ipfsUri: string;

  beforeAll(async () => {
    // Create Client
    const { ethereum, ipfs, ensAddress } = await initTestEnvironment();

    client = await createPolywrapClient({
      ethereum: {
        networks: {
          testnet: {
            provider: ethereum
          }
        },
        defaultNetwork: "testnet"
      },
      ipfs: {
        provider: ipfs
      },
      ens: {
        addresses: {
          testnet: ensAddress
        },
      },
    });

    ipfsProvider = ipfs;

    // Deploy API
    const apiPath = path.join(__dirname, "/../../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);

    // Cache the API's URI
    ensUri = `/ens/testnet/${api.ensDomain}`;
    ipfsUri = `/ipfs/${api.ipfsCid}`;
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  describe("Query", () => {
    it("catFile", async () => {
      const expected = fs.readFileSync(
        `${__dirname}/../../../build/schema.graphql`,
        "utf-8"
      );
      const decoder = new TextDecoder();

      {
        const { data, errors } = await client.query<{
          catFile: Uint8Array
        }>({
          uri: ensUri,
          query: `
            query {
              catFile(
                cid: "${ipfsUri}/schema.graphql"
                ipfs: {
                  provider: "${ipfsProvider}"
                }
              )
            }
          `
        });

        expect(errors).toBeFalsy();
        expect(data).toBeTruthy();
        expect(
          decoder.decode(data?.catFile?.buffer)
        ).toBe(expected);
      }
      {
        const { data, errors } = await client.query<{
          catFile: Uint8Array
        }>({
          uri: ensUri,
          query: `
            query {
              catFile(
                cid: "${ipfsUri}/schema.graphql"
                ipfs: {
                  provider: "http://test.com"
                  fallbackProviders: [
                    "http://foo.com",
                    "${ipfsProvider}"
                  ]
                }
              )
            }
          `
        });

        expect(errors).toBeFalsy();
        expect(data).toBeTruthy();
        expect(
          decoder.decode(data?.catFile?.buffer)
        ).toBe(expected);
      }
    });

    /*it("catFileToString", async () => {

    });

    it("uri-resolver interface", async () => {
      // TODO
    });*/
  });

  /*describe("Mutation", () => {
    it("addFile", async () => {
      
    });

    it("addFolder", async () => {

    });
  });*/
});
