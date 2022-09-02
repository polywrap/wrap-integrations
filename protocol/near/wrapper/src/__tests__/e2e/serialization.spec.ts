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
import {
  Interface_AccessKey,
  Interface_PublicKey,
  Interface_Transaction as Transaction,
} from "../../wrap";

jest.setTimeout(360000);

describe("Amount format", () => {
  let client: PolywrapClient;

  let nearWrapperUri: string;
  let borshWrapperUri: string;

  let nearConfig: NearPluginConfig;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  let contractId: string;

  /*   const prepActions = (): Action[] => {
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
  }; */

  beforeAll(async () => {
    // set up test env and deploy api
    await initTestEnvironment();
    const nearPath = __dirname + "/../../../build";
    const borshPath = __dirname + "/../../../../borsh-wrapper/build";
    nearWrapperUri = `fs/${nearPath}`;
    borshWrapperUri = `fs/${borshPath}`;
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

  async function getPkey(): Promise<Interface_PublicKey> {
    const { data } = await client.invoke<Interface_PublicKey>({
      uri: nearWrapperUri,
      method: "getPublicKey",
      args: {
        accountId: workingAccount.accountId,
      },
    });
    return data!;
  }

  function fullAccesKey(): Interface_AccessKey {
    return {
      //@ts-ignore
      nonce: "0",
      //@ts-ignore
      permission: {
        isFullAccess: true,
      },
    };
  }

  /*   function functionCallAccessKey(): Interface_AccessKey {
    return {
      //@ts-ignore
      nonce: "0",
      permission: {
        isFullAccess: false,
        //@ts-ignore
        allowance: "3242342134",
        methodNames: ["hello", "world"],
        receiverId: "john",
      },
    };
  } */

  afterAll(async () => {
    await stopTestEnvironment();
  });

  /* 
  test("should serialize equally", async () => {
    //const publicKey = await getPkey();
    //const { accessKey } = await getAccessKey();

    //console.log("pkl", publicKey);
    //console.log('accessKey', accessKey);

    const tx = await client.invoke<Transaction>({
      uri: nearWrapperUri,
      method: "createTransaction",
      args: {
        signerId: workingAccount.accountId,
        receiverId: contractId,
        actions: [
          //{ publicKey: publicKey, accessKey: accessKey }, // addKey (fullAccess)
          //{ publicKey: publicKey, accessKey: accessKey }, // addKey (functionCallAccessKey)
          //{}, //createAccount
          //{ code: Uint8Array.from([1, 4, 6, 8]) }, //deployContract
           {
            methodName: "hello",
            args: Uint8Array.from([1, 4, 6, 8]),
            gas: "249",
            deposit: "256",
          }, 
          //functionCall
          //{ deposit: "9891336751524540000000" }, //TODO: u128 support; testValue = 340282366920938463463374607431768211454 //transfer   // 9891336751524540000000
           {
            stake: "254",
            publicKey: publicKey,
          }, //stake 
          //{ publicKey }, //deleteKey
          //{ beneficiaryId: workingAccount.accountId }, // deleteAccount 
        ],
      },
    });

    const transaction = tx.data;

    console.log("createdTx", transaction);

    const {
      data: tsSerialize,
      error: errorTs,
    } = await client.invoke<Uint8Array>({
      uri: nearWrapperUri,
      method: "tsSerialize",
      args: {
        transaction: transaction,
      },
    });

    const { data: asSerialize, error } = await client.invoke<Uint8Array>({
      uri: borshWrapperUri,
      method: "serializeTransaction",
      args: {
        transaction: transaction,
      },
    });

    const toActions = 161;

    //const toPk = toActions + 36;
    error && console.log(error);
    errorTs && console.log("errorTs", errorTs);

    console.log("tsSerialize-arr", tsSerialize?.slice(toActions));
    console.log("asSerialize-arr", asSerialize?.slice(toActions));

    expect(tsSerialize).toEqual(asSerialize);
    //@ts-ignore
    //console.log("tsSerialize-buffer", tsSerialize!.buffer);
    //@ts-ignore
    // console.log("asSerialize-buffer", asSerialize!.buffer);
  });
  */

  test("should deserialize equally", async () => {
    const publicKey = await getPkey();
    const accessKey = fullAccesKey();

    const { data: transaction } = await client.invoke<Transaction>({
      uri: nearWrapperUri,
      method: "createTransaction",
      args: {
        signerId: workingAccount.accountId,
        receiverId: contractId,
        actions: [
          {}, //createAccount
          { publicKey: publicKey, accessKey: accessKey }, // addKey (fullAccess)
          { publicKey: publicKey, accessKey: accessKey }, // addKey (functionCallAccessKey)
          { code: Uint8Array.from([1, 4, 6, 8]) }, //deployContract
          {
            methodName: "hello",
            args: Uint8Array.from([1, 4, 6, 8]),
            gas: "249",
            deposit: "256",
          },
          //functionCall
          { deposit: "9891336751524540000000" }, //TODO: u128 support; testValue = 340282366920938463463374607431768211454 //transfer   // 9891336751524540000000
          {
            stake: "254",
            publicKey: publicKey,
          }, //stake
          { publicKey }, //deleteKey
          { beneficiaryId: workingAccount.accountId }, // deleteAccount
        ],
      },
    });

    console.log("Transaction", transaction);

    const {
      data: txBytes,
      error: serializationError,
    } = await client.invoke<Uint8Array>({
      uri: borshWrapperUri,
      method: "serializeTransaction",
      args: { transaction },
    });

    serializationError &&
      console.log("Serialization error", serializationError);

    console.log("serializedBytes", txBytes);

    const {
      data: deserializedTransaction,
      error: deserializationError,
    } = await client.invoke<Uint8Array>({
      uri: borshWrapperUri,
      method: "deserializeTransaction",
      args: { transactionBytes: txBytes },
    });
    deserializationError &&
      console.log("Deserialization error", deserializationError);

    console.log("Deserialized Transaction", deserializedTransaction);

    expect(deserializedTransaction).toEqual(transaction);
  });
});
