import { Web3ApiClient } from "@web3api/client-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as Types from "../w3Types"
import { getPlugins, getEnsUri } from "../testUtils"

jest.setTimeout(150000)

describe("transfer", () => {
    let client: Web3ApiClient;
    let ensUri: string;
    let node: Node;
    let accounts: Account[];

    beforeAll(async () => {
        const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
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

    it("should make a transfer", async () => {
        const response = await client.query<{ transfer: string }>({
          uri: ensUri,
          query: `
            mutation {
              transfer(
                params: $params
              )
            }
          `,
          variables: {
            params: {
              to: accounts[1].address,
              amount: 2
            }
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.transfer).toBeDefined()
    })
})


describe("transferAndConfirm", () => {
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

    it("should make a transfer and confirm", async () => {
        const response = await client.query<{ transferAndConfirm: Types.TransferConfirmation }>({
          uri: ensUri,
          query: `
            mutation {
              transferAndConfirm(
                params: $params,
                confirmations: $confirmations
              )
            }
          `,
          variables: {
            params: {
              to: accounts[1].address,
              amount: 2
            },
            confirmations: 1
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.transferAndConfirm).toBeDefined()
        expect(response.data?.transferAndConfirm.block).toBeDefined()
        expect(response.data?.transferAndConfirm.completed).toBeDefined()
        expect(response.data?.transferAndConfirm.currentConfirmation).toBeDefined()
        expect(response.data?.transferAndConfirm.expectedConfirmation).toBeDefined()
      })
})