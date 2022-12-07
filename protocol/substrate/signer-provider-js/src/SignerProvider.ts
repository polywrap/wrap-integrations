import { Account } from "./wrap";

import { Signer } from '@polkadot/api/types';
import { TypeRegistry } from '@polkadot/types';

export interface SignerProvider {
  get registry(): TypeRegistry;
  getAccounts: () => Promise<Account[]>;
  getSigner: (address: string) => Promise<Signer>;
}
