import path from "path"
import { Web3ApiClient } from "@web3api/client-js"
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as QuerySchema from "../../query/w3"
import { getPlugins } from "../testUtils"

jest.setTimeout(150000)

describe("Query", () => {
  let client: Web3ApiClient;
  let ensUri: string;

  beforeAll(async () => {
    const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
    const apiPath = path.join(__dirname, "/../../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
    ensUri = `ens/testnet/${api.ensDomain}`;
    client = new Web3ApiClient({
        plugins: getPlugins(ipfs, ensAddress, ethereum),
    })
  })

  afterAll(async () => {
    await stopTestEnvironment()
  })

  describe("getBalanceOfData", () => {
    it("should return balance", async () => {
      const response =  await client.query<{ getBalanceOf: QuerySchema.TokenBalance }>({
        uri: ensUri,
        query: `
          query {
            getBalanceOf(
              network: mainnet,
              owner: $owner, 
              tokenId: $tokenId 
            )
          }
        `,
        variables: {
          owner: "tz1UBZUkXpKGhYsP5KtzDNqLLchwF4uHrGjw",
          tokenId: "152",
        }
      })
  
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.getBalanceOf).toBeDefined()
      expect(response.data?.getBalanceOf.owner).toBeDefined()
      expect(response.data?.getBalanceOf.tokenId).toBeDefined()
      expect(response.data?.getBalanceOf.balance).toBeDefined()
    })
  })

  describe("getTokenMetadata", () => {
    it("should get token metadata on mainnet", async () => {
      const response =  await client.query<{ getTokenMetadata: QuerySchema.TokenMetadata }>({
        uri: ensUri,
        query: `
          query {
            getTokenMetadata(
              network: mainnet,
              tokenId: $tokenId
            )
          }
        `,
        variables: {
          tokenId: "703989",
        }
      })
  
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.getTokenMetadata.tokenId).toBeDefined()
      expect(response.data?.getTokenMetadata.ipfsHash).toBeDefined()
    })
  })

  describe("getTokenCountData", () => {
    it("should count token on mainnet", async () => {
      const response = await client.query<{ getTokenCountData: string }>({
        uri: ensUri,
        query: `
          query {
            getTokenCountData(
              network: mainnet
            )
          }
        `,
      })
  
      expect(response.errors).toBeUndefined()
      expect(response.data?.getTokenCountData).toBeDefined()
    })
  })

  describe("getSwapData", () => {
    it("should swap data", async () => {
      const response =  await client.query<{ getSwapData: QuerySchema.SwapData }>({
        uri: ensUri,
        query: `
          query {
            getSwapData(
              network: mainnet,
              swapId: $swapId
            )
          }
        `,
        variables: {
          swapId: "500004"
        }
      });
  
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.getSwapData).toBeDefined()
      expect(response.data?.getSwapData.creator).toBeDefined()
      expect(response.data?.getSwapData.issuer).toBeDefined()
      expect(response.data?.getSwapData.objktAmount).toBeDefined()
      expect(response.data?.getSwapData.objktId).toBeDefined()
      expect(response.data?.getSwapData.royalties).toBeDefined()
    })
  })
})