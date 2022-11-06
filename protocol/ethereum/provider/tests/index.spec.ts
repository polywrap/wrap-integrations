import { PolywrapClient } from "@polywrap/client-js";

import { BigNumber, Wallet, ethers } from "ethers";
import { ethereumProviderPlugin } from "../src";

jest.setTimeout(360000);

describe("Ethereum Plugin", () => {
  let client: PolywrapClient;

  const uri = "wrap://ens/ethereum-provider.polywrap.eth";

  beforeAll(async () => {

    client = new PolywrapClient({
      plugins: [
        {
          uri,
          plugin: ethereumProviderPlugin({
            url: "https://bsc-dataseed1.binance.org/",
            wallet: new Wallet("0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d")
          }),
        },
      ],
    });

  });

  describe("EthereumProviderPlugin", () => {
    it("eth_chainId", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "request",
        args: { method: "eth_chainId" }
      });

      if (!response.ok) fail(response.error);
      expect(response.value).toBeDefined();

      const res = BigNumber.from(JSON.parse(response.value)).toString();
      expect(res).toBe("56");
    });

    it("personal_signDigest", async () => {
      const hash = ethers.utils.hashMessage("Hello World")
      const digest = Array.from(ethers.utils.arrayify(hash))
      const params = JSON.stringify(digest)
      const response = await client.invoke<string>({
        uri,
        method: "request",
        args: { method: "personal_signDigest", params},
      });

      if (!response.ok) fail(response.error);

      expect(response.value).toBeDefined();
      expect(response.value).toBe("0xa4708243bf782c6769ed04d83e7192dbcf4fc131aa54fde9d889d8633ae39dab03d7babd2392982dff6bc20177f7d887e27e50848c851320ee89c6c63d18ca761c");
    });

    it("personal_address", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "request",
        args: { method: "personal_address" }
      });

      if (!response.ok) fail(response.error);
      expect(response.value).toBeDefined();

      expect(response.value?.startsWith("0x")).toBe(true);
    });

    it("personal_chainId", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "request",
        args: { method: "personal_chainId" }
      });

      if (!response.ok) fail(response.error);
      expect(response.value).toEqual("56");
    });
  });
});

