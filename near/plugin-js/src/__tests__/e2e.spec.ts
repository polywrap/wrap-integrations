// import url from "url";
import { Web3ApiClient } from "@web3api/client-js";
import { nearPlugin, NearPluginConfig } from "..";
// import { LocalStorage } from "ts-localstorage";
import * as testUtils from "./testUtils";
import * as nearApi from "near-api-js";
import { KeyPair } from "near-api-js";
import BN from "bn.js";
import { HELLO_WASM_METHODS } from "./testUtils";
//import { Signature } from "../w3";

jest.setTimeout(360000);

describe("e2e", () => {
  // @ts-ignore
  let client: Web3ApiClient;
  const uri = "w3://ens/near.web3api.eth";
  // let localStorage: any = LocalStorage;
  let config: NearPluginConfig;
  // let history: [any, any, any];
  // let nearFake: any;
  // @ts-ignore
  // global.document = {
  //   title: "documentTitle",
  // };
  // @ts-ignore
  // global.window = {
  //   localStorage,
  // };

  let lastRedirectUrl: any;
  // @ts-ignore
  // !!!
  let walletConnection: nearApi.WalletConnection;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  // let keyStore = new nearApi.keyStores.InMemoryKeyStore();
  let contractId: string;
  //let contract: nearApi.Contract;
  // const prepActions = (): Action[] => {
  //   const setCallValue = testUtils.generateUniqueString("setCallPrefix");
  //   const args = { value: setCallValue };
  //   const stringify = (obj: unknown): Buffer =>
  //     Buffer.from(JSON.stringify(obj));
  //   return [
  //     {
  //       methodName: "setValue",
  //       args: stringify(args),
  //       gas: "3000000000000",
  //       deposit: "0",
  //     },
  //   ];
  // };

  beforeAll(async () => {
    config = await testUtils.setUpTestConfig();
    near = await nearApi.connect(config);
    client = new Web3ApiClient({
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
    await config.keyStore.setKey(
      testUtils.networkId,
      workingAccount.accountId,
      keyPair
    );
    lastRedirectUrl = null;

/*     Object.assign(global.window, {
      location: {
        href: "http://example.com/location",
        assign(url: any) {
          lastRedirectUrl = url;
        },
      },
      history: {
        replaceState: (state: any, title: any, url: any) =>
          history.push([state, title, url]),
      },
    }); */
  });

  it("Request sign transactions", async () => {
    walletConnection = new nearApi.WalletConnection(near, null);

    console.log("walletConnection", walletConnection); // undefined

    const BLOCK_HASH = "244ZQ9cgj3CQ6bWBdytfrJMuMQ1jdXLFGnr4HhvtCTnM";
    const blockHash = nearApi.utils.serialize.base_decode(BLOCK_HASH);

    function createTransferTx() {
      const actions = [nearApi.transactions.transfer(new BN("0.000001"))];
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
      meta: "something",
      callbackUrl: "http://example.com/after",
    });

    const result = await client.query<{ requestSignTransactions: Boolean }>({
      uri,
      query: `query {
      requestSignTransactions(
        transactions:$transactions
        callbackUrl:$callbackUrl
        meta:$meta
      )
    }`,
      variables: {
        transactions: [transfer],
        callbackUrl: "",
        meta: "",
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const requsetSuccess: Boolean = result.data!.requestSignTransactions;
    expect(requsetSuccess).toEqual(true);
    /*   expect(url.parse(lastRedirectUrl, true)).toMatchObject({
      protocol: "http:",
      host: "example.com",
      query: {
        meta: "something",
        callbackUrl: "http://example.com/after",
        transactions:
          "CQAAAHRlc3QubmVhcgCRez0mjUtY9/7BsVC9aNab4+5dTMOYVeNBU4Rlu3eGDQEAAAAAAAAADQAAAHdoYXRldmVyLm5lYXIPpHP9JpAd8pa+atxMxN800EDvokNSJLaYaRDmMML+9gEAAAADAQAAAAAAAAAAAAAAAAAAAA==",
      },
    }); */
  });

  /*   it("Sign a message", async () => {
    const message = Buffer.from(generateUniqueString("msg"));

    const keyPair = await config.keyStore.getKey(
      config.networkId,
      workingAccount.accountId
    );

    const { signature: signatureToVerify } = keyPair.sign(message);

    const isValid = keyPair.verify(message, signatureToVerify);

    const result = await client.query<{ signMessage: Signature }>({
      uri,
      query: `query {
      signMessage(
        message: $message
        signerId: $signerId
      )
    }`,
      variables: {
        message: message,
        signerId: workingAccount.accountId,
      },
    });

    expect(isValid).toBeTruthy();

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const signature: Signature = result.data!.signMessage;
    expect(signature.data).toBeTruthy();
    expect(signature.data).toBeInstanceOf(Uint8Array);
    expect(signature.keyType).toBeDefined();
  }); */

  /*  it("Creates a transaction without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.query<{ createTransaction: Transaction }>({
      uri,
      query: `query {
        createTransaction(
          receiverId: $receiverId
          actions: $actions
          signerId: $signerId
        )
      }`,
      variables: {
        receiverId: contractId,
        actions: actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();
    const transaction: Transaction = result.data!.createTransaction;
    expect(transaction.signerId).toEqual(workingAccount.accountId);
    expect(transaction.publicKey).toBeTruthy();
    expect(transaction.nonce).toBeTruthy();
    expect(transaction.receiverId).toBeTruthy();
    expect(transaction.blockHash).toBeTruthy();
    expect(transaction.actions).toEqual(actions);
  }); */

  /* it("Signs a transaction without wallet", async () => {
    // create transaction
    const actions: Action[] = prepActions();
    const txQuery = await client.query<{ createTransaction: Transaction }>({
      uri,
      query: `query {
        createTransaction(
          receiverId: $receiverId
          actions: $actions
          signerId: $signerId
        )
      }`,
      variables: {
        receiverId: contractId,
        actions: actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(txQuery.errors).toBeFalsy();
    expect(txQuery.data).toBeTruthy();
    const transaction: Transaction = txQuery.data!.createTransaction;
    const result = await client.query<{
      signTransaction: SignTransactionResult;
    }>({
      uri,
      query: `query {
        signTransaction(
          transaction: $transaction
        )
      }`,
      variables: {
        transaction: transaction,
      },
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();
    const signedTx = result.data!.signTransaction.signedTx;
    const txHash = result.data!.signTransaction.hash;
    expect(signedTx.transaction.signerId).toEqual(workingAccount.accountId);
    expect(signedTx.transaction.publicKey).toBeTruthy();
    expect(signedTx.transaction.nonce).toBeTruthy();
    expect(signedTx.transaction.receiverId).toBeTruthy();
    expect(signedTx.transaction.blockHash).toBeTruthy();
    expect(signedTx.transaction.actions).toEqual(actions);
    expect(txHash).toBeTruthy();
  }); */

  /*   it("creates, signs, sends, and awaits mining of a transaction without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.query<{ signAndSendTransaction: FinalExecutionOutcome }>({
      uri,
      query: `mutation {
        signAndSendTransaction(
          receiverId: $receiverId
          actions: $actions
          signerId: $signerId
        )
      }`,
      variables: {
        receiverId: contractId,
        actions: actions,
        signerId: workingAccount.accountId,
      }
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();
  
    const status: ExecutionStatus = result.data!.signAndSendTransaction.status;
    expect(status.successValue).toBeTruthy();
    expect(status.failure).toBeFalsy();
    const transaction: Transaction = result.data!.signAndSendTransaction.transaction;
    expect(transaction.signerId).toEqual(workingAccount.accountId);
    expect(transaction.publicKey).toBeTruthy();
    expect(transaction.nonce).toBeTruthy();
    expect(transaction.receiverId).toBeTruthy();
    expect(transaction.hash).toBeTruthy();
    // expect(transaction.actions).toEqual(actions);
    const txOutcome: ExecutionOutcomeWithId = result.data!.signAndSendTransaction.transaction_outcome;
    expect(txOutcome.id).toBeTruthy();
    expect(txOutcome.outcome.status.successReceiptId).toBeTruthy();
    expect(txOutcome.outcome.status.failure).toBeFalsy();
    const receiptsOutcome: ExecutionOutcomeWithId[] = result.data!.signAndSendTransaction.receipts_outcome;
    expect(receiptsOutcome.length).toBeGreaterThan(0);
  }); */

  /* it("creates, signs, and sends a transaction asynchronously without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.query<{ signAndSendTransactionAsync: string }>({
      uri,
      query: `mutation {
        signAndSendTransactionAsync(
          receiverId: $receiverId
          actions: $actions
          signerId: $signerId
        )
      }`,
      variables: {
        receiverId: contractId,
        actions: actions,
        signerId: workingAccount.accountId,
      }
    });
    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();
  
    const txHash: string = result.data!.signAndSendTransactionAsync;
    expect(txHash).toBeTruthy();
  }); */
});
