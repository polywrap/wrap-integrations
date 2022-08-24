import {
  FinalExecutionOutcome,
  //SignTransactionResult,
  //Transaction,
  Action,
} from "../tsTypes";
import * as testUtils from "../testUtils";
import { NearPluginConfig } from "../../../../plugin-js/build";

import * as nearApi from "near-api-js";
import { PolywrapClient } from "@polywrap/client-js";
import {
  ensAddresses,
  initTestEnvironment,
  providers,
  stopTestEnvironment,
} from "@polywrap/test-env-js";

jest.setTimeout(360000);

describe("Amount format", () => {
  let client: PolywrapClient;
  let apiUri: string;

  let nearConfig: NearPluginConfig;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  let contractId: string;

  const prepActions = (): Action[] => {
    return [
      {
        methodName: "setValue",
        args: Buffer.from(
          JSON.stringify({
            value: testUtils.generateUniqueString("setCallPrefix"),
          })
        ),
        gas: "3000000000000",
        deposit: "0",
      },
      {
        deposit: "124234",
      },
      {
        beneficiaryId: "sdafsadf",
      },
      //{},
    ];
  };

  beforeAll(async () => {
    // set up test env and deploy api
    await initTestEnvironment();
    const absPath = __dirname + "/../../../build";
    apiUri = `fs/${absPath}`;
    // set up client
    nearConfig = await testUtils.setUpTestConfig();
    near = await nearApi.connect(nearConfig);

    const polywrapConfig = testUtils.getPlugins(
      providers.ethereum,
      ensAddresses.ensAddress,
      providers.ipfs,
      nearConfig
    );
    client = new PolywrapClient(polywrapConfig);

    // set up contract account
    contractId = testUtils.generateUniqueString("test");
    workingAccount = await testUtils.createAccount(near);
    await testUtils.deployContract(workingAccount, contractId);
  });

  /*   async function getPkey(): Promise<Near_PublicKey> {
    const { data } = await client.invoke<Near_PublicKey>({
      uri: apiUri,
      method: "getPublicKey",
      args: {
        accountId: workingAccount.accountId,
      },
    });
    return data!;
  } */

  afterAll(async () => {
    await stopTestEnvironment();
  });

  /* test("Should sign transaction", async () => {
    const actions: Action[] = prepActions();

    const tx = await client.invoke<Transaction>({
      uri: apiUri,
      method: "createTransaction",
      args: {
        receiverId: contractId,
        actions,
        signerId: workingAccount.accountId,
      },
    });

    expect(tx.error).toBeFalsy();
    expect(tx.data).toBeTruthy();

    const transaction = tx.data as Transaction;

    const result = await client.invoke<SignTransactionRes>({
      uri: apiUri,
      method: "testSign",
      args: {
        transaction,
      },
    });

    const result2 = await client.invoke<SignTransactionResult>({
      uri: apiUri,
      method: "signTransaction",
      args: {
        transaction,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    result.data &&
      console.log("testSign signature", result.data.signedTx.signature);
    result2.data &&
      console.log("sign signature", result2.data?.signedTx.signature);

    result.error && console.log(result.error);
    result2.error && console.log(result2.error);

    const signedTx = result.data?.signedTx;
    const hash = result.data?.hash;

    expect(signedTx?.transaction).toStrictEqual(transaction);
    expect(hash).toBeTruthy();
    expect(signedTx?.signature.data).toBeTruthy();
  });
 */
  test("Should create, sign, send, and await mining of a transaction without wallet", async () => {
    const actions: Action[] = prepActions();
    const result = await client.invoke<FinalExecutionOutcome>({
      uri: apiUri,
      method: "signAndSendTransaction",
      args: {
        receiverId: "polydev25.testnet",
        actions: [{ deposit: "10000" }] || actions,
        signerId: workingAccount.accountId,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    console.log("RESULT", result.data);
    const status = result.data?.status;
    expect(status?.SuccessValue).toBeTruthy();
    expect(status?.failure).toBeFalsy();
    const txOutcome = result.data?.transaction_outcome;
    expect(txOutcome?.id).toBeTruthy();
    expect(txOutcome?.outcome.status.SuccessReceiptId).toBeTruthy();
    expect(txOutcome?.outcome.status.failure).toBeFalsy();
    const receiptsOutcome = result.data?.receipts_outcome;
    expect(receiptsOutcome?.length).toBeGreaterThan(0);
  });

  /* test("should serialize equally", async () => {
    const publicKey = await getPkey();

    const tx = await client.invoke<Transaction>({
      uri: apiUri,
      method: "createTransaction",
      args: {
        receiverId: contractId,
        actions: [
          {}, //createAccount

          { code: Uint8Array.from([1, 4, 6, 8]) }, //deployContract

          {
            methodName: "hello",
            args: Uint8Array.from([1, 4, 6, 8]),
            gas: "249",
            deposit: "256",
          }, //functionCall

          { deposit: "255" }, //TODO: u128 support; testValue = 340282366920938463463374607431768211454 //transfer

          {
            stake: "254",
            publicKey: publicKey,
          }, //stake

          { publicKey }, //deleteKey

          { beneficiaryId: workingAccount.accountId }, // deleteAccount
        ],
        signerId: workingAccount.accountId,
      },
    });

    const transaction = tx.data;

    const { data: tsSerialize } = await client.invoke<Uint8Array>({
      uri: apiUri,
      method: "tsSerialize",
      args: {
        transaction: transaction,
      },
    });

    const { data: asSerialize, error } = await client.invoke<Uint8Array>({
      uri: apiUri,
      method: "asSerialize",
      args: {
        transaction: transaction,
      },
    });

    const toActions = 161;

    error && console.log(error);

    console.log("tsSerialize-arr", tsSerialize?.slice(toActions));
    console.log("asSerialize-arr", asSerialize?.slice(toActions));

    expect(tsSerialize).toEqual(asSerialize);
    //@ts-ignore
    //console.log("tsSerialize-buffer", tsSerialize!.buffer);
    //@ts-ignore
    // console.log("asSerialize-buffer", asSerialize!.buffer);
  }); */
});
