import { PolywrapClient } from "@polywrap/client-js";
//import * as path from 'path'

import { BigNumber } from "ethers";
import { ethereumProviderPlugin } from "../src/index";

jest.setTimeout(360000);

describe("Ethereum Plugin", () => {
  let client: PolywrapClient;

  const uri = "wrap://ens/ethereum-provider.polywrap.eth";

  beforeAll(async () => {

    client = new PolywrapClient({
      plugins: [
        {
          uri,
          plugin: ethereumProviderPlugin({url: "https://bsc-dataseed1.binance.org/"}),
        },
      ],
    });

  });

  describe("EthereumProviderPlugin", () => {
    it("chainId", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "request",
        args: { method: "eth_chainId" },
      });
      const data = response.data;
      let res;
      if (data) {
        res = BigNumber.from(JSON.parse(data)).toString();
      }


      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      expect(res).toBe("56");
    });
  });
});

