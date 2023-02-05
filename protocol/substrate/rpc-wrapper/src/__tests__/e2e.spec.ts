import { Substrate_Module } from "./wrap";
import { mockExtension, address } from "./mockExtension";
import { substrateSignerProviderPlugin } from "substrate-signer-provider-plugin-js";
import { InvokeResult, PolywrapClient } from "@polywrap/client-js";
import { TextEncoder, TextDecoder } from "util";
import path from "path";
import { ApiPromise } from "@polkadot/api";

jest.setTimeout(360000);
const url = "http://0.0.0.0:9933";

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


  it("Can submit a signed extrinsic to the chain", async () => {
    const api = await ApiPromise.create({
      types: {
        BalancesTransfer: {
          dest: "MultiAddress",
          value: "Compact<u128>",
        }
      },
      throwOnConnect: true
    });

    const BOB_SS58 = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
    const bobBalanceBefore = await balanceOf(api, BOB_SS58);
    const balancesTransfer = api.registry.createType("BalancesTransfer",  { dest: BOB_SS58, value: 1000000 } );
    const ex = await Substrate_Module.sign(
      {
        url,
        signer: address,
        pallet_name: "Balances",
        call_name: "transfer",
        call_params: balancesTransfer.toHex(),
      },
      client,
      uri
    );

    const xt = checkInvokeResult(ex);
    const result = await Substrate_Module.submit({ url, signedExtrinsic: String(xt)}, client, uri);
    checkInvokeResult(result);

    // Wait for finalized.
    await new Promise((r) => setTimeout(r, 10000));
    const bobBalanceAfter = await balanceOf(api, BOB_SS58);
    expect(bobBalanceAfter).toBeGreaterThan(bobBalanceBefore);

    await api.disconnect();
  });

  async function balanceOf(api: ApiPromise, address: string) {
    const info = await api.query.system.account(address);
    return Number((info as any).toJSON().data.free);
  }

  function checkInvokeResult<T>(result: InvokeResult<T>): T {
    if (!result.ok) fail(result.error);
    expect(result.ok).toBeTruthy();
    expect(result.value).toBeTruthy();
    return result.value;
  }
});


