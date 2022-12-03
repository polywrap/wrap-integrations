import { PolywrapClient } from "@polywrap/client-js";
import { injectExtension } from '@polkadot/extension-inject';
import { u8aToHex } from "@polkadot/util";
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { TypeRegistry } from '@polkadot/types';

import { substrateSignerProviderPlugin } from "../";
import { enableFn } from "mock-polkadot-js-extension";
import { Account, SignerResult } from '../wrap';
import { testPayload } from './testPayload';

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
    const result = await client.invoke<Account[]>({
      uri,
      method: "getAccounts",
      args: {},
    });

    expect(result.ok).toBeTruthy();
    if (!result.ok) fail(result.error);
    expect(result.value).toBeTruthy();
    const accounts = result.value;
    expect(accounts.length).toBe(1);
    expect(accounts[0].meta.name).toBe("alice");
  });

  it("signRaw produces a valid signature from test account", async () => {
    const account = await getAccount();
    const data = "123"; // to be signed

    const result = await client.invoke<SignerResult>({
      uri,
      method: "signRaw",
      args: { payload: { address: account.address, data } }
    });

    expect(result.ok).toBeTruthy();
    if (!result.ok) fail(result.error);
    expect(result.value).toBeTruthy();
    const signerResult = result.value;
    expect(isValidSignature(data, signerResult.signature, account.address));
  });

  it("signRaw throws if an unmanaged account address is requested", async () => {
    const unmanagedAddress = "000000000000000000000000000000000000000000000000"; 

    const result = await client.invoke({
      uri,
      method: "signRaw",
      args: { payload: { address: unmanagedAddress } }
    });

    expect(result.ok).toBeFalsy();
    if (result.ok) fail("This should fail");
    expect(result.error?.message).toContain("Provider does not contain account: "+ unmanagedAddress);
  });

  it("signPayload produces a valid signature from test account", async () => {
    const account = await getAccount();
    const payload = testPayload(account.address)
    const result = await client.invoke<SignerResult>({
      uri,
      method: "signPayload",
      args: { payload }
    });

    expect(result.ok).toBeFalsy();
    if (!result.ok) fail(result.error);
    expect(result.value).toBeTruthy();
    const signerResult = result.value;

    // To verify the signature encode the extrinsic payload as hex
    // then veify as with signRaw
    const registry = new TypeRegistry();
    const encodedPayload = registry
      .createType('ExtrinsicPayload', payload, { version: payload.version })
      .toHex();

    expect(isValidSignature(encodedPayload, signerResult.signature, account.address));
  });  

  it("signPayload throws if an unmanaged account address is requested", async () => {
    const unmanagedAddress = "000000000000000000000000000000000000000000000000"; 

    const result = await client.invoke({
      uri,
      method: "signPayload",
      args: { payload: { address: unmanagedAddress } }
    });

    expect(result.ok).toBeFalsy();
    if (result.ok) fail("This should fail.");
    expect(result.error?.message).toContain("Provider does not contain account: "+ unmanagedAddress);
  });

  // -- helpers -- //

  async function getAccount(): Promise<Account> {
    const accountsResult = await client.invoke<Account[]>({
      uri,
      method: "getAccounts",
      args: {},
    });

    if (!accountsResult.ok) {
      throw accountsResult.error;
    }
    return accountsResult.value[0];
  }

  async function isValidSignature(signedMessage: string, signature: string, address: string): Promise<boolean> {
    await cryptoWaitReady();
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);
    return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
  }

});


