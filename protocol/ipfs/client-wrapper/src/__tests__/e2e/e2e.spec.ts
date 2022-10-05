import { buildWrapper } from "@polywrap/test-env-js";
import { PolywrapClient } from "@polywrap/client-js";
import path from "path";
import fs from "fs";

jest.setTimeout(360000);

describe("e2e", () => {

  const ipfsProvider = "https://ipfs.wrappers.io";

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
          uri: fsUri,
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
          uri: fsUri,
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
