import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { MethodParameters, Pool, Token, TokenAmount, Trade } from "../types";
import path from "path";
import { getPlugins, getPools, getTokens, getUniPools } from "../testUtils";
import * as uni from "@uniswap/v3-sdk";
import * as uniCore from "@uniswap/sdk-core";
import * as ethers from "ethers";
import { ChainId } from "../../../../../../uniswapv2/wrapper/src/__tests__/e2e/types";

jest.setTimeout(120000);

describe("SwapRouter (mainnet fork)", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let tokens: Token[];
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
    tokens = getTokens(pools);
    tokens.push({
      chainId: ChainId.MAINNET,
      address: "",
      currency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
      },
    });
    // set up ethers provider
    ethersProvider = ethers.providers.getDefaultProvider("http://localhost:8546");
    // get uni pools
    uniPools = await getUniPools(ethersProvider);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("successfully constructs method parameters with exactIn trades", async () => {
    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < tokens.length; j++) {
        if (tokens[i] === tokens[j]) {
          continue;
        }
        // get trade
        const amountIn: TokenAmount = {
          token: tokens[i],
          amount: "1000000000000000000"
        }
        const tokenOut = tokens[j];
        const tradesQuery = await client.invoke<Trade[]>({
          uri: ensUri,
          module: "query",
          method: "bestTradeExactIn",
          input: {
            pools: pools,
            amountIn: amountIn,
            tokenOut: tokenOut,
            options: null,
          }
        });
        expect(tradesQuery.error).toBeUndefined();
        expect(tradesQuery.data).toBeDefined();
        const bestTrades: Trade[] = tradesQuery.data!;

        // get uni sdk best trades
        const uniAmountIn: uniCore.CurrencyAmount<uniCore.Token> = uniCore.CurrencyAmount.fromRawAmount(
          new uniCore.Token(
          1,
          amountIn.token.address,
          amountIn.token.currency.decimals,
          amountIn.token.currency.symbol || "",
          amountIn.token.currency.name || ""
        ), amountIn.amount);
        const uniTokenOut: uniCore.Token = new uniCore.Token(
          1,
          tokenOut.address,
          tokenOut.currency.decimals,
          tokenOut.currency.symbol || "",
          tokenOut.currency.name || ""
        );
        const uniBestTrades = await uni.Trade.bestTradeExactIn(uniPools, uniAmountIn, uniTokenOut);

        // get method parameters
        const routerQuery = await client.invoke<MethodParameters>({
          uri: ensUri,
          module: "query",
          method: "swapCallParameters",
          input: {
            trades: bestTrades,
            options: {
              slippageTolerance: "0.01",
              recipient: '0x0000000000000000000000000000000000000003',
              deadline: 123,
              inputTokenPermit: null,
              sqrtPriceLimitX96: null,
              fee: null
            }
          }
        });
        expect(routerQuery.error).toBeUndefined();
        expect(routerQuery.data).toBeDefined();
        const methodParameters: MethodParameters = routerQuery.data!

        // get uni method parameters
        const uniMethodParameters: uni.MethodParameters = uni.SwapRouter.swapCallParameters(uniBestTrades, {
          slippageTolerance: new uniCore.Percent(1, 100),
          recipient: '0x0000000000000000000000000000000000000003',
          deadline: 123,
        });

        // compare results
        expect(methodParameters).toStrictEqual(uniMethodParameters);
      }
    }
  });

  it("successfully constructs method parameters with exactOut trades", async () => {
    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < tokens.length; j++) {
        if (tokens[i] === tokens[j]) {
          continue;
        }
        // get best trades
        const tokenIn = tokens[i];
        const amountOut: TokenAmount = {
          token: tokens[j],
          amount: "1000000000000000000"
        }
        const tradesQuery = await client.invoke<Trade[]>({
          uri: ensUri,
          module: "query",
          method: "bestTradeExactOut",
          input: {
            pools: pools,
            tokenIn: tokenIn,
            amountOut: amountOut,
            options: null,
          }
        });
        expect(tradesQuery.error).toBeUndefined();
        expect(tradesQuery.data).toBeDefined();
        const bestTrades: Trade[] = tradesQuery.data!;

        // get expected best trades
        const uniTokenIn: uniCore.Token = new uniCore.Token(
          1,
          tokenIn.address,
          tokenIn.currency.decimals,
          tokenIn.currency.symbol || "",
          tokenIn.currency.name || ""
        );
        const uniAmountOut: uniCore.CurrencyAmount<uniCore.Token> = uniCore.CurrencyAmount.fromRawAmount(
          new uniCore.Token(
            1,
            amountOut.token.address,
            amountOut.token.currency.decimals,
            amountOut.token.currency.symbol || "",
            amountOut.token.currency.name || ""
          ), amountOut.amount);
        const uniBestTrades = await uni.Trade.bestTradeExactOut(uniPools, uniTokenIn, uniAmountOut);

        // get method parameters
        const routerQuery = await client.invoke<MethodParameters>({
          uri: ensUri,
          module: "query",
          method: "swapCallParameters",
          input: {
            trades: bestTrades,
            options: {
              slippageTolerance: "0.01",
              recipient: '0x0000000000000000000000000000000000000003',
              deadline: 123,
              inputTokenPermit: null,
              sqrtPriceLimitX96: null,
              fee: null
            }
          }
        });
        expect(routerQuery.error).toBeUndefined();
        expect(routerQuery.data).toBeDefined();
        const methodParameters: MethodParameters = routerQuery.data!

        // get uni method parameters
        const uniMethodParameters: uni.MethodParameters = uni.SwapRouter.swapCallParameters(uniBestTrades, {
          slippageTolerance: new uniCore.Percent(1, 100),
          recipient: '0x0000000000000000000000000000000000000003',
          deadline: 123,
        });

        // compare results
        expect(methodParameters).toStrictEqual(uniMethodParameters);
      }
    }
  });

  it("successfully constructs method parameters with fee option", async () => {
    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < tokens.length; j++) {
        if (tokens[i] === tokens[j]) {
          continue;
        }
        // get trade
        const amountIn: TokenAmount = {
          token: tokens[i],
          amount: "1000000000000000000"
        }
        const tokenOut = tokens[j];
        const tradesQuery = await client.invoke<Trade[]>({
          uri: ensUri,
          module: "query",
          method: "bestTradeExactIn",
          input: {
            pools: pools,
            amountIn: amountIn,
            tokenOut: tokenOut,
            options: null,
          }
        });
        expect(tradesQuery.error).toBeUndefined();
        expect(tradesQuery.data).toBeDefined();
        const bestTrades: Trade[] = tradesQuery.data!;

        // get uni sdk best trades
        const uniAmountIn: uniCore.CurrencyAmount<uniCore.Token> = uniCore.CurrencyAmount.fromRawAmount(
          new uniCore.Token(
            1,
            amountIn.token.address,
            amountIn.token.currency.decimals,
            amountIn.token.currency.symbol || "",
            amountIn.token.currency.name || ""
          ), amountIn.amount);
        const uniTokenOut: uniCore.Token = new uniCore.Token(
          1,
          tokenOut.address,
          tokenOut.currency.decimals,
          tokenOut.currency.symbol || "",
          tokenOut.currency.name || ""
        );
        const uniBestTrades = await uni.Trade.bestTradeExactIn(uniPools, uniAmountIn, uniTokenOut);

        // get method parameters
        const routerQuery = await client.invoke<MethodParameters>({
          uri: ensUri,
          module: "query",
          method: "swapCallParameters",
          input: {
            trades: bestTrades,
            options: {
              slippageTolerance: "0.01",
              recipient: '0x0000000000000000000000000000000000000003',
              deadline: 123,
              inputTokenPermit: null,
              sqrtPriceLimitX96: null,
              fee: {
                fee: "0.05",
                recipient: '0x0000000000000000000000000000000000000003'
              }
            }
          }
        });
        expect(routerQuery.error).toBeUndefined();
        expect(routerQuery.data).toBeDefined();
        const methodParameters: MethodParameters = routerQuery.data!

        // get uni method parameters
        const uniMethodParameters: uni.MethodParameters = uni.SwapRouter.swapCallParameters(uniBestTrades, {
          slippageTolerance: new uniCore.Percent(1, 100),
          recipient: '0x0000000000000000000000000000000000000003',
          deadline: 123,
          fee: {
            fee: new uniCore.Percent(5, 100),
            recipient: '0x0000000000000000000000000000000000000003'
          }
        });

        // compare results
        expect(methodParameters).toStrictEqual(uniMethodParameters);
      }
    }
  });

});
