import { Injected, InjectedAccount } from '@polkadot/extension-inject/types';

import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { SingleAccountSigner } from './singleAccountSigner';
import { TypeRegistry } from '@polkadot/types';

// create a mock polkadot-js extension and inject into the environment
export async function enableFn (originName: string): Promise<Injected> {

  // generate a test keypair
  await cryptoWaitReady();

  // create a keyring
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.createFromUri('//Alice');
  const registry = new TypeRegistry();
  const signer = new SingleAccountSigner(registry, alice);

  // These accounts must be valid sr25519 addresses or they will get filtered out by the web3Accounts function
  const accounts: InjectedAccount[] = [{ address: alice.address, name: "x", type: 'sr25519' }];

  return {
    accounts: {
      get: async () => accounts,
      subscribe: (cb) => { cb(accounts); return () => {} }
    },
    signer
  }
}
