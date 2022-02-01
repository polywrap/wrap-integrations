import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js";
import { ClientConfig, Web3ApiClient } from "@web3api/client-js";
import { MethodParameters, Pool, Token, TokenAmount, Trade } from "../types";
import path from "path";
import { getPlugins, getPools, getTokens } from "../testUtils";
import * as ethers from "ethers";

jest.setTimeout(180000);

describe("Swap (mainnet fork)", () => {

  let client: Web3ApiClient;
  let ensUri: string;
  let tokens: Token[];
  let pools: Pool[];
  let ethersProvider: ethers.providers.JsonRpcProvider;
  let recipient: string;

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
    pools = await getPools(client, ensUri, true);
    tokens = getTokens(pools);
    // set up ethers provider
    ethersProvider = new ethers.providers.JsonRpcProvider("http://localhost:8546");
    recipient = await ethersProvider.getSigner().getAddress();
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("execCall", async () => {
    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < tokens.length; j++) {
        if (tokens[i] === tokens[j]) {
          continue;
        }
        // get trade
        const amountIn: TokenAmount = {
          token: tokens[i],
          amount: "10000000000"
        }
        const tokenOut = tokens[j];
        const query = await client.invoke<Trade[]>({
          uri: ensUri,
          module: "query",
          method: "bestTradeExactIn",
          input: {
            pools: pools,
            amountIn: amountIn,
            tokenOut: tokenOut,
            options: null,
          },
        });
        expect(query.error).toBeUndefined();
        expect(query.data).toBeDefined();
        const bestTrades: Trade[] = query.data!;

        if (bestTrades.length === 0) {
          continue;
        }

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
              deadline: "123",
              inputTokenPermit: null,
              sqrtPriceLimitX96: null,
              fee: null
            }
          }
        });
        expect(routerQuery.error).toBeUndefined();
        expect(routerQuery.data).toBeDefined();
        const methodParameters: MethodParameters = routerQuery.data!


      }
    }
  });

});
