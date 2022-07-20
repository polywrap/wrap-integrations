import { ClientConfig, PolywrapClient } from "@polywrap/client-js";
import * as path from "path";
import { getPairData, getTokenList, getUniPairs } from "../testUtils";
import { getPlugins, initInfra, stopInfra } from "../infraUtils";
import * as uni from "@uniswap/sdk";
import * as App from "./types/wrap";

jest.setTimeout(150000);

describe('Pair', () => {

  let client: PolywrapClient;
  let fsUri: string;
  let pairs: App.Pair[] = [];
  let uniPairs: uni.Pair[];

  beforeAll(async () => {
    await initInfra();
    // get client
    const config: Partial<ClientConfig> = getPlugins();
    client = new PolywrapClient(config);
    // deploy api
    const wrapperAbsPath: string = path.resolve(__dirname + "/../../..");
    fsUri = "fs/" + wrapperAbsPath + '/build';
    // pick some test case tokens
    const tokens: App.Token[] = await getTokenList();
    const aave: App.Token = tokens.filter(token => token.currency.symbol === "AAVE")[0];
    const dai: App.Token = tokens.filter(token => token.currency.symbol === "DAI")[0];
    const usdc: App.Token = tokens.filter(token => token.currency.symbol === "USDC")[0];
    const comp: App.Token = tokens.filter(token => token.currency.symbol === "COMP")[0];
    const weth: App.Token = tokens.filter(token => token.currency.symbol === "WETH")[0];
    const wbtc: App.Token = tokens.filter(token => token.currency.symbol === "WBTC")[0];
    const uniswap: App.Token = tokens.filter(token => token.currency.symbol === "UNI")[0];
    const link: App.Token = tokens.filter(token => token.currency.symbol === "LINK")[0];
    // create and push test case pairs
    const aave_dai: App.Pair | undefined = await getPairData(aave, dai, client, fsUri);
    const usdc_dai: App.Pair | undefined = await getPairData(usdc, dai, client, fsUri);
    const aave_usdc: App.Pair | undefined = await getPairData(aave, usdc, client, fsUri);
    const comp_weth: App.Pair | undefined = await getPairData(comp, weth, client, fsUri);
    const uni_link: App.Pair | undefined = await getPairData(uniswap, link, client, fsUri);
    const uni_wbtc: App.Pair | undefined = await getPairData(uniswap, wbtc, client, fsUri);
    const wbtc_weth: App.Pair | undefined = await getPairData(wbtc, weth, client, fsUri);
    [aave_dai, usdc_dai, aave_usdc, comp_weth, uni_link, uni_wbtc, wbtc_weth].forEach(pair => {
      if (pair) {
        pairs.push(pair)
      }
    });

    // create uniswap sdk pairs to compare results
    uniPairs = getUniPairs(pairs, 1);
  });

  afterAll(async () => {
    await stopInfra();
  })

  it("off-chain pairAddress", async () => {
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const actualOutput = await client.invoke<string>({
        uri: fsUri,
        method: "pairAddress",
        args: {
          token0: pair.tokenAmount0.token,
          token1: pair.tokenAmount1.token
        },
      });

      const expectedOutput: string = uni.Pair.getAddress(uniPairs[i].token0, uniPairs[i].token1);
      expect(actualOutput.data).toStrictEqual(expectedOutput);
    }
  });

  it("pairOutputAmount", async () => {
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const inputAmount: App.TokenAmount = {
        token: pair.tokenAmount0.token,
        amount: "1000000000000000000"
      }
      const actualOutput = await client.invoke<App.TokenAmount>({
        uri: fsUri,
        method: "pairOutputAmount",
        args: {
          pair,
          inputAmount
        },
      });
      const expectedOutput = uniPairs[i].getOutputAmount(new uni.TokenAmount(uniPairs[i].token0, inputAmount.amount));
      const expectedAmount = expectedOutput[0].numerator.toString();
      expect(actualOutput.data?.token).toStrictEqual(pair.tokenAmount1.token);
      expect(actualOutput.data?.amount).toStrictEqual(expectedAmount);
    }
  });

  it("pairOutputNextPair", async () => {
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const inputAmount: App.TokenAmount = {
        token: pair.tokenAmount0.token,
        amount: "1000000000000000000"
      }
      const actualNextPair = await client.invoke<App.Pair>({
        uri: fsUri,
        method: "pairOutputNextPair",
        args: {
          pair,
          inputAmount
        },
      });
      const expectedOutput = uniPairs[i].getOutputAmount(new uni.TokenAmount(uniPairs[i].token0, inputAmount.amount));
      const expectedNextReserve0 = expectedOutput[1].reserve0.numerator.toString();
      const expectedNextReserve1 = expectedOutput[1].reserve1.numerator.toString();
      expect(actualNextPair.data?.tokenAmount0.amount).toStrictEqual(expectedNextReserve0);
      expect(actualNextPair.data?.tokenAmount1.amount).toStrictEqual(expectedNextReserve1);
    }
  });

  it("pairInputAmount", async () => {
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const outputAmount: App.TokenAmount = {
        token: pair.tokenAmount0.token,
        amount: "100"
      }
      const actualInput = await client.invoke<App.TokenAmount>({
        uri: fsUri,
        method: "pairInputAmount",
        args: {
          pair,
          outputAmount
        },
      });
      const expectedInput = uniPairs[i].getInputAmount(new uni.TokenAmount(uniPairs[i].token0, outputAmount.amount));
      const expectedAmount = expectedInput[0].numerator.toString();
      expect(actualInput.data?.token).toStrictEqual(pair.tokenAmount1.token);
      expect(actualInput.data?.amount).toStrictEqual(expectedAmount);
    }
  });

  it("pairInputNextPair", async () => {
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const outputAmount: App.TokenAmount = {
        token: pair.tokenAmount0.token,
        amount: "100"
      }
      const actualNextPair = await client.invoke<App.Pair>({
        uri: fsUri,
        method: "pairInputNextPair",
        args: {
          pair,
          outputAmount
        },
      });
      const expectedInput = uniPairs[i].getInputAmount(new uni.TokenAmount(uniPairs[i].token0, outputAmount.amount));
      const expectedNextReserve0 = expectedInput[1].reserve0.numerator.toString();
      const expectedNextReserve1 = expectedInput[1].reserve1.numerator.toString();
      expect(actualNextPair.data?.tokenAmount0.amount).toStrictEqual(expectedNextReserve0);
      expect(actualNextPair.data?.tokenAmount1.amount).toStrictEqual(expectedNextReserve1);
    }
  });

});