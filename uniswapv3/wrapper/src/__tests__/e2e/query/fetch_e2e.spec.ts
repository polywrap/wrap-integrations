import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { ChainIdEnum, Pool, Tick, Token } from "../types";
import path from "path";
import { getFeeAmount, getPlugins, getPools, getTokens, getUniPools } from "../testUtils";
import * as uni from "@uniswap/v3-sdk";
import poolList from "../testData/poolList.json";
import * as ethers from "ethers";

jest.setTimeout(90000);

describe("Fetch", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let poolAddresses: string[] = poolList;
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
    // set up ethers provider
    ethersProvider = ethers.providers.getDefaultProvider("http://localhost:8546");
    // get uni pools
    uniPools = await getUniPools(ethersProvider);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("fetchTickList", async () => {
    const tickListQuery = await client.query<{
      fetchTickList: Tick[];
    }>({
      uri: ensUri,
      query: `
      query {
        fetchTickList(
          chainId: $chainId
          address: $address
        )
      }
    `,
      variables: {
        chainId: ChainIdEnum.MAINNET,
        address: poolAddresses[0],
      },
    });
    expect(tickListQuery.errors).toBeFalsy();
    expect(tickListQuery.data).toBeTruthy();

    const tickList: Tick[] = tickListQuery.data?.fetchTickList!;
    for (let i = 0; i < tickList.length; i++) {
      const tick: Tick = tickList[i];
      // @ts-ignore
      const uniTick: uni.Tick = await uniPools[0].tickDataProvider.getTick(tick.index);
      expect(tick.index).toEqual(uniTick.index);
      expect(tick.liquidityNet.toString()).toEqual(uniTick.liquidityNet.toString());
      expect(tick.liquidityGross.toString()).toEqual(uniTick.liquidityGross.toString());
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
            fetchTicks: $fetchTicks
          )
        }
      `,
        variables: {
          chainId: ChainIdEnum.MAINNET,
          address: poolAddresses[i],
          fetchTicks: false,
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

  it("fetchToken", async () => {
    const pools: Pool[] = await getPools(client, ensUri, false, 0, 3);
    const tokens: Token[] = getTokens(pools);
    for (let i = 0; i < tokens.length; i++) {
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
      expect(tokenData.data?.fetchToken.currency.name).toEqual(tokens[i].currency.name);
    }
  });
  
  it("fetchPoolFromTokens", async () => {
    const pools: Pool[] = await getPools(client, ensUri, true, 3, 6);
    for (let i = 0; i < pools.length; i++) {
      // fetch pool
      const poolData = await client.query<{
        fetchPoolFromTokens: Pool;
      }>({
        uri: ensUri,
        query: `
        query {
          fetchPoolFromTokens(
            tokenA: $tokenA
            tokenB: $tokenB
            fee: $fee
            fetchTicks: $fetchTicks
          )
        }
      `,
        variables: {
          tokenA: pools[i].token0,
          tokenB: pools[i].token1,
          fee: pools[i].fee,
          fetchTicks: true,
        },
      });
      expect(poolData.errors).toBeFalsy();
      expect(poolData.data).toBeTruthy();

      const pool: Pool = poolData.data?.fetchPoolFromTokens!;
      const expectedPool: Pool = pools[i];
      expect(pool).toStrictEqual(expectedPool);
      // expect(pool.token0.address).toEqual(expectedPool.token0.address);
      // expect(pool.token1.address).toEqual(expectedPool.token1.address);
      // expect(getFeeAmount(pool.fee)).toEqual(getFeeAmount(expectedPool.fee));
      // expect(pool.sqrtRatioX96).toEqual(expectedPool.sqrtRatioX96);
      // expect(pool.liquidity.toString()).toEqual(expectedPool.liquidity.toString());
      // expect(pool.tickCurrent).toEqual(expectedPool.tickCurrent);
    }
  });
  
});
