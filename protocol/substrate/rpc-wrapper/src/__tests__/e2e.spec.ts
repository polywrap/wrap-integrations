import {
  Substrate_Module,
  Substrate_SignerProvider_SignerPayloadJSON as SignerPayload,
} from "./wrap";
import { mockExtension, address } from "./mockExtension";
import { substrateSignerProviderPlugin } from "substrate-signer-provider-plugin-js";
import { PolywrapClient } from "@polywrap/client-js";
import { TypeRegistry } from '@polkadot/types';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from "@polkadot/util";
import { TextEncoder, TextDecoder } from "util";
import path from "path";

jest.setTimeout(360000);
const url = "http://localhost:9933";

describe("e2e", () => {
  let client: PolywrapClient;
  const uri = "file/" + path.join(__dirname, "../../build");

  beforeAll(async () => {
    // polyfill text encoder. This is required to test in the jsdom environment
    global.TextEncoder = TextEncoder;
    // @ts-ignore
    global.TextDecoder = TextDecoder;

    // Mock the Polkadot.js extension
    mockExtension();

    client = new PolywrapClient({
      plugins: [
        {
          uri: "ens/substrate-signer-provider.chainsafe.eth",
          plugin: substrateSignerProviderPlugin({})
        }
      ]
    });
  });

  it("blockHash", async () => {
    const result = await Substrate_Module.blockHash({
        url,
        number: 0
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
    console.log(result.value);
  });

  it("retrieves genesis block parent hash is 00000", async () => {
    const result = await Substrate_Module.chainGetBlock({
        url,
        number: 0
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
    const block = result.value!;
    expect(block.block).toBeTruthy();

    const json_block = JSON.parse(block.block);
    // The parent hash of genesis is always 00000
    expect(json_block.block.header.parentHash).toStrictEqual("0x0000000000000000000000000000000000000000000000000000000000000000");
  });

  it("retrieves the chain metadata", async () => {
    const result = await Substrate_Module.chainGetMetadata({
        url
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();

    const chainMetadata = result.value!;
    expect(chainMetadata.metadata).toBeTruthy();
    expect(chainMetadata.pallets).toBeTruthy();
    expect(chainMetadata.events).toBeTruthy();
    expect(chainMetadata.errors).toBeTruthy();
  });

  it("state get runtime version", async () => {
    const result = await Substrate_Module.getRuntimeVersion({
        url
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
    const runtimeVersion = result.value!;
    expect(runtimeVersion.spec_name).toStrictEqual("node-template");
    expect(runtimeVersion.impl_name).toStrictEqual("node-template");
    expect(runtimeVersion.authoring_version).toStrictEqual(1);
    expect(runtimeVersion.spec_version).toStrictEqual(100);
    expect(runtimeVersion.impl_version).toStrictEqual(1);
    expect(runtimeVersion.state_version).toStrictEqual(1);
  });

  it("storage value", async () => {
    const result = await Substrate_Module.getStorageValue({
       url,
        pallet: "TemplateModule",
        storage: "Something"
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeFalsy();
  });

  it("return constant values", async () => {
    const result = await Substrate_Module.constant({
       url,
        pallet: "Balances",
        name: "ExistentialDeposit"
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
    expect(result.value).toStrictEqual([
      244, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0
    ]);
  });

  it("rpc_methods", async () => {
    const result = await Substrate_Module.rpcMethods({
        url,
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
    const methods = result.value!;
    //There are 85 rpc methods exposed in `examples/substrate-note-template`
    expect(methods.length).toStrictEqual(85);
  });

  it("get storage maps", async () => {
    const result = await Substrate_Module.getStorageMap({
        url,
        pallet: "System",
        storage: "BlockHash",
        key: "0",
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
  });

  it("get storage maps paged", async () => {
    const result = await Substrate_Module.getStorageMapPaged({
        url,
        pallet: "Grandpa",
        storage: "SetIdSession",
        count: 10,
        nextTo: null,
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
  });

  it("get account info of Alice from chain", async () => {
    const result = await Substrate_Module.accountInfo({
        url,
        // //Alice address
        account: address,
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result).toBeTruthy();
  });

  it("can get signer-provider managed accounts. Returns Alice", async () => {
    const result = await Substrate_Module.getSignerProviderAccounts(
      {},
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
    expect(result.value).toStrictEqual([
      {
        address: address,
        meta: { genesisHash: null, name: 'alice', source: 'mock-polkadot-js' },
        type: 'sr25519'
      }
    ]);
  });  

  // This is a known good payload taken from polkadot-js tests
  const testExtrinsic: SignerPayload = {
    address,
    blockHash: '0x661f57d206d4fecda0408943427d4d25436518acbff543735e7569da9db6bdd7',
    blockNumber: 1,
    era: '0xb502',
    genesisHash: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
    method: '0x0403c6111b239376e5e8b983dc2d2459cbb6caed64cc1d21723973d061ae0861ef690b00b04e2bde6f',
    nonce: 0,
    signedExtensions: [
      'CheckSpecVersion',
      'CheckTxVersion',
      'CheckGenesis',
      'CheckMortality',
      'CheckNonce',
      'CheckWeight',
      'ChargeTransactionPayment'
    ],
    specVersion: 45,
    tip: "0",
    transactionVersion: 3,
    version: 4
  }

  it("can sign using extension provider and get same signature as using polkadot-js directly", async () => {
    const result = await Substrate_Module.sign(
      {
        extrinsic: testExtrinsic
      },
      client,
      uri
    );

    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();

    // check signature is the same as if just signing in javascript
    const registry = new TypeRegistry();
    const encodedPayload = registry
      .createType('ExtrinsicPayload', testExtrinsic, { version: testExtrinsic.version })
      .toHex();
    expect(isValidSignature(encodedPayload, result.value?.signature!, address))
  });

  it.skip("Can send a signed extrinsic to the chain", async () => {
    const result = await Substrate_Module.sign(
      {
        extrinsic: testExtrinsic
      },
      client,
      uri
    );
    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
    if (!result.value) throw Error("This shouldn't happen.");
    const signedPayload = result.value;

    const sendResult = await Substrate_Module.send(
      {
        url,
        signedExtrinsic: signedPayload
      },
      client,
      uri
    );
    if (!sendResult.ok) fail(sendResult.error);
    expect(sendResult.ok).toBeTruthy();
    expect(sendResult).toBeTruthy();
  });

  async function isValidSignature(signedMessage: string, signature: string, address: string): Promise<boolean> {
    await cryptoWaitReady();
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);
    return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
  }
});
