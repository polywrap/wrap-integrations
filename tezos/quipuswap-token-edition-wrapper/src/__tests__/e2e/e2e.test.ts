import path from "path"
import { Web3ApiClient } from "@web3api/client-js"
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as QuerySchema from "../../query/w3"
import { getPlugins } from "../testUtils"

jest.setTimeout(150000)

describe("e2e", () => {
  let client: Web3ApiClient;
  let ensUri: string;

  beforeAll(async () => {
    const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
    const apiPath = path.join(__dirname, "/../../..");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
    ensUri = `ens/testnet/${api.ensDomain}`;
    client = new Web3ApiClient({
        plugins: getPlugins(ipfs, ensAddress, ethereum),
    })
  })

  afterAll(async () => {
    await stopTestEnvironment()
  })

  describe("Query", () => {
    describe("listTokenPairs", () => {
      it("should get a list of token pairs from storage", async () => {
        const response =  await client.query<{ listTokenPairs: object }>({
          uri: ensUri,
          query: `
            query {
              listTokenPairs(
                network: mainnet
              )
            }
          `,
        });

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.listTokenPairs).toBeDefined()
      })
    })
      
    describe("getTokenSupply", () => {
      it("should get a list of assets from a provider", async () => {
        const response =  await client.query<{ getTokenSupply: QuerySchema.GetTokenSupplyResponse}>({
          uri: ensUri,
            query: `
              query {
                getTokenSupply(
                  pairId: $pairId,
                  network: mainnet
                )
              }`,
          variables: {
            pairId: "0"
          }
        })
    
        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getTokenSupply).toBeDefined()
        expect(response.data?.getTokenSupply.token_a_pool).toBeDefined()
        expect(response.data?.getTokenSupply.token_b_pool).toBeDefined()
        expect(response.data?.getTokenSupply.total_supply).toBeDefined()
      })
    })

    describe("getLPTokenBalance", () => {
      it("should get candle data from a provider", async () => {
        const response = await client.query<{ getLPTokenBalance: string }>({
          uri: ensUri,
          query: `
            query {
              getLPTokenBalance(
                network: mainnet
                owner: $owner 
                pairId: $pairId
              )
          }`,
          variables: {
            owner: "tz1LSMu9PugfVyfX2ynNU9y4eVvSACJKP7sg",
            pairId: "0"
          }
        })
      
        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getLPTokenBalance).toBeDefined()
      })
    })
  })

  describe("Mutation", () => {
    describe("addOperator", () => {
      it.todo("should add operator");
    })
    
    describe("removeOperator", () => {
      it.todo("should remove operator");
    })

    describe("swapMultiHop", () => {
      it.todo("should swap multiple tokens");
    })

    describe("swap", () => {
      it.todo("should swap tokens directly");
    })

    describe("transfer", () => {
      it.todo("should transfer token from caller/sender");
    })

    describe("transferFrom", () => {
      it.todo("should transfer token from address provided");
    })

    describe("invest", () => {
      it.todo("should invest into a token pair");
    })

    describe("divest", () => {
      it.todo("should divest into a token pair");
    })
  })
})