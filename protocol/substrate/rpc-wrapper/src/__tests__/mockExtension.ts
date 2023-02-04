import { KeyringSignerProvider } from "substrate-signer-provider-plugin-js";

import { injectExtension } from "@polkadot/extension-inject";
import { Injected, InjectedAccount } from "@polkadot/extension-inject/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/ui-keyring";

export const suri = "//Alice";
export const address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

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
  keyring.addUri(suri, "", {}, "sr25519");
  keyring.getPair(address).unlock();

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
