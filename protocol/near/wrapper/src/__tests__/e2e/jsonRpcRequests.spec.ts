import { NearPluginConfig } from "../../../../plugin-js";
import {
  BlockChangeResult,
  NearProtocolConfig,
  ChangeResult,
  IdType,
  NodeStatusResult,
  FinalExecutionOutcome,
} from "../tsTypes";
import * as testUtils from "../testUtils";
import { LightClientProof, ChunkResult } from "../../wrap";

import type { Finality } from "near-api-js/lib/providers/provider";
import { PolywrapClient } from "@polywrap/client-js";
import * as nearApi from "near-api-js";
import { BlockResult as NearBlockResult } from "near-api-js/lib/providers/provider";
import {
  initTestEnvironment,
  stopTestEnvironment,
  providers,
  ensAddresses,
} from "@polywrap/test-env-js";

const BN = require("bn.js");

jest.setTimeout(360000);
jest.retryTimes(5);

describe("JSON RPC requests", () => {
  let client: PolywrapClient;
  let apiUri: string;

  let nearConfig: NearPluginConfig;
  let near: nearApi.Near;
  let workingAccount: nearApi.Account;
  let sender: nearApi.Account;
  let receiver: nearApi.Account;
  let contractId: string;
  let transactionOutcome: nearApi.providers.FinalExecutionOutcome;
  let latestBlock: NearBlockResult;

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
    latestBlock = await near.connection.provider.block({ finality: "final" });

    // set up contract account
    contractId = testUtils.generateUniqueString("test");
    workingAccount = await testUtils.createAccount(near);
    await testUtils.deployContract(workingAccount, contractId);

    sender = await testUtils.createAccount(near);
    receiver = await testUtils.createAccount(near);
    transactionOutcome = await sender.sendMoney(
      receiver.accountId,
      new BN("1")
    );
  });

  afterAll(async () => {
    await stopTestEnvironment();
    try {
      await sender.deleteAccount(testUtils.testAccountId);
      await receiver.deleteAccount(testUtils.testAccountId);
      await workingAccount.deleteAccount(testUtils.testAccountId);
    } catch (e) {
      console.log(e);
    }
  });

  test("Get node status", async () => {
    const result = await client.invoke<NodeStatusResult>({
      method: "status",
      uri: apiUri,
    });
    const status = result.data as NodeStatusResult;
    const nearStatus = await near.connection.provider.status();
    const nearStatusValidators = nearStatus.validators.map(
      ({ account_id }: any) => account_id
    );
    expect(result.error).toBeFalsy();
    expect(status).toBeTruthy();
    expect(status.chain_id).toBeTruthy();
    expect(status.rpc_addr).toBeTruthy();
    expect(status.sync_info).toBeTruthy();
    expect(status.validators).toBeTruthy();
    expect(status.version).toBeTruthy();
    expect(status.chain_id).toStrictEqual(nearStatus.chain_id);
    expect(status.rpc_addr).toStrictEqual(nearStatus.rpc_addr);
    expect(status.version.version).toStrictEqual(nearStatus.version.version);
    expect(status.validators.length).toStrictEqual(
      nearStatus.validators.length
    );
    expect(status.validators).toStrictEqual(nearStatusValidators);
    expect(status.sync_info.latest_block_hash).toStrictEqual(
      nearStatus.sync_info.latest_block_hash
    );
    expect(status.sync_info.latest_block_height).toStrictEqual(
      `${nearStatus.sync_info.latest_block_height}`
    );
    expect(status.sync_info.latest_block_time).toStrictEqual(
      nearStatus.sync_info.latest_block_time
    );
    expect(status.sync_info.latest_state_root).toStrictEqual(
      nearStatus.sync_info.latest_state_root
    );
    expect(status.sync_info.syncing).toStrictEqual(
      nearStatus.sync_info.syncing
    );
  });

  test("Should get gas price", async () => {
    const blockId = latestBlock.header.hash;
    const result = await client.invoke<BigInt>({
      uri: apiUri,
      method: "gasPrice",
      args: {
        blockId,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const gasPrice = result.data as BigInt;

    expect(gasPrice).toBeTruthy();

    const { gas_price } = await near.connection.provider.gasPrice(blockId);
    expect(gasPrice.toString()).toStrictEqual(gas_price);
  });

  test("Should get block changes", async () => {
    const blockQuery = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      block_id: latestBlock.header.hash,
      finality: null,
      syncCheckpoint: null,
    };
    const result = await client.invoke<BlockChangeResult>({
      uri: apiUri,
      method: "blockChanges",
      args: {
        blockQuery,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const blockChanges = result.data as BlockChangeResult;
    expect(blockChanges.block_hash).toBeTruthy();
    expect(blockChanges.changes).toBeInstanceOf(Array);

    const nearBlockChanges = await near.connection.provider.blockChanges({
      blockId: blockQuery.block_id!,
    });

    expect(blockChanges.block_hash).toStrictEqual(nearBlockChanges.block_hash);
    expect(blockChanges.changes.length).toEqual(
      nearBlockChanges.changes.length
    );
    //expect(blockChanges.changes).toEqual(nearBlockChanges.changes); //TODO change property changeType to type after https://github.com/polywrap/monorepo/issues/721
  });

  test("Should get protocol config", async () => {
    const blockReference = { finality: "final" as Finality };
    const result = await client.invoke<NearProtocolConfig>({
      uri: apiUri,
      method: "experimental_protocolConfig",
      args: {
        blockReference,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const protocolConfig = result.data as NearProtocolConfig;
    expect(protocolConfig).toBeTruthy();
    expect(protocolConfig.runtime_config).toBeTruthy();

    const nearProtocolConfig = await near.connection.provider.experimental_protocolConfig(
      blockReference
    );
    expect(protocolConfig.runtime_config.storage_amount_per_byte).toStrictEqual(
      nearProtocolConfig.runtime_config.storage_amount_per_byte
    );
  });

  test("JSON Rpc should fetch chunk info", async () => {
    const hash = latestBlock.chunks[0].chunk_hash;

    const result = await client.invoke<ChunkResult>({
      uri: apiUri,
      method: "chunk",
      args: {
        chunkId: hash,
      },
    });

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    const chunk = result.data as ChunkResult;

    expect(chunk.header.shard_id).toEqual("0");

    const nearChunk = await near.connection.provider.chunk(hash);

    expect(chunk.header.chunk_hash).toEqual(nearChunk.header.chunk_hash);
  });

  test("Should get lightClientProof", async () => {
    async function waitForStatusMatching(isMatching: any) {
      const MAX_ATTEMPTS = 10;
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        await testUtils.sleep(500);
        const nodeStatus = await near.connection.provider.status();
        if (isMatching(nodeStatus)) {
          return nodeStatus;
        }
      }
      throw new Error(
        `Exceeded ${MAX_ATTEMPTS} attempts waiting for matching node status.`
      );
    }

    const comittedStatus = await waitForStatusMatching(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      (status: any) =>
        status.sync_info.latest_block_hash !==
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        transactionOutcome.transaction_outcome?.block_hash
    );
    const BLOCKS_UNTIL_FINAL = 2;
    const finalizedStatus = await waitForStatusMatching(
      (status: any) =>
        status.sync_info.latest_block_height >
        comittedStatus.sync_info.latest_block_height + BLOCKS_UNTIL_FINAL
    );

    latestBlock = await near.connection.provider.block({
      blockId: finalizedStatus.sync_info.latest_block_hash,
    });
    const lightClientHead = latestBlock.header.last_final_block;

    const lightClientProofRequestBase = {
      light_client_head: lightClientHead,
      transaction_hash: transactionOutcome.transaction.hash!,
      sender_id: sender.accountId,
    };

    const wrapper_lightClientProofRequest = {
      type: 0,
      ...lightClientProofRequestBase,
    };

    const result = await client.invoke<LightClientProof>({
      uri: apiUri,
      method: "lightClientProof",
      args: {
        request: wrapper_lightClientProofRequest,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const lightClientProof = result.data as LightClientProof;
    expect(lightClientProof).toBeTruthy();
    expect(lightClientProof.block_header_lite).toBeTruthy();
    expect(lightClientProof.block_proof).toBeTruthy();

    expect("prev_block_hash" in lightClientProof.block_header_lite).toBe(true);
    expect("inner_rest_hash" in lightClientProof.block_header_lite).toBe(true);
    expect("inner_lite" in lightClientProof.block_header_lite).toBe(true);

    expect("block_hash" in lightClientProof.outcome_proof).toBe(true);

    const api_lightClientProofRequest = {
      type: IdType.Transaction,
      ...lightClientProofRequestBase,
    };

    const nearLightClientProof = await near.connection.provider.lightClientProof(
      api_lightClientProofRequest
    );

    //expect(lightClientProof.block_header_lite).toContain(nearLightClientProof.block_header_lite);
    expect(lightClientProof.block_proof).toEqual(
      nearLightClientProof.block_proof
    );
    //expect(lightClientProof.outcome_proof).toEqual(nearLightClientProof.outcome_proof);
    //expect(lightClientProof.outcome_root_proof).toEqual(nearLightClientProof.outcome_root_proof);
  });

  test("Should get access key changes", async () => {
    const blockQuery = {
      block_id: latestBlock.header.hash,
      finality: null,
      syncCheckpoint: null,
    };
    const accountIdArray = [workingAccount.accountId];
    const result = await client.invoke<ChangeResult>({
      uri: apiUri,
      method: "accessKeyChanges",
      args: {
        accountIdArray,
        blockQuery,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const accessKeyChanges = result.data as ChangeResult;
    expect(accessKeyChanges.block_hash).toBeTruthy();
    expect(accessKeyChanges.changes).toBeInstanceOf(Array);

    const nearBlockChanges = await near.connection.provider.accessKeyChanges(
      accountIdArray,
      {
        blockId: blockQuery.block_id,
      }
    );

    expect(accessKeyChanges.block_hash).toStrictEqual(
      nearBlockChanges.block_hash
    );
    expect(accessKeyChanges.changes.length).toEqual(
      nearBlockChanges.changes.length
    );
    expect(accessKeyChanges.changes).toEqual(nearBlockChanges.changes);
  });

  test("Should get account changes", async () => {
    const blockQuery = {
      block_id: latestBlock.header.hash,
      finality: null,
      syncCheckpoint: null,
    };
    const accountIdArray = [workingAccount.accountId];
    const result = await client.invoke<ChangeResult>({
      uri: apiUri,
      method: "accountChanges",
      args: {
        accountIdArray,
        blockQuery,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const accountChanges = result.data as ChangeResult;
    expect(accountChanges.block_hash).toBeTruthy();
    expect(accountChanges.changes).toBeInstanceOf(Array);

    const nearBlockChanges = await near.connection.provider.accountChanges(
      accountIdArray,
      {
        blockId: blockQuery.block_id,
      }
    );

    expect(accountChanges.block_hash).toStrictEqual(
      nearBlockChanges.block_hash
    );
    expect(accountChanges.changes.length).toEqual(
      nearBlockChanges.changes.length
    );
    expect(accountChanges.changes).toEqual(nearBlockChanges.changes);
  });

  test("Should get contract code changes", async () => {
    const blockQuery = {
      block_id: latestBlock.header.hash,
      finality: null,
      syncCheckpoint: null,
    };
    const accountIdArray = [workingAccount.accountId];
    const result = await client.invoke<ChangeResult>({
      uri: apiUri,
      method: "contractCodeChanges",
      args: {
        accountIdArray,
        blockQuery,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const contractCodeChanges = result.data as ChangeResult;
    expect(contractCodeChanges.block_hash).toBeTruthy();
    expect(contractCodeChanges.changes).toBeInstanceOf(Array);

    const nearBlockChanges = await near.connection.provider.contractCodeChanges(
      accountIdArray,
      {
        blockId: blockQuery.block_id,
      }
    );

    expect(contractCodeChanges.block_hash).toStrictEqual(
      nearBlockChanges.block_hash
    );
    expect(contractCodeChanges.changes.length).toEqual(
      nearBlockChanges.changes.length
    );
    expect(contractCodeChanges.changes).toEqual(nearBlockChanges.changes);
  });

  test("Should get contract state changes", async () => {
    const blockQuery = {
      block_id: latestBlock.header.hash,
      finality: null,
      syncCheckpoint: null,
    };
    const accountIdArray = [workingAccount.accountId];
    const keyPrefix = "";
    const result = await client.invoke<ChangeResult>({
      uri: apiUri,
      method: "contractStateChanges",
      args: {
        accountIdArray,
        blockQuery,
        keyPrefix,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const contractStateChanges = result.data as ChangeResult;
    expect(contractStateChanges.block_hash).toBeTruthy();
    expect(contractStateChanges.changes).toBeInstanceOf(Array);

    const nearBlockChanges = await near.connection.provider.contractStateChanges(
      accountIdArray,
      {
        blockId: blockQuery.block_id,
      },
      keyPrefix
    );

    expect(contractStateChanges.block_hash).toStrictEqual(
      nearBlockChanges.block_hash
    );
    expect(contractStateChanges.changes.length).toEqual(
      nearBlockChanges.changes.length
    );
    expect(contractStateChanges.changes).toEqual(nearBlockChanges.changes);
  });

  test("Should get single access key changes", async () => {
    const blockQuery = {
      block_id: latestBlock.header.hash,
      finality: null,
      syncCheckpoint: null,
    };
    const accessKeyArray = [
      {
        account_id: workingAccount.accountId,
        public_key: (
          await near.connection.signer.getPublicKey(
            workingAccount.accountId,
            testUtils.networkId
          )
        ).toString(),
      },
    ];
    const result = await client.invoke<ChangeResult>({
      uri: apiUri,
      method: "singleAccessKeyChanges",
      args: {
        accessKeyArray,
        blockQuery,
      },
    });
    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();

    const singleAccessKeyChanges: ChangeResult = result.data as ChangeResult;
    expect(singleAccessKeyChanges.block_hash).toBeTruthy();
    expect(singleAccessKeyChanges.changes).toBeInstanceOf(Array);

    const nearBlockChanges = await near.connection.provider.singleAccessKeyChanges(
      accessKeyArray,
      {
        blockId: blockQuery.block_id,
      }
    );

    expect(singleAccessKeyChanges.block_hash).toStrictEqual(
      nearBlockChanges.block_hash
    );
    expect(singleAccessKeyChanges.changes.length).toEqual(
      nearBlockChanges.changes.length
    );
    expect(singleAccessKeyChanges.changes).toEqual(nearBlockChanges.changes);
  });

  test("Should get txStatus with string hash", async () => {
    const result = await client.invoke<FinalExecutionOutcome>({
      uri: apiUri,
      method: "txStatus",
      args: {
        txHash: transactionOutcome.transaction.hash,
        accountId: sender.accountId,
      },
    });

    const nearTxStatus = await near.connection.provider.txStatus(
      transactionOutcome.transaction.hash,
      sender.accountId
    );
    const txStatus = result.data as FinalExecutionOutcome;
    const transactionOutcomeTxStatus = txStatus.transaction_outcome;
    const receiptsOutcomeFirst = txStatus.receipts_outcome[0].outcome;
    const receiptsOutcomeSecondary = txStatus.receipts_outcome[1].outcome;

    expect(result.error).toBeFalsy();
    expect(result.data).toBeTruthy();
    expect(receiptsOutcomeSecondary.gas_burnt).toEqual(
      `${nearTxStatus.receipts_outcome[1].outcome.gas_burnt}`
    );
    expect(receiptsOutcomeSecondary.receipt_ids).toEqual(
      nearTxStatus.receipts_outcome[1].outcome.receipt_ids
    );
    expect(receiptsOutcomeFirst.gas_burnt).toEqual(
      `${nearTxStatus.receipts_outcome[0].outcome.gas_burnt}`
    );
    expect(receiptsOutcomeFirst.receipt_ids).toEqual(
      nearTxStatus.receipts_outcome[0].outcome.receipt_ids
    );
    expect(receiptsOutcomeSecondary.logs).toEqual(
      nearTxStatus.receipts_outcome[1].outcome.logs
    );
    expect(txStatus.transaction.receiverId).toStrictEqual(
      nearTxStatus.transaction.receiver_id
    );
    expect(receiptsOutcomeFirst.logs).toEqual(
      nearTxStatus.receipts_outcome[0].outcome.logs
    );
    expect(transactionOutcomeTxStatus.id).toStrictEqual(
      nearTxStatus.transaction_outcome.id
    );
    expect(txStatus.transaction.signerId).toStrictEqual(
      nearTxStatus.transaction.signer_id
    );
    expect(txStatus.transaction.nonce).toStrictEqual(
      `${nearTxStatus.transaction.nonce}`
    );
    expect(txStatus.transaction.hash).toStrictEqual(
      nearTxStatus.transaction.hash
    );
    expect(transactionOutcomeTxStatus.outcome.gas_burnt).toStrictEqual(
      `${nearTxStatus.transaction_outcome.outcome.gas_burnt}`
    );
    expect(transactionOutcomeTxStatus.outcome.receipt_ids[0]).toStrictEqual(
      `${nearTxStatus.transaction_outcome.outcome.receipt_ids}`
    );
  });

  // txStatusReceipts - Failed parsing args: invalid length 2, expected fewer elements in array, https://docs.near.org/docs/api/rpc/transactions#transaction-status-with-receipts
  /* it("txStatusReceipts", async () => {
    const result = await client.query<{ txStatusReceipts: FinalExecutionOutcomeWithReceipts }>({
      uri: apiUri,
      query: `query {
        txStatusReceipts(
          txHash: $txHash
          accountId: $accountId
        )
      }`,
      variables: {
        txHash: transactionOutcome.transaction.hash,
        accountId: sender.accountId,
      },
    }); 
  });
    }); 
  });
    }); 
  });
    }); 

    // expect(result.errors).toBeFalsy();
    // expect(result.data).toBeTruthy();

    //const txStatusReceipts: FinalExecutionOutcomeWithReceipts = result.data!.txStatusReceipts;

    const nearTxStatusReceipts = await near.connection.provider.txStatusReceipts(
      Uint8Array.from(transactionOutcome.transaction.hash),
      sender.accountId,
    );

     expect("receipts" in txStatusReceipts).toBe(true);
    expect(txStatusReceipts.receipts.length).toBeGreaterThanOrEqual(1);
    expect(txStatusReceipts).toMatchObject(nearTxStatusReceipts); 
  }); */

  //validators +- response error :  [-32000] Server error: Validator info unavailable
  /* it("Get validators", async () => {
    const blockId = latestBlock.header.hash;

    const result = await client.query<{ validators: EpochValidatorInfo }>({
      uri: apiUri,
      query: `query {
        validators(
          blockId: $blockId
        )
      }`,
      variables: {
        blockId: blockId,
      },
    });

    expect(result.errors).toBeFalsy();
    expect(result.data).toBeTruthy();

    const validators: EpochValidatorInfo = result.data!.validators;
    expect(validators).toBeTruthy();
    expect(validators.current_validators).toBeTruthy();
    expect(validators.current_validators).toBeInstanceOf(Array);
    expect(validators.next_validators).toBeTruthy();
    expect(validators.next_validators).toBeInstanceOf(Array);
    expect(validators.current_fisherman).toBeTruthy();
    expect(validators.current_fisherman).toBeInstanceOf(Array);
    expect(validators.next_fisherman).toBeTruthy();
    expect(validators.next_fisherman).toBeInstanceOf(Array);
    expect(validators.current_proposals).toBeTruthy();
    expect(validators.current_proposals).toBeInstanceOf(Array);
    expect(validators.prev_epoch_kickout).toBeTruthy();
    expect(validators.prev_epoch_kickout).toBeInstanceOf(Array);
    expect(validators.epoch_height).toBeTruthy();
    expect(validators.epoch_start_height).toBeTruthy();

    const nearValidators = await near.connection.provider.validators(blockId);

    expect(validators.current_validators.length).toStrictEqual(nearValidators.current_validators.length);
    expect(validators.current_validators).toEqual(nearValidators.current_validators);

    expect(validators.next_validators.length).toStrictEqual(nearValidators.next_validators.length);
    expect(validators.next_validators).toEqual(nearValidators.next_validators);

    expect(validators.current_fisherman.length).toStrictEqual(nearValidators.current_fisherman.length);
    expect(validators.current_fisherman).toEqual(nearValidators.current_fisherman);

    expect(validators.next_fisherman.length).toStrictEqual(nearValidators.next_fisherman.length);
    expect(validators.next_fisherman).toEqual(nearValidators.next_fisherman);

    expect(validators.current_proposals.length).toStrictEqual(nearValidators.current_proposals.length);
    expect(validators.current_proposals).toEqual(nearValidators.current_proposals);

    expect(validators.prev_epoch_kickout.length).toStrictEqual(nearValidators.prev_epoch_kickout.length);
    expect(validators.prev_epoch_kickout).toEqual(nearValidators.prev_epoch_kickout);

    expect(validators.epoch_start_height).toEqual(nearValidators.epoch_start_height);
    //expect(validators.epoch_height)
  }); */
});
