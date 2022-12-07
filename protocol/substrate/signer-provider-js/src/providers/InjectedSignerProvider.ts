import { SignerProvider } from "../SignerProvider";
import { Account } from "../wrap";

import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { Signer } from '@polkadot/api/types';
import { TypeRegistry } from '@polkadot/types';

export class InjectedSignerProvider implements SignerProvider {
  private _isProviderEnabled: boolean = false;
  private _registry: TypeRegistry;

  constructor(
    registry?: TypeRegistry
  ) {
    this._registry = registry || new TypeRegistry();
  }

  public get registry(): TypeRegistry {
    return this._registry;
  }

  public async getAccounts(): Promise<Account[]> {
    await this._enableProvider();
    return await web3Accounts();
  }

  public async getSigner(address: string): Promise<Signer> {
    const accounts = await this.getAccounts();
    const signingAccount = accounts.find(acc => acc.address == address);

    if (!signingAccount) {
      throw new Error("Provider does not contain account: " + address);
    }

    const injector = await web3FromAddress(signingAccount.address);
    return injector?.signer
  }

  private async _enableProvider(): Promise<void> {
    if (this._isProviderEnabled) {
      return;
    }
    await web3Enable("substrate-signer-provider-plugin");
    this._isProviderEnabled = true;
  }
}
