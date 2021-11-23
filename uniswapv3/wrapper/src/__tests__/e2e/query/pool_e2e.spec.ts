import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { ChainId, Token, TokenAmount } from "./types";
import path from "path";
import { getPlugins, getTokenList } from "../testUtils";
import * as uni from "@uniswap/v3-sdk";
import * as uniCore from "@uniswap/sdk-core";
import * as ethers from "ethers";

jest.setTimeout(90000);

describe("Fetch", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let tokens: Token[];
  let uniTokens: uniCore.Token[];
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
    // ipfsUri = `ipfs/${api.ipfsCid}`;
    // set up test case data -> tokens
    tokens = await getTokenList();
    uniTokens = tokens.map(token => {
      return new uniCore.Token(
        1,
        token.address,
        token.currency.decimals,
        token.currency.symbol || "",
        token.currency.name || ""
      );
    });
    // pick some test case tokens
    const aave: Token = tokens.filter(token => token.currency.symbol === "AAVE")[0];
    const dai: Token = tokens.filter(token => token.currency.symbol === "DAI")[0];
    const usdc: Token = tokens.filter(token => token.currency.symbol === "USDC")[0];
    const comp: Token = tokens.filter(token => token.currency.symbol === "COMP")[0];
    const weth: Token = tokens.filter(token => token.currency.symbol === "WETH")[0];
    const wbtc: Token = tokens.filter(token => token.currency.symbol === "WBTC")[0];
    const uniswap: Token = tokens.filter(token => token.currency.symbol === "UNI")[0];
    const link: Token = tokens.filter(token => token.currency.symbol === "LINK")[0];
    // create and push test case pairs
    const aave_dai: Pool | undefined = await getPoolData(aave, dai, client, ensUri);
    const usdc_dai: Pool | undefined = await getPoolData(usdc, dai, client, ensUri);
    const aave_usdc: Pool | undefined = await getPoolData(aave, usdc, client, ensUri);
    const comp_weth: Pool | undefined = await getPoolData(comp, weth, client, ensUri);
    const uni_link: Pool | undefined = await getPoolData(uniswap, link, client, ensUri);
    const uni_wbtc: Pool | undefined = await getPoolData(uniswap, wbtc, client, ensUri);
    const wbtc_weth: Pool | undefined = await getPoolData(wbtc, weth, client, ensUri);
    [aave_dai, usdc_dai, aave_usdc, comp_weth, uni_link, uni_wbtc, wbtc_weth].forEach(pool => {
      if (pool) {
        pools.push(pool)
      }
    });

    // create uniswap sdk pairs to compare results
    uniPools = getUniPools(pools, 1);
    // set up ethers provider
    ethersProvider = ethers.providers.getDefaultProvider("http://localhost:8546");
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("Gets pool address", async () => {
    for (let i = 0; i < 10; i++) {
      // actual token
      const tokenData = await client.query<{
        fetchTokenData: Token;
      }>({
        uri: ensUri,
        query: `
          query {
            fetchTokenData(
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
    }
  });
});
