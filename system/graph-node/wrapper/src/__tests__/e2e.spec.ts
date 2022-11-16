import { PolywrapClient } from "@polywrap/client-js";
import path from "path";

jest.setTimeout(30000);

describe("Graph Node Plugin", () => {

  let uri: string;
  let client: PolywrapClient;

  beforeAll(() => {
    const wrapperPath: string = path.join(__dirname, "..", "..", "build");
    const absPath: string = path.resolve(wrapperPath);
    uri = `wrap://fs/${absPath}`;

    client = new PolywrapClient({
      envs: [{
        uri: uri,
        env: {
          provider: "https://api.thegraph.com"
        }
      }]
    });
  });

  test("Query works", async () => {
    const response = await client.invoke<string>({
      uri,
      method: "querySubgraph",
      args: {
        subgraphAuthor: "ensdomains",
        subgraphName: "ens",
        query: `{
          domains(first: 5) {
            id
            name
            labelName
            labelhash
          }
          transfers(first: 5) {
            id
            domain {
              id
            }
            blockNumber
            transactionID
          }
        }`
      }
    })
    if (response.ok == false) fail(response.error);

    const result = JSON.parse(response.value);
    expect(result.data).toBeDefined();
    expect(result.data.domains).toBeDefined();
    expect(result.data.transfers).toBeDefined();
  });

  it("throws if errors in querystring", async () => {
    const response = await client.invoke<string>({
      uri,
      method: "querySubgraph",
      args: {
        subgraphAuthor: "ensdomains",
        subgraphName: "ens",
        query: `{
          domains(first: 5) {
            ids
            names
            labelNames
            labelhash
          }
          transfers(first: 5) {
            id
            domain {
              id
            }
            blockNumber
            transactionID
          }
        }`
      }
    });
    expect(response.ok).toBeFalsy();
    if (response.ok == true) fail("never");
    expect(response.error?.message).toContain(`Message: Type \`Domain\` has no field \`ids\``);
    expect(response.error?.message).toContain(`Message: Type \`Domain\` has no field \`names\``);
    expect(response.error?.message).toContain(`Message: Type \`Domain\` has no field \`labelNames\``);
  });

  it("throws if wrong subgraph author", async () => {
    const response = await client.invoke<string>({
      uri,
      method: "querySubgraph",
      args: {
        subgraphAuthor: "ens",
        subgraphName: "ens",
        query: `{
          domains(first: 5) {
            id
            name
            labelName
            labelhash
          }
          transfers(first: 5) {
            id
            domain {
              id
            }
            blockNumber
            transactionID
          }
        }`
      }
    });
    expect(response.ok).toBeFalsy();
    if (response.ok == true) fail("never");
    expect(response.error?.message).toContain("`ens/ens` does not exist");
  });

  it("throws if wrong subgraph name", async () => {
    const response = await client.invoke<string>({
      uri,
      method: "querySubgraph",
      args: {
        subgraphAuthor: "ensdomains",
        subgraphName: "foo",
        query: `{
          domains(first: 5) {
            id
            name
            labelName
            labelhash
          }
          transfers(first: 5) {
            id
            domain {
              id
            }
            blockNumber
            transactionID
          }
        }`
      }
    });
    expect(response.ok).toBeFalsy();
    if (response.ok == true) fail("never");
    expect(response.error?.message).toContain("`ensdomains/foo` does not exist");
  });
});
