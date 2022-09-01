import { PolywrapClient } from "@polywrap/client-js";
import { substrateSignerProviderPlugin } from "../";

describe("e2e", () => {

  let client: PolywrapClient;
  const uri = "ens/substrate-signer-provider.chainsafe.eth";

  beforeAll(() => {
    // Add the samplePlugin to the PolywrapClient
    client = new PolywrapClient({
      plugins: [
        {
          uri: uri,
          plugin: substrateSignerProviderPlugin({})
        }
      ]
    });
  });

  it("sampleMethod", async () => {
    const result = await client.invoke({
      uri,
      method: "getAccounts",
      args: {},
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toBe("fuz baz foo bar");
  });
});
