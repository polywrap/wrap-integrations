import { Web3ApiClient } from "@web3api/client-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import { getEnsUri, getPlugins } from "../testUtils"

jest.setTimeout(150000)

describe("getPublicKey", () => {
    let client: Web3ApiClient;
    let ensUri: string;
    let node: Node;
    let accounts: Account[];

    beforeAll(async () => {
        const { ensAddress, ethereum, ipfs } = await initTestEnvironment()
        const { node: tzNode, accounts: tzAccounts } = await up()
        node = tzNode
        accounts = tzAccounts
        const signer = await InMemorySigner.fromSecretKey(accounts[0].secretKey);
        ensUri = await getEnsUri(ipfs, ensAddress);
        client = new Web3ApiClient({
            plugins: getPlugins({
              ipfs, 
              ensAddress, 
              ethereum,
              tezos: {
                name: "testnet",
                provider: node.url,
                signer
              }
            }),
        })
    })

    afterAll(async () => {
        await stopTestEnvironment()
        await down()
    })

    it("should check if public key is valid", async () => {
        const response = await client.query<{ getPublicKey: string }>({
          uri: ensUri,
          query: `
            query {
              getPublicKey
            }
          `,
        })
  
        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getPublicKey).toBe(accounts[0].publicKey)
    })
})