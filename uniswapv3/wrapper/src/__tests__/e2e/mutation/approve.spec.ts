import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { Ethereum_TxResponse, Pool, Token } from "../types";
import path from "path";
import { getPlugins, getPools, getTokens } from "../testUtils";
import * as ethers from "ethers";

jest.setTimeout(180000);

describe("Approve (mainnet fork)", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let tokens: Token[];
  let ethersProvider: ethers.providers.JsonRpcProvider;

  beforeAll(async () => {
    const { ethereum: testEnvEtherem, ensAddress, ipfs } = await initTestEnvironment();
    // get client
    const config: ClientConfig = getPlugins(testEnvEtherem, ipfs, ensAddress);
    client = new Web3ApiClient(config);
    // deploy api
    const apiPath: string = path.resolve(__dirname + "/../../../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
    ensUri = `ens/testnet/${api.ensDomain}`;
    // set up test case data
    const pools: Pool[] = await getPools(client, ensUri, false);
    tokens = getTokens(pools);
    // set up ethers provider
    ethersProvider = new ethers.providers.JsonRpcProvider("http://localhost:8546");
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("successfully approves token transfers", async () => {
    for (const token of tokens) {
      const txResponse = await client.invoke<Ethereum_TxResponse>({
        uri: ensUri,
        module: "mutation",
        method: "approve",
        input: { token },
      });
      expect(txResponse.error).toBeFalsy();
      expect(txResponse.data).toBeTruthy();

      const approve: string = txResponse.data!.hash;
      const approveTx = await ethersProvider.getTransaction(approve);
      const receipt = await approveTx.wait();
      expect(receipt.status).toBeTruthy();
    }
  });

});
