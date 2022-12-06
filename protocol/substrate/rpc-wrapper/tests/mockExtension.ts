import { KeyringSignerProvider } from "substrate-signer-provider-plugin-js";

import { injectExtension } from "@polkadot/extension-inject";
import { Injected, InjectedAccount } from "@polkadot/extension-inject/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/ui-keyring";

export function mockExtension(): void {
  injectExtension(
    enableFn,
    { name: "mockExtension", version: "1.0.0" }
  );
}

async function enableFn(_: string): Promise<Injected> {

  await cryptoWaitReady();

  // create a keyring
  const keyring = new Keyring();
  keyring.createFromUri("//Alice", undefined, "sr25519");
  const provider = new KeyringSignerProvider(keyring);

  // These accounts must be valid sr25519 addresses or they will get filtered out by the web3Accounts function
  const accounts: InjectedAccount[] = await provider.getAccounts().then((accounts) => accounts.map(
    (account): InjectedAccount => ({
      address: account.address,
      name: "alice",
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
