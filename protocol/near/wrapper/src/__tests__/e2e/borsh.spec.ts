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
  Interface_Action,
  Interface_PublicKey,
  Interface_Transaction as Transaction,
  SignTransactionResult,
} from "../../wrap";
import { fromSignedTx, fromTx } from "../nearTypeUtils";
import { SignedTransaction } from "../tsTypes";

jest.setTimeout(360000);

describe("Amount format", () => {
  let client: PolywrapClient;

  let nearWrapperUri: string;
  let borshWrapperUri: string;

  let nearConfig: NearPluginConfig;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  let contractId: string;

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

  function functionCallAccessKey(): Interface_AccessKey {
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
  }

  const prepActions = (
    publicKey: Interface_PublicKey
  ): Partial<Interface_Action>[] => {
    return [
      {}, //createAccount
      { publicKey: publicKey, accessKey: fullAccesKey() }, // addKey (fullAccess)
      { publicKey: publicKey, accessKey: functionCallAccessKey() }, // addKey (functionCallAccessKey)
      { code: Uint8Array.from([1, 4, 6, 8]) }, //deployContract
      {
        methodName: "hello",
        args: Uint8Array.from([1, 4, 6, 8]),
        //@ts-ignore
        gas: "249",
        //@ts-ignore
        deposit: "256",
      },
      //@ts-ignore
      { deposit: "9891336751524540000000" }, //functionCall
      {
        //@ts-ignore
        stake: "254",
        publicKey: publicKey,
      }, //stake
      { publicKey: publicKey }, //deleteKey
      { beneficiaryId: workingAccount.accountId }, // deleteAccount
    ];
  };

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

  afterAll(async () => {
    await stopTestEnvironment();
  });

  test("should serialize unsigned transaction with every action near-borsh-ts-like", async () => {
    const publicKey = await getPkey();

    const { data: transaction } = await client.invoke<Transaction>({
      uri: nearWrapperUri,
      method: "createTransaction",
      args: {
        signerId: workingAccount.accountId,
        receiverId: contractId,
        actions: prepActions(publicKey),
      },
    });

    //console.log("createdTx", transaction);

    const buffer = nearApi.utils.serialize.serialize(
      nearApi.transactions.SCHEMA,
      fromTx(transaction!)
    );
    const tsSerialize = Uint8Array.from(buffer);

    const { data: asSerialize, error } = await client.invoke<Uint8Array>({
      uri: borshWrapperUri,
      method: "serializeTransaction",
      args: {
        transaction: transaction,
      },
    });

    error && console.log(error);

    //console.log(Uint8Array.from(tsSerialize));
    //console.log(asSerialize);

    expect(tsSerialize).toEqual(asSerialize);
  });

  test("should serialize signed transaction with every action near-borsh-ts-like", async () => {
    const publicKey = await getPkey();

    const { data: transaction } = await client.invoke<Transaction>({
      uri: nearWrapperUri,
      method: "createTransaction",
      args: {
        signerId: workingAccount.accountId,
        receiverId: contractId,
        actions: prepActions(publicKey),
      },
    });

    const {
      data: signedTransactionResult,
    } = await client.invoke<SignTransactionResult>({
      uri: nearWrapperUri,
      method: "signTransaction",
      args: { transaction: transaction },
    });

    const buffer = nearApi.utils.serialize.serialize(
      nearApi.transactions.SCHEMA,
      fromSignedTx(signedTransactionResult!.signedTx)
    );
    const tsSerializeSigned = Uint8Array.from(buffer);

    const { data: asSerializeSigned, error } = await client.invoke<Uint8Array>({
      uri: borshWrapperUri,
      method: "serializeSignedTransaction",
      args: {
        signedTransaction: signedTransactionResult!.signedTx,
      },
    });

    error && console.log(error);

    expect(tsSerializeSigned).toEqual(asSerializeSigned);
  });

  test("should deserialize unsigned transaction", async () => {
    const publicKey = await getPkey();

    const { data: transaction } = await client.invoke<Transaction>({
      uri: nearWrapperUri,
      method: "createTransaction",
      args: {
        signerId: workingAccount.accountId,
        receiverId: contractId,
        actions: prepActions(publicKey),
      },
    });

    const buffer = nearApi.utils.serialize.serialize(
      nearApi.transactions.SCHEMA,
      fromTx(transaction!)
    );
    const tsSerialized = Uint8Array.from(buffer);

    const { data: asDeserialize } = await client.invoke<Transaction>({
      uri: borshWrapperUri,
      method: "deserializeTransaction",
      args: {
        transactionBytes: tsSerialized,
      },
    });

    const tsDeserialized = nearApi.utils.serialize.deserialize(
      nearApi.transactions.SCHEMA,
      nearApi.transactions.Transaction,
      Buffer.from(buffer)
    );

    expect(asDeserialize?.signerId).toEqual(tsDeserialized.signerId);
    expect(asDeserialize?.blockHash).toEqual(tsDeserialized.blockHash);
    expect(asDeserialize?.nonce.toString()).toEqual(
      tsDeserialized.nonce.toString()
    );
    expect(asDeserialize?.publicKey).toEqual(tsDeserialized.publicKey);
    expect(asDeserialize?.receiverId).toEqual(tsDeserialized.receiverId);
    expect(asDeserialize?.actions.length).toEqual(
      tsDeserialized.actions.length
    );
  });

  test("should deserialize signed Transaction", async () => {
    const publicKey = await getPkey();

    const { data: transaction } = await client.invoke<Transaction>({
      uri: nearWrapperUri,
      method: "createTransaction",
      args: {
        signerId: workingAccount.accountId,
        receiverId: contractId,
        actions: prepActions(publicKey),
      },
    });

    const {
      data: signedTransactionResult,
    } = await client.invoke<SignTransactionResult>({
      uri: nearWrapperUri,
      method: "signTransaction",
      args: { transaction: transaction },
    });

    const buffer = nearApi.utils.serialize.serialize(
      nearApi.transactions.SCHEMA,
      fromSignedTx(signedTransactionResult!.signedTx)
    );
    const tsSerializeSigned = Uint8Array.from(buffer);

    const { data: asDeserialize } = await client.invoke<SignedTransaction>({
      uri: borshWrapperUri,
      method: "deserializeSignedTransaction",
      args: {
        signedTxBytes: tsSerializeSigned,
      },
    });

    const tsDeserializeSigned = nearApi.utils.serialize.deserialize(
      nearApi.transactions.SCHEMA,
      nearApi.transactions.SignedTransaction,
      Buffer.from(buffer)
    );

    expect(asDeserialize?.signature).toEqual(tsDeserializeSigned.signature);
    expect(asDeserialize?.transaction.blockHash).toEqual(
      tsDeserializeSigned.transaction.blockHash
    );
    expect(asDeserialize?.transaction.nonce.toString()).toEqual(
      tsDeserializeSigned.transaction.nonce.toString()
    );
    expect(asDeserialize?.transaction.publicKey).toEqual(
      tsDeserializeSigned.transaction.publicKey
    );
    expect(asDeserialize?.transaction.receiverId).toEqual(
      tsDeserializeSigned.transaction.receiverId
    );
    expect(asDeserialize?.transaction.actions.length).toEqual(
      tsDeserializeSigned.transaction.actions.length
    );
  });
});
