import { Web3ApiClient } from "@web3api/client-js"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import { getEnsUri, getPlugins } from "../testUtils"

jest.setTimeout(150000)

describe("checkAddress", () => {
    let client: Web3ApiClient;
    let ensUri: string;

    beforeAll(async () => {
      const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
      ensUri = await getEnsUri(ipfs, ensAddress);
      client = new Web3ApiClient({
          plugins: getPlugins({
            ipfs, 
            ensAddress, 
            ethereum
          }),
      })
    })

    afterAll(async () => {
        await stopTestEnvironment()
    })

    it("should return `true` when checking the validity of a valid address", async () => {
        const response =  await client.query<{ checkAddress: boolean }>({
          uri: ensUri,
          query: `
            query {
              checkAddress(address: "tz1VQnqCCqX4K5sP3FNkVSNKTdCAMJDd3E1n")
            }
          `,
        })

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.checkAddress).toBe(true)
    })

    it("should return `false` when checking the validity of an invalid address", async () => {
        const response =  await client.query<{ checkAddress: boolean }>({
            uri: ensUri,
            query: `
              query {
                checkAddress(address: "sackksalaskiewkds2932030")
              }
            `,
          })
  
        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.checkAddress).toBe(false)    
    })
})