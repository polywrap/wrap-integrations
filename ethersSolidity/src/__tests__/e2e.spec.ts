import { Web3ApiClient } from "@web3api/client-js";
import { ethersSolidity } from "../";

describe("e2e", () => {

  let client: Web3ApiClient;
  const uri = "ens/ethersSolidity.eth";

  beforeAll(() => {
    // Add the samplePlugin to the Web3ApiClient
    client = new Web3ApiClient({
      plugins: [
        {
          uri: uri,
          plugin: ethersSolidity({})
        }
      ]
    });
  });

  it("pack", async () => {
    const types: string[] = ["address","uint24","address","uint24","address"];
    const values: string[] = [
      "0x0000000000000000000000000000000000000001",
      "3000",
      "0x0000000000000000000000000000000000000002",
      "3000",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    ];
    const result = await client.invoke<string>({
      uri: uri,
      module: "query",
      method: "pack",
      input: {
        types,
        values,
      },
      decode: true,
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toBe("0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
  });
});
