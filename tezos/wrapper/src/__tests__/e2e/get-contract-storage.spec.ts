import { Web3ApiClient } from "@web3api/client-js"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import { getEnsUri, getPlugins } from "../testUtils"

jest.setTimeout(150000)

describe("getContractStorage", () => {
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

    it("should get storage of contract", async () => {
        const response =  await client.query<{ getContractStorage: string }>({
          uri: ensUri,
          query: `
            query {
              getContractStorage(
                  address: $address, 
                  connection: $connection, 
                  key: $key, 
                  field: $field
              )
            }
          `,
          variables: {
            address: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9",
            connection: {
              networkNameOrChainId: "mainnet"
            },
            key: "oracleData",
            field: "BTC-USD"
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getContractStorage).toBeDefined()
        expect(response.data?.getContractStorage).not.toBe("")
      })
})