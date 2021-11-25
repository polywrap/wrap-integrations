import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { ChainId, Pool, Token } from "../types";
import path from "path";
import { getFeeAmount, getPlugins, getTokenList, getUniPools } from "../testUtils";
import * as uni from "@uniswap/v3-sdk";
import poolList from "../testData/poolList.json";
import * as ethers from "ethers";

jest.setTimeout(90000);

describe("Fetch", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let tokens: Token[];
  let poolAddresses: string[];
  let uniPools: uni.Pool[];
  let ethersProvider: ethers.providers.BaseProvider;

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
    tokens = await getTokenList();
    poolAddresses = poolList;
    // set up ethers provider
    ethersProvider = ethers.providers.getDefaultProvider("http://localhost:8546");
    // get uni pools
    uniPools = await getUniPools(ethersProvider);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("fetchToken", async () => {
    for (let i = 0; i < 10; i++) {
      // fetch token
      const tokenData = await client.query<{
        fetchToken: Token;
      }>({
        uri: ensUri,
        query: `
          query {
            fetchToken(
              chainId: $chainId
              address: $address
            )
          }
        `,
        variables: {
          chainId: tokens[i].chainId,
          address: tokens[i].address,
        },
      });
      // compare results
      expect(tokenData.errors).toBeFalsy();
      expect(tokenData.data).toBeTruthy();
      expect(tokenData.data?.fetchToken.currency.decimals).toEqual(tokens[i].currency.decimals);
      expect(tokenData.data?.fetchToken.currency.symbol).toEqual(tokens[i].currency.symbol);
    }
  });

  it("fetchPoolFromAddress", async () => {
    for (let i = 0; i < poolAddresses.length; i++) {
      // fetch pool
      const poolData = await client.query<{
        fetchPoolFromAddress: Pool;
      }>({
        uri: ensUri,
        query: `
        query {
          fetchPoolFromAddress(
            chainId: $chainId
            address: $address
          )
        }
      `,
        variables: {
          chainId: ChainId.MAINNET,
          address: poolAddresses[i],
        },
      });
      expect(poolData.errors).toBeFalsy();
      expect(poolData.data).toBeTruthy();

      const pool: Pool = poolData.data?.fetchPoolFromAddress!;
      const uniPool: uni.Pool = uniPools[i];

      expect(pool.token0.address).toEqual(uniPool.token0.address);
      expect(pool.token1.address).toEqual(uniPool.token1.address);
      expect(getFeeAmount(pool.fee)).toEqual(uniPool.fee.valueOf());
      expect(pool.sqrtRatioX96).toEqual(uniPool.sqrtRatioX96);
      expect(pool.liquidity.toString()).toEqual(uniPool.liquidity.toString());
      expect(pool.tickCurrent).toEqual(uniPool.tickCurrent);
    }
  });
});
