import {
  Substrate_Module,
  Substrate_BlockOutput,
  Substrate_ChainMetadata,
  Substrate_RuntimeVersion,
  Substrate_AccountInfo,
  Substrate_SignerProvider_SignerPayloadJSON as SignerPayload,
} from "./wrap";
import { PolywrapClient, Uri } from "@polywrap/client-js";
import { runCLI } from "@polywrap/test-env-js";
import path from "path";
import { up, down } from "substrate-polywrap-test-env";
import { TextEncoder, TextDecoder } from "util";
import { substrateSignerProviderPlugin } from "substrate-signer-provider-plugin-js";
import { enableFn } from "mock-polkadot-js-extension";
import { injectExtension } from '@polkadot/extension-inject';
import { TypeRegistry } from '@polkadot/types';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from "@polkadot/util";


jest.setTimeout(360000);
let url: string;

describe("e2e", () => {
  let client: PolywrapClient;
  const uri = new Uri("file/" + path.join(__dirname, "../build")).uri;

  beforeAll(async () => {

    // polyfill text encoder. This is required to test in the jsdom environment
    global.TextEncoder = TextEncoder;
    // @ts-ignore
    global.TextDecoder = TextDecoder;

    // injects the mock extension into the page for the signer-provider to use
    await injectExtension(enableFn, { name: 'mockExtension', version: '1.0.0' });    

    // start up a test chain environment
    console.log("Starting up test chain. This can take around 1 minute..");
    const response = await up(false);
    url = response.node.url;
    console.log("Test chain running at ", url);

    const wrapperDir = path.resolve(__dirname, "../");

    const buildOutput = await runCLI({
      args: ["build"],
      cwd: wrapperDir
    });

    if (buildOutput.exitCode !== 0) {
      throw Error(
        `Failed to build wrapper:\n` +
        JSON.stringify(buildOutput, null, 2)
      );
    }

    client = new PolywrapClient({
      plugins: [
        {
          uri: "ens/substrate-signer-provider.chainsafe.eth",
          plugin: substrateSignerProviderPlugin({})
        }
      ]
    });
  });

  afterAll(async () => {
    await down();
  })

  it("blockHash", async () => {
    const result = await Substrate_Module.blockHash({
        url,
        number: 0
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    console.log(result.data);
  });

  it("retrieves genesis block parent hash is 00000", async () => {
    const result = await Substrate_Module.chainGetBlock({
        url,
        number: 0
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    const block: Substrate_BlockOutput = result.data!;
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

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const chainMetadata: Substrate_ChainMetadata = result.data!;
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

    expect(result.data).toBeTruthy();
    expect(result.error).toBeFalsy();
    const runtimeVersion: Substrate_RuntimeVersion = result.data!;
    expect(runtimeVersion.spec_name).toStrictEqual("forum-node");
    expect(runtimeVersion.impl_name).toStrictEqual("forum-node");
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

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeFalsy();
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

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toStrictEqual([
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

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    const methods = result.data!;
    //There are 85 rpc methods exposed in `examples/substrate-note-template`
    expect(methods.length).toStrictEqual(85);
  });

  it("get storage maps", async () => {
    const result = await Substrate_Module.getStorageMap({
        url,
        pallet: "ForumModule",
        storage: "AllPosts",
        key: "0",
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result).toBeTruthy();
  });


  it("get storage maps paged", async () => {
    const result = await Substrate_Module.getStorageMapPaged({
        url,
        pallet: "ForumModule",
        storage: "AllPosts",
        count: 10,
        nextTo: null,
      },
      client,
      uri
    );

    expect(result.error).toBeFalsy();
    expect(result).toBeTruthy();
  });

  const aliceAddr = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

  it("get account info of Alice from chain", async () => {
    const result = await Substrate_Module.accountInfo({
        url,
        //Alice account
        account: aliceAddr,
      },
      client,
      uri
    );

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const account_info: Substrate_AccountInfo = result.data!;
    console.log("account info: ", account_info);
  });

it("can get signer-provider managed accounts. Returns Alice", async () => {
    const result = await Substrate_Module.getSignerProviderAccounts(
      {},
      client,
      uri
    );

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(result.data).toStrictEqual([
      {
        address: aliceAddr,
        meta: { genesisHash: null, name: 'alice', source: 'mockExtension' },
        type: 'sr25519'
      }
    ]);
  });  

  // This is a known good payload taken from polkadot-js tests
  const testExtrinsic: SignerPayload = {
    address: aliceAddr,
    blockHash: "0x661f57d206d4fecda0408943427d4d25436518acbff543735e7569da9db6bdd7",
    blockNumber: 99,
    era: "0x0000",
    genesisHash: "0x91820de8e05dc861baa91d75c34b23ac778f5fb4a88bd9e8480dbe3850d19a26",
    method: "0x09003022737570206e657264732122",
    nonce: 0,
    specVersion: 100,
    tip: "0", // BigInt is just a string in polywrap
    transactionVersion: 1,
    signedExtensions: [],
    version: 4,
  }

  it("can sign using extension provider and get same signature as using polkadot-js directly", async () => {
    const result = await Substrate_Module.sign(
      {
        extrinsic: testExtrinsic
      },
      client,
      uri
    );

    expect(result).toBeTruthy();
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    // check signature is the same as if just signing in javascript
    const registry = new TypeRegistry();
    const encodedPayload = registry
      .createType('ExtrinsicPayload', testExtrinsic, { version: testExtrinsic.version })
      .toHex();
    expect(isValidSignature(encodedPayload, result.data?.signature!, aliceAddr))
  });

  it("Can send a signed extrinsic to the chain", async () => {
     const signerResult = await Substrate_Module.sign(
      {
        extrinsic: testExtrinsic
      },
      client,
      uri
    );
    const signedPayload = signerResult.data!;

    const sendResult = await Substrate_Module.send(
      {
        url,
        signedExtrinsic: signedPayload
      },
      client,
      uri
    );

    expect(sendResult).toBeTruthy();
    expect(sendResult.error).toBeFalsy();
    expect(sendResult.data).toBeTruthy();

  });

  async function isValidSignature(signedMessage: string, signature: string, address: string): Promise<boolean> {
    await cryptoWaitReady();
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);
    return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
  }
});
