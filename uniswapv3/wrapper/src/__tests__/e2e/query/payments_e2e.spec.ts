import { Ethereum_TxResponse, FeeOptions, Token } from "../types";
import { getFakeTestToken, getPlugins } from "../testUtils";
import {
  encodeUnwrapWETH9,
  encodeSweepToken,
  encodeRefundETH,
} from "../wrappedQueries";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import path from "path";
import { ethers } from "ethers";

jest.setTimeout(120000);

describe('Payments (SDK test replication)', () => {

  const recipient = '0x0000000000000000000000000000000000000003';
  const amount = 123;
  const feeOptions: FeeOptions = {
    fee: "0.001",
    recipient: '0x0000000000000000000000000000000000000009',
  }

  let token: Token;

  let client: Web3ApiClient;
  let ethersProvider: ethers.providers.BaseProvider;
  let ensUri: string;

  beforeAll(async () => {
    const { ethereum: testEnvEtherem, ensAddress, ipfs } = await initTestEnvironment();
    // get client
    const config: ClientConfig = getPlugins(testEnvEtherem, ipfs, ensAddress);
    client = new Web3ApiClient(config);
    // deploy api
    const apiPath: string = path.resolve(__dirname + "/../../../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
    ensUri = `ens/testnet/${api.ensDomain}`;
    ethersProvider = ethers.providers.getDefaultProvider("http://localhost:8546");
    // set up test case data
    token = getFakeTestToken(0);

    const TXResponse = await client.query<{approve: Ethereum_TxResponse}>({
      uri: ensUri,
      query: `
        mutation {
          approve(
            token: $token
          )
        }
      `,
      variables: {
        token: token,
      },
    });
    const T1Approve: string = TXResponse.data?.approve?.hash ?? "";
    const ApproveTx1= await ethersProvider.getTransaction(T1Approve);
    await ApproveTx1.wait();

  });

  
  afterAll(async () => {
    await stopTestEnvironment();
  });


  describe('encodeUnwrapWETH9', () => {
    it('works without feeOptions', async () => {
      const calldata: string = await encodeUnwrapWETH9(client, ensUri, amount, recipient);
      expect(calldata).toBe(
        '0x49404b7c000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000003'
      )
    })

    it('works with feeOptions', async () => {
      const calldata: string = await encodeUnwrapWETH9(client, ensUri, amount, recipient, feeOptions)
      expect(calldata).toBe(
        '0x9b2c0a37000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000009'
      )
    })
  })

  describe('encodeSweepToken', () => {
    it('works without feeOptions', async () => {
      const calldata: string = await encodeSweepToken(client, ensUri, token, amount, recipient)
      expect(calldata).toBe(
        '0xdf2ab5bb0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000003'
      )
    })

    it('works with feeOptions', async () => {
      const calldata: string = await encodeSweepToken(client, ensUri, token, amount, recipient, feeOptions)
      expect(calldata).toBe(
        '0xe0e189a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000009'
      )
    })
  })

  it('encodeRefundETH', async () => {
    const calldata: string = await encodeRefundETH(client, ensUri);
    expect(calldata).toBe('0x12210e8a')
  })
})
