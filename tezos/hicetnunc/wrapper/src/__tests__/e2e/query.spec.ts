import path from "path"
import { Web3ApiClient } from "@web3api/client-js"
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as QuerySchema from "../../query/w3"
import { getPlugins } from "../testUtils"

jest.setTimeout(150000)

describe("getBalanceOfData", () => {
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

  it("should return balance", async () => {
    const response =  await client.query<{ getBalanceOf: QuerySchema.GetBalanceResponse}>({
      uri: ensUri,
      query: `
        query {
          getBalanceOf(
            network: mainnet,
            owner: $owner, 
            token_id: $token_id 
          )
        }
      `,
      variables: {
        owner: "tz1UBZUkXpKGhYsP5KtzDNqLLchwF4uHrGjw",
        token_id: "152",
      }
    })

    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.getBalanceOf).toBeDefined()
    expect(response.data?.getBalanceOf.owner).toBeDefined()
    expect(response.data?.getBalanceOf.token_id).toBeDefined()
    expect(response.data?.getBalanceOf.balance).toBeDefined()
  })

  it("should get token metadata on mainnet", async () => {
    const response =  await client.query<{ getTokenMetadata: QuerySchema.GetTokenMetadataResponse}>({
      uri: ensUri,
      query: `
        query {
          getTokenMetadata(
            network: mainnet,
            token_id: $token_id
          )
        }
      `,
      variables: {
        token_id: "152",
      }
    })

    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.getTokenMetadata.token_id).toBeDefined()
    expect(response.data?.getTokenMetadata.ipfs_hash).toBeDefined()
  })

  it("should count token on mainnet", async () => {
    const response =  await client.query<{ getTokenCountData: QuerySchema.GetTokenCountResponse}>({
      uri: ensUri,
      query: `
        query {
          getTokenCountData(
            network: mainnet
          )
        }
      `,
      variables: {
      }
    })

    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.getTokenCountData.tokenCount).toBeDefined()
  })


  it("should swap data", async () => {
    const response =  await client.query<{ getSwapsData: QuerySchema.GetSwapsResponse}>({
      uri: ensUri,
      query: `
        query {
          getSwapsData(
            network: mainnet,
            swap_id: $swap_id
          )
        }
      `,
      variables: {
        swap_id: "500004"
      }
    });
    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.getSwapsData).toBeDefined()
    expect(response.data?.getSwapsData.creator).toBeDefined()
    expect(response.data?.getSwapsData.issuer).toBeDefined()
    expect(response.data?.getSwapsData.objkt_amount).toBeDefined()
    expect(response.data?.getSwapsData.objkt_id).toBeDefined()
    expect(response.data?.getSwapsData.royalties).toBeDefined()
  })
})