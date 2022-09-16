import { PolywrapClient } from "@polywrap/client-js";
import { substrateSignerProviderPlugin } from "../";
import { enableFn } from "./mockExtensionInjector";
import { injectExtension } from '@polkadot/extension-inject';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { stringToHex } from "@polkadot/util";

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

  it("Can use injected provider to sign data (smoke test)", async () => {
    await web3Enable('e2e testing dApp');
    const allAccounts = await web3Accounts();
    const account = allAccounts[0];
    const injector = await web3FromSource(account.meta.source);
    const signRaw = injector?.signer?.signRaw;

    if (!!signRaw) {
        // WHY DO I NEED TO BIND HERE??
        const { signature } = await signRaw.bind(injector.signer)({
            address: account.address,
            data: stringToHex('message to sign'),
            type: 'bytes'
        });
        console.log(signature);
    }

  });


});
