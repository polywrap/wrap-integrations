import path from "path"
import { Web3ApiClient } from "@web3api/client-js"
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as QuerySchema from "../../query/w3"
import { getPlugins } from "../testUtils"

jest.setTimeout(150000)


describe("listTokenPairs", () => {
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
    
  it("should get a list of Token Pairs from Storage", async () => {
    const response =  await client.query<{ listTokenPairs: QuerySchema.ListTokenPairsResponse}>({
      uri: ensUri,
      query: `
        query {
          listTokenPairs(
            network: mainnet
          )
        }
      `,
      variables: {
      }
    })

    
    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.listTokenPairs).toBeDefined()
    expect(response.data?.listTokenPairs.token_list).toBeDefined()
  })
  
})

describe("getTokenSupply", () => {
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
    
  it("should get a list of Assets from a Provider", async () => {
    const response =  await client.query<{ getTokenSupply: QuerySchema.GetTokenSupplyResponse}>({
      uri: ensUri,
        query: `
          query {
            getTokenSupply(
              pair_id: $pair_id,
              network: mainnet
            )
          }
          `,
          variables: {
            pair_id: "0",
            network: "granadanet",
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
    
  it("should get Candle data from a Provider", async () => {
    const response =  await client.query<{ getLPTokenBalance: QuerySchema.GetLPTokenBalanceResponse}>({
      uri: ensUri,
        query: `
          query {
            getLPTokenBalance(
              network: mainnet
              owner: $owner 
              pair_id: $pair_id
            )
          }
          `,
          variables: {
            owner: "tz1LSMu9PugfVyfX2ynNU9y4eVvSACJKP7sg",
            pair_id: "0",
            network: "granadanet",
          }
        })
    
    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.getLPTokenBalance).toBeDefined()
    expect(response.data?.getLPTokenBalance.balance).toBeDefined()
  })
  
})
