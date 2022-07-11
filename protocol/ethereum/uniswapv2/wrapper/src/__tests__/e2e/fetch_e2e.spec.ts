import { buildWrapper, initTestEnvironment, stopTestEnvironment, providers, ensAddresses } from "@polywrap/test-env-js";
import { ClientConfig, PolywrapClient } from "@polywrap/client-js";
import { ChainId, Pair, Token, TokenAmount } from "./types";
import path from "path";
import { getPlugins, getTokenList } from "../testUtils";
import * as uni from "@uniswap/sdk";
import * as ethers from "ethers";
import { BaseProvider, getDefaultProvider} from "@ethersproject/providers"

jest.setTimeout(90000);

describe("Fetch", () => {

  let client: PolywrapClient;
  let fsUri: string;
  let tokens: Token[];
  let uniTokens: uni.Token[];
  let pairs: Token[][];
  let ethersProvider: BaseProvider;

  beforeAll(async () => {
    await initTestEnvironment();
    // get client
    const config: Partial<ClientConfig> = getPlugins(providers.ethereum, providers.ipfs, ensAddresses.ensAddress);
    client = new PolywrapClient(config);
    // deploy api
    const wrapperAbsPath: string = path.resolve(__dirname + "/../../..");
    await buildWrapper(wrapperAbsPath);
    fsUri = "fs/" + wrapperAbsPath + '/build';
    // set up test case data -> tokens
    tokens = await getTokenList();
    uniTokens = tokens.map(token => {
      return new uni.Token(
        uni.ChainId.MAINNET,
        token.address,
        token.currency.decimals,
        token.currency.symbol || "",
        token.currency.name || ""
      );
    });
    // set up test case data -> pairs
    const aave: Token = tokens.filter(token => token.currency.symbol === "AAVE")[0];
    const dai: Token = tokens.filter(token => token.currency.symbol === "DAI")[0];
    const usdc: Token = tokens.filter(token => token.currency.symbol === "USDC")[0];
    const comp: Token = tokens.filter(token => token.currency.symbol === "COMP")[0];
    const weth: Token = tokens.filter(token => token.currency.symbol === "WETH")[0];
    const wbtc: Token = tokens.filter(token => token.currency.symbol === "WBTC")[0];
    const uniswap: Token = tokens.filter(token => token.currency.symbol === "UNI")[0];
    const link: Token = tokens.filter(token => token.currency.symbol === "LINK")[0];
    pairs = [[aave, dai], [usdc, dai], [aave, usdc], [comp, weth], [uniswap, link], [uniswap, wbtc], [wbtc, weth]];
    // set up ethers provider
    ethersProvider = getDefaultProvider("http://localhost:8546");
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("Fetches token data", async () => {
    for (let i = 0; i < 10; i++) {
      // actual token
      const tokenData = await client.invoke<Token>({
        uri: fsUri,
        method: "fetchTokenData",
        args: {
          chainId: tokens[i].chainId,
          address: tokens[i].address,
        },
      });
      // compare results
      expect(tokenData.error).toBeFalsy();
      expect(tokenData.data).toBeTruthy();
      expect(tokenData.data?.currency.symbol).toStrictEqual(tokens[i].currency.symbol);
      expect(tokenData.data?.currency.decimals).toStrictEqual(tokens[i].currency.decimals);
      // fetched name can vary from token list, e.g. "Aave" vs "Aave Token", so not testing (can verify it works with console.log)
      // expect(tokenData.data?.fetchTokenData.currency.name).toStrictEqual(tokens[i].currency.name);
    }
  });

  it("Fetches pair data", async () => {
    // loop over token pairs
    for (let i = 0; i < pairs.length; i++) {
      // prepare uni tokens
      const uniTokenI: uni.Token = uniTokens.filter(token => token.address === pairs[i][0].address)[0];
      const uniTokenJ: uni.Token = uniTokens.filter(token => token.address === pairs[i][1].address)[0];
      // actual pair data
      const pairData = await client.invoke<Pair>({
        uri: fsUri,
        method: "fetchPairData",
        args: {
          token0: pairs[i][0],
          token1: pairs[i][1]
        },
      });
      // expected pair data
      const uniPair: uni.Pair = await uni.Fetcher.fetchPairData(uniTokenI, uniTokenJ, ethersProvider);
      // compare results
      expect(pairData.error).toBeFalsy();
      expect(pairData.data).toBeTruthy();
      expect(pairData.data?.tokenAmount0.amount).toStrictEqual(uniPair.reserve0.numerator.toString());
      expect(pairData.data?.tokenAmount1.amount).toStrictEqual(uniPair.reserve1.numerator.toString());
    }
  });

  it("Fetches total supply", async () => {
    for (let i = 0; i < 10; i++) {
      // prepare contract to check results
      const abi = ["function totalSupply() external view returns (uint)"];
      const contract = new ethers.Contract(tokens[i].address, abi, ethersProvider);
      // actual totalSupply
      const totalSupply = await client.invoke<TokenAmount>({
        uri: fsUri,
        method: "fetchTotalSupply",
        args: {
          token: tokens[i],
        },
      });
      // expected totalSupply
      const expectedTotalSupply: string = (await contract.totalSupply()).toString();
      // compare results
      expect(totalSupply.error).toBeFalsy();
      expect(totalSupply.data).toBeTruthy();
      expect(totalSupply.data?.amount).toStrictEqual(expectedTotalSupply);
    }
  });

  it("Fetches kLast", async () => {
    // loop over tokens
    for (let i = 0; i < pairs.length; i++) {
      // prepare contract to check results
      const uniTokenI: uni.Token = uniTokens.filter(token => token.address === pairs[i][0].address)[0];
      const uniTokenJ: uni.Token = uniTokens.filter(token => token.address === pairs[i][1].address)[0];
      const uniPairAddress: string = uni.Pair.getAddress(uniTokenI, uniTokenJ);
      const abi = ["function kLast() external view returns (uint)"];
      const contract = new ethers.Contract(uniPairAddress, abi, ethersProvider);
      // get pair address
      const pairAddress = await client.invoke<string>({
        uri: fsUri,
        method: "pairAddress",
        args: {
          token0: pairs[i][0],
          token1: pairs[i][1]
        },
      });
      const actualPairAddress: string = pairAddress.data ?? "";
      // create pair token using pair address
      const pairToken: Token = {
        chainId: ChainId.MAINNET,
        address: actualPairAddress,
        currency: {
          decimals: 18,
          symbol: null,
          name: null,
        },
      };
      // get actual kLast
      const kLast = await client.invoke<string>({
        uri: fsUri,
        method: "fetchKLast",
        args: {
          token: pairToken,
        },
      });
      // expected kLast
      const expectedKLast: string = (await contract.kLast()).toString();
      // compare results
      expect(kLast.error).toBeFalsy();
      expect(kLast.data).toBeTruthy();
      expect(actualPairAddress).toStrictEqual(uniPairAddress);
      expect(kLast.data).toStrictEqual(expectedKLast);
    }
  });

});
