import { Web3ApiClient } from "@web3api/client-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as Types from "../w3Types"
import { getEnsUri, getPlugins } from "../testUtils"

jest.setTimeout(150000)

describe("getRevealEstimate", () => {
    let client: Web3ApiClient;
    let ensUri: string;
    let node: Node;
    let accounts: Account[];

    beforeAll(async () => {
        const { ensAddress, ethereum, ipfs } = await initTestEnvironment()
        const { node: tzNode, accounts: tzAccounts } = await up()
        node = tzNode
        accounts = tzAccounts
        ensUri = await getEnsUri(ipfs, ensAddress);
        client = new Web3ApiClient({
            plugins: getPlugins({
              ipfs, 
              ensAddress, 
              ethereum,
              tezos: {
                name: "testnet",
                provider: node.url,
                signer: await InMemorySigner.fromSecretKey(accounts[0].secretKey)
              }
            }),
        })
    })

    afterAll(async () => {
        await stopTestEnvironment()
        await down()
    })

    it("should return an error if account is already revealed", async () => {
        const params: Types.RevealParams = {}
        const response = await client.query<{ getRevealEstimate: Types.EstimateResult }>({
            uri: ensUri,
            query:`
                query {
                    getRevealEstimate(params: $params) 
                }
            `,
            variables: {
                params,
            }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getRevealEstimate?.error).toBe(true)
        expect(response.data?.getRevealEstimate.reason).toMatch(/account is already revealed/)  
      })
})