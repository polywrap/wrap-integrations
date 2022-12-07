import { KeyringSignerProvider } from "../providers";

import { injectExtension } from "@polkadot/extension-inject";
import { Injected, InjectedAccount } from "@polkadot/extension-inject/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/ui-keyring";

export function mockExtension(): void {
  injectExtension(
    enableFn,
    { name: "mock-polkadot-js", version: "1.0.0" }
  );
}

async function enableFn(_: string): Promise<Injected> {

  await cryptoWaitReady();

  // create a keyring & add the //Alice default account
  const keyring = new Keyring();
  keyring.loadAll({});
  keyring.addUri("//Alice");
  keyring.getPair("5FA9nQDVg267DEd8m1ZypXLBnvN7SFxYwV7ndqSYGiN9TTpu").unlock();

  const provider = new KeyringSignerProvider(keyring);

  const accounts: InjectedAccount[] = await provider.getAccounts().then((accounts) => accounts.map(
    (account): InjectedAccount => ({
      address: account.address,
      name: account.meta.name || "alice",
      type: "sr25519"
    })
  ));
  const signer = await provider.getSigner(accounts[0].address);

  return {
    accounts: {
      get: async () => Promise.resolve(accounts),
      subscribe: (cb) => { cb(accounts); return () => {} }
    },
    signer
  };
}
