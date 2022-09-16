import { PolywrapClient } from "@polywrap/client-js";
import { substrateSignerProviderPlugin } from "../";
import { enableFn } from "./mockExtensionInjector";
import { injectExtension } from '@polkadot/extension-inject';

import { Account } from '../wrap';

describe("e2e", () => {

  let client: PolywrapClient;
  const uri = "ens/substrate-signer-provider.chainsafe.eth";

  beforeAll(async () => {
    // injects the mock extension into the page
    await injectExtension(enableFn, { name: 'mockExtension', version: '1.0.0' });
    
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

  it("getAccounts returns Alice", async () => {
    const result = await client.invoke({
      uri,
      method: "getAccounts",
      args: {},
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    const accounts: Account[] = result.data as Account[];
    expect(accounts.length).toBe(1);
    expect(accounts[0].meta.name).toBe("alice");
  });

  
});
