import { PolywrapClient } from "@polywrap/client-js";
import {
  ChainIdEnum,
  Ethereum_TxResponse,
  Pool,
  SwapOptions,
  Token,
  TokenAmount,
  Trade,
  getPoolFromAddress, getTokens,
  bestTradeExactOut, getNative,
  getConfig, initInfra, stopInfra, buildDependencies
} from "../helpers";
import path from "path";
import * as ethers from "ethers";

jest.setTimeout(360000);

describe("Mint position (mainnet fork)", () => {

  const getSwapParams = (recipient: string): SwapOptions => ({
    slippageTolerance: "0.1",
    recipient,
    deadline: (new Date().getTime() / 1000 + 1800).toFixed(0),
  });

  const USDC_ETH_03_ADDRESS = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

  let client: PolywrapClient;
  let fsUri: string;
  let tokens: Token[];
  let pool: Pool;
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
    // set up test case data
    pool = await getPoolFromAddress(client, fsUri, USDC_ETH_03_ADDRESS, true);
    tokens = getTokens([pool]);
    // set up ethers provider
    ethersProvider = new ethers.providers.JsonRpcProvider("http://localhost:8546");
  });

  afterAll(async () => {
    await stopInfra();
  });

  it("execSwap: eth -> usdc", async () => {
    const recipient = await ethersProvider.getSigner(0).getAddress();
    const t = ethersProvider.getSigner(0)

    const ETH: Token = await getNative(client, fsUri, ChainIdEnum.MAINNET);
    const USDC: Token = tokens.find(token => token.currency.symbol === "USDC") as Token;

    // eth -> usdc preparation
    const usdcOut: TokenAmount = { token: USDC, amount: "10000000000" }
    const ethUsdcTrade: Trade = (await bestTradeExactOut(client, fsUri, [pool], ETH, usdcOut))[0];

    // execSwap eth -> usdc
    const ethUsdcInvoke = await client.invoke<Ethereum_TxResponse>({
      uri: fsUri,
      method: "execSwap",
      args: {
        trades: [ethUsdcTrade],
        swapOptions: getSwapParams(recipient),
      },
    });
    if (!ethUsdcInvoke.ok) fail(ethUsdcInvoke.error);
    // console.log(ethUsdcInvoke)

    const ethUsdcHash: string = ethUsdcInvoke.value.hash ?? "";
    const ethUsdcTx = await ethersProvider.getTransaction(ethUsdcHash);
    const ethUsdcTxResponse = await ethUsdcTx.wait();
    expect(ethUsdcTxResponse.status).toBeTruthy();

    
    const mintPositionInvoke = await client.invoke<Ethereum_TxResponse>({
      uri: fsUri,
      method: "mintPosition",
      args: {
        poolAddress: USDC_ETH_03_ADDRESS,
        amount: "0.001",
        chainId: tokens[0].chainId,
        deadline: (Math.floor(Date.now() / 1000) + 600).toString(),
      }
    })

    if (!mintPositionInvoke.ok) fail(mintPositionInvoke.error);

    const mintPositionHash: string = mintPositionInvoke.value.hash ?? "";
    const mintPositionTx = await ethersProvider.getTransaction(mintPositionHash);
    const mintPositionTxResponse = await mintPositionTx.wait();
    expect(mintPositionTxResponse.status).toBeTruthy();
  });

});
