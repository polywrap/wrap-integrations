import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { Pool, Route, Token, Price } from "../types";
import path from "path";
import { getPlugins, getPools, getTokens, getUniPools, toUniToken } from "../testUtils";
import * as uni from "@uniswap/v3-sdk";
import * as uniCore from "@uniswap/sdk-core";
import * as ethers from "ethers";

jest.setTimeout(90000);

describe("Pool", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let tokens: Token[];
  let pools: Pool[];
  let uniPools: uni.Pool[];
  let ethersProvider: ethers.providers.BaseProvider;
  // const DAIaddress: string = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  // const USDCaddress: string = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  // const WETHaddress: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  // const USDTaddress: string = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

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
    tokens = getTokens(pools);
    // set up ethers provider
    ethersProvider = ethers.providers.getDefaultProvider("http://localhost:8546");
    // get uni pools
    uniPools = await getUniPools(ethersProvider);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("Route mid price", async () => {
    const DAI: Token = tokens.find((token: Token) => token.currency.symbol === "DAI");
    const USDC: Token = tokens.find((token: Token) => token.currency.symbol === "USDC");
    const WETH: Token = tokens.find((token: Token) => token.currency.symbol === "WETH");
    const USDT: Token = tokens.find((token: Token) => token.currency.symbol === "USDT");
    const poolPath: Pool[] = [
      pools.find((value: Pool) => value.token0.address === DAI.address && value.token1.address === WETH.address),
      pools.find((value: Pool) => value.token0.address === DAI.address && value.token1.address === USDC.address),
      pools.find((value: Pool) => value.token0.address === USDC.address && value.token1.address === USDT.address),
    ];
    const uniPoolPath: uni.Pool[] = [
      uniPools.find((value: uni.Pool) => value.token0.address === DAI.address && value.token1.address === WETH.address),
      uniPools.find((value: uni.Pool) => value.token0.address === DAI.address && value.token1.address === USDC.address),
      uniPools.find((value: uni.Pool) => value.token0.address === USDC.address && value.token1.address === USDT.address),
    ];

    const createRoute = await client.invoke<Route>({
      uri: ensUri,
      module: "query",
      method: "createRoute",
      input: {
        pools: poolPath,
        inToken: DAI,
        outToken: USDT,
      },
    });
    expect(createRoute.error).toBeFalsy();
    expect(createRoute.data).toBeTruthy();

    const route: Route = createRoute.data!;
    const uniRoute: uni.Route<uniCore.Token, uniCore.Token> = new uni.Route(uniPoolPath, toUniToken(DAI), toUniToken(USDT));

    const routeMidPrice = await client.invoke<Price>({
      uri: ensUri,
      module: "query",
      method: "routeMidPrice",
      input: {
        route: route
      }
    });
    expect(routeMidPrice.error).toBeFalsy();
    expect(routeMidPrice.data).toBeTruthy();

    const price: Price = routeMidPrice.data!;
    const uniPrice: uniCore.Price<uniCore.Token, uniCore.Token> = uniRoute.midPrice;
    expect(price.price).toEqual(uniPrice.toFixed(18));

    // const createRoute = await client.query<{
    //   createRoute: Route;
    // }>({
    //   uri: ensUri,
    //   query: `
    //     query {
    //       createRoute(
    //         pools: $pools
    //         inToken: $inToken
    //         outToken: $outToken
    //       )
    //     }
    //   `,
    //   variables: {
    //     pools: poolPath,
    //     inToken: DAI,
    //     outToken: USDT,
    //   },
    // });
    // expect(createRoute.errors).toBeFalsy();
    // expect(createRoute.data).toBeTruthy();
    // const route: Route = createRoute.data!.createRoute;

    // const routeMidPrice = await client.query<{
    //   routeMidPrice: Price;
    // }>({
    //   uri: ensUri,
    //   query: `
    //     query {
    //       routeMidPrice(
    //         route: $route
    //       )
    //     }
    //   `,
    //   variables: {
    //     route: route
    //   },
    // });
    // expect(createRoute.errors).toBeFalsy();
    // expect(createRoute.data).toBeTruthy();
  });

});
