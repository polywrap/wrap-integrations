import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { Pool, TokenAmount, PoolChangeResult } from "../types";
import path from "path";
import { getPlugins, getPools, getUniPools } from "../testUtils";
import * as uni from "@uniswap/v3-sdk";
import * as uniCore from "@uniswap/sdk-core";
import * as ethers from "ethers";
import poolList from "../testData/poolList.json";

jest.setTimeout(90000);

describe("Pool", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let pools: Pool[];
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
    pools = await getPools(client, ensUri);
    // set up ethers provider
    ethersProvider = ethers.providers.getDefaultProvider("http://localhost:8546");
    // get uni pools
    uniPools = await getUniPools(ethersProvider);
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

  it("getPoolOutputAmount", async () => {
    const inputAmount: TokenAmount = {
      token: pools[0].token0,
      amount: "1000000000000000000",
    }
    const query = await client.query<{
      getPoolOutputAmount: PoolChangeResult;
    }>({
      uri: ensUri,
      query: `
        query {
          getPoolOutputAmount(
            pool: $pool
            inputAmount: $inputAmount
            sqrtPriceLimitX96: $sqrtPriceLimitX96
          )
        }
      `,
      variables: {
        pool: pools[0],
        inputAmount: inputAmount,
        sqrtPriceLimitX96: null,
      },
    });
    expect(query.errors).toBeFalsy();
    expect(query.data).toBeTruthy();

    const { tokenAmount, pool }: PoolChangeResult = query.data!.getPoolOutputAmount;
    const uniInputAmount = uniCore.CurrencyAmount.fromRawAmount<uniCore.Token>(uniPools[0].token0, inputAmount.amount);
    const [uniCurrencyAmount, uniPool] = await uniPools[0].getOutputAmount(uniInputAmount);

    // output amount
    expect(tokenAmount.token.address).toEqual(uniCurrencyAmount.currency.address);
    expect(tokenAmount.amount).toEqual(uniCurrencyAmount.numerator.toString());
    // pool state
    expect(pool.sqrtRatioX96).toEqual(uniPool.sqrtRatioX96.toString());
    expect(pool.liquidity).toEqual(uniPool.liquidity.toString());
    expect(pool.tickCurrent).toEqual(uniPool.tickCurrent);
  });

  it("getPoolInputAmount", async () => {
    const outputAmount: TokenAmount = {
      token: pools[0].token0,
      amount: "1000000000000000000",
    }
    const query = await client.query<{
      getPoolInputAmount: PoolChangeResult;
    }>({
      uri: ensUri,
      query: `
        query {
          getPoolInputAmount(
            pool: $pool
            outputAmount: $outputAmount
            sqrtPriceLimitX96: $sqrtPriceLimitX96
          )
        }
      `,
      variables: {
        pool: pools[0],
        outputAmount: outputAmount,
        sqrtPriceLimitX96: null,
      },
    });
    expect(query.errors).toBeFalsy();
    expect(query.data).toBeTruthy();

    const { tokenAmount, pool }: PoolChangeResult = query.data!.getPoolInputAmount;
    const unitOutputAmount = uniCore.CurrencyAmount.fromRawAmount<uniCore.Token>(uniPools[0].token0, outputAmount.amount);
    const [uniCurrencyAmount, uniPool] = await uniPools[0].getInputAmount(unitOutputAmount);

    // input amount
    expect(tokenAmount.token.address).toEqual(uniCurrencyAmount.currency.address);
    expect(tokenAmount.amount).toEqual(uniCurrencyAmount.numerator.toString());
    // pool state
    expect(pool.sqrtRatioX96).toEqual(uniPool.sqrtRatioX96.toString());
    expect(pool.liquidity).toEqual(uniPool.liquidity.toString());
    expect(pool.tickCurrent).toEqual(uniPool.tickCurrent);
  });
});
