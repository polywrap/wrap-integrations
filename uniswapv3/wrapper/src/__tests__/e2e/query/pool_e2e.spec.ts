import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { Pool } from "../types";
import path from "path";
import { getPlugins, getPools } from "../testUtils";
// import * as uni from "@uniswap/v3-sdk";
// import * as ethers from "ethers";
import poolList from "../testData/poolList.json";

jest.setTimeout(90000);

describe("Pool", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let pools: Pool[];
  // let uniPools: uni.Pool[];
  // let ethersProvider: ethers.providers.BaseProvider;

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
    pools = await getPools(client, ensUri);
    // set up ethers provider
    // ethersProvider = ethers.providers.getDefaultProvider("http://localhost:8546");
    // get uni pools
    // uniPools = await getUniPools(ethersProvider);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("Gets pool address", async () => {
    const addresses: string[] = poolList;

    for (let i = 0; i < pools.length; i++) {
      const query = await client.query<{
        getPoolAddress: string;
      }>({
        uri: ensUri,
        query: `
          query {
            getPoolAddress(
              tokenA: $tokenA
              tokenB: $tokenB
              fee: $fee
            )
          }
        `,
        variables: {
          tokenA: pools[i].token0,
          tokenB: pools[i].token1,
          fee: pools[i].fee,
        },
      });
      expect(query.errors).toBeFalsy();
      expect(query.data).toBeTruthy();
      expect(query.data?.getPoolAddress).toEqual(addresses[i]);
    }
  });
});
