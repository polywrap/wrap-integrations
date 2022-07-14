import { PolywrapClient } from "@polywrap/client-js";
import { nearPlugin, NearPluginConfig } from "..";
import { PublicKey } from "../wrap";
import "localstorage-polyfill";
import * as testUtils from "./testUtils";
import * as nearApi from "near-api-js";
import { KeyPair } from "near-api-js";

import BN from "bn.js";
const MockBrowser = require("mock-browser").mocks.MockBrowser;

import { HELLO_WASM_METHODS } from "./testUtils";

jest.setTimeout(360000);

describe("e2e", () => {
  const mock = new MockBrowser();

  let client: PolywrapClient;
  const uri = "wrap://ens/near.web3api.eth";

  let config: NearPluginConfig;

  global["document"] = mock.getDocument();
  global["window"] = mock.getWindow();
  global["localStorage"] = localStorage;

  let walletConnection: nearApi.WalletConnection;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  let contractId: string;

  beforeAll(async () => {
    config = await testUtils.setUpTestConfig();
    near = await nearApi.connect(config);
    client = new PolywrapClient({
      plugins: [
        {
          uri: uri,
          plugin: nearPlugin(config),
        },
      ],
    });
  });

  beforeEach(async () => {
    // set up contract account
    contractId = testUtils.generateUniqueString("test");
    workingAccount = await testUtils.createAccount(near);
    await testUtils.deployContract(workingAccount, contractId);
    // set up access key
    const keyPair = KeyPair.fromRandom("ed25519");
    await workingAccount.addKey(
      keyPair.getPublicKey(),
      contractId,
      HELLO_WASM_METHODS.changeMethods,
      new BN("2000000000000000000000000")
    );
    await config.keyStore!.setKey(
      testUtils.networkId,
      workingAccount.accountId,
      keyPair
    );
    walletConnection = await new nearApi.WalletConnection(near, "polywrap");
  });

  test("Should request sign transactions", async () => {
    const BLOCK_HASH = "244ZQ9cgj3CQ6bWBdytfrJMuMQ1jdXLFGnr4HhvtCTnM";
    const blockHash = nearApi.utils.serialize.base_decode(BLOCK_HASH);

    const actions = [nearApi.transactions.transfer(new BN("1"))];
    function createTransferTx() {
      return nearApi.transactions.createTransaction(
        "test.near",
        nearApi.utils.PublicKey.fromString(
          "Anu7LYDfpLtkP7E16LT9imXF694BdQaa9ufVkQiwTQxC"
        ),
        "whatever.near",
        1,
        actions,
        blockHash
      );
    }
    const transfer = createTransferTx();
    await walletConnection.requestSignTransactions({
      transactions: [transfer],
      callbackUrl: window.location.href,
      meta: "",
    });

    const result = await client.invoke<Boolean>({
      uri,
      method: "requestSignTransactions",
      args: {
        transactions: [transfer],
        callbackUrl: "",
        meta: "",
      }
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toEqual(true);
  });

  test("Should create key", async () => {
    const result = await client.invoke<Promise<PublicKey>>({
      uri,
      method: "createKey",
      args: {
        accountId: testUtils.testAccountId,
        networkId: config.networkId,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result).toBeTruthy();
    const requestSuccess = result.data as Promise<PublicKey>;
    expect((await requestSuccess).data).toBeInstanceOf(Uint8Array);
    expect((await requestSuccess).keyType).toEqual(0);
    const key = await near.connection.signer.getPublicKey(
      testUtils.testAccountId,
      config.networkId
    );
    expect(await requestSuccess).toEqual(key);
  });
});
