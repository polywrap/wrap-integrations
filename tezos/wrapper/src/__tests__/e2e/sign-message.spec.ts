import { Web3ApiClient } from "@web3api/client-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as Types from "../w3Types"
import { getPlugins, getEnsUri } from "../testUtils"

jest.setTimeout(150000)

describe("signMessage", () => {
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

    it("signs a message", async () => {
        const message = "random-message"
        const response = await client.query<{ signMessage: Types.SignResult }>({
          uri: ensUri,
          query: `
            mutation {
              signMessage(
                message: "${message}"
              )
            }
          `
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.signMessage).toBeDefined()
        expect(response.data?.signMessage.sig).toBeDefined()
        expect(response.data?.signMessage.bytes).toBeDefined()
        expect(response.data?.signMessage.sbytes).toBeDefined()
        expect(response.data?.signMessage.prefixSig).toBeDefined()
      })
})

