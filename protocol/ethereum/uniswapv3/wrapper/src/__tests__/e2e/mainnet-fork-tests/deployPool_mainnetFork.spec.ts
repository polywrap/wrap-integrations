import { PolywrapClient } from "@polywrap/client-js";
import {
  ChainIdEnum, Ethereum_TxResponse, FeeAmountEnum, Token, Pool,
  getPoolFromAddress,
  getWrappedNative,
  initInfra,
  getConfig,
  stopInfra, buildDependencies
} from "../helpers";
import path from "path";
import * as ethers from "ethers";

jest.setTimeout(360000);

describe("Deploy pool (mainnet fork)", () => {

  let client: PolywrapClient;
  let fsUri: string;
  let ethersProvider: ethers.providers.JsonRpcProvider;

  beforeAll(async () => {
    await initInfra();
    // get client
    const { sha3Uri, graphUri } = await buildDependencies();
    const config = getConfig(sha3Uri, graphUri);
    client = new PolywrapClient(config);
    // get uri
    const wrapperAbsPath: string = path.resolve(__dirname + "/../../../../");
    fsUri = "fs/" + wrapperAbsPath + '/build';
    // set up ethers provider
    ethersProvider = new ethers.providers.JsonRpcProvider("http://localhost:8546");
  });

  afterAll(async () => {
    await stopInfra();
  });

  it("successfully deploys pool from tokens", async () => {
    const WRAP: Token = {
      chainId: ChainIdEnum.MAINNET,
      address: "0xECCac17265D5b6daEBafb9c94430f3E1Cc41431d",
      currency: {
        name: "WRAP-IOU",
        symbol: "WRAP-IOU",
        decimals: 18
      }
    };
    const WETH: Token = await getWrappedNative(client, fsUri, ChainIdEnum.MAINNET);

    const txResponse = await client.invoke<Ethereum_TxResponse>({
      uri: fsUri,
      method: "deployPoolFromTokens",
      args: {
        tokenA: WRAP,
        tokenB: WETH,
        fee: FeeAmountEnum.MEDIUM,
      },
    });
    if (txResponse.ok == false) fail(txResponse.error);

    const txHash: string = txResponse.value.hash;
    const tx = await ethersProvider.getTransaction(txHash);
    const receipt = await tx.wait();
    expect(receipt.status).toBeTruthy();

    const addressQuery = await client.invoke<string>({
      uri: fsUri,
      method: "getPoolAddress",
      args: {
        tokenA: WRAP,
        tokenB: WETH,
        fee: FeeAmountEnum.MEDIUM,
      },
    });
    if (addressQuery.ok == false) fail(addressQuery.error);

    const pool: Pool = await getPoolFromAddress(client, fsUri, addressQuery.value);
    expect(pool.token0).toStrictEqual(WETH);
    expect(pool.token1).toStrictEqual(WRAP);
    expect(pool.fee).toEqual(FeeAmountEnum.MEDIUM);
    expect(pool.liquidity).toEqual("0");
    expect(pool.tickCurrent).toEqual(0);
  });

});
