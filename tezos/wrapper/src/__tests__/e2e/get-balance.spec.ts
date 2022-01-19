import { Web3ApiClient } from "@web3api/client-js"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"

import { getPlugins, getEnsUri } from "../testUtils"

jest.setTimeout(150000)

describe("getBalance", () => {
    let client: Web3ApiClient;
    let ensUri: string;
    let node: Node;
    let accounts: Account[];

    beforeAll(async () => {
      const { ensAddress, ethereum, ipfs } = await initTestEnvironment()
      const { node: tezosNode, accounts: tezosAccounts } = await up()
      node = tezosNode
      accounts = tezosAccounts
      ensUri = await getEnsUri(ipfs, ensAddress);
      client = new Web3ApiClient({
          plugins: getPlugins({
            ipfs, 
            ensAddress, 
            ethereum,
            tezos: {
              name: "testnet",
              provider: node.url,
            }
          }),
      })
    })

    afterAll(async () => {
      await down()
      await stopTestEnvironment()
    })

    it("should check the balance of a valid address", async () => {
      const response =  await client.query<{ getBalance: string }>({
        uri: ensUri,
        query: `
          query {
            getBalance(address: $address)
          }
        `,
        variables: {
          address: accounts[0].address
        }
      })

      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.getBalance).toBeDefined()
      expect(response.data?.getBalance).toBe("2000000000000")
    })

    it("should fail if the address is invalid", async () => {
      const response =  await client.query<{ getBalance: string }>({
        uri: ensUri,
        query: `
          query {
            getBalance(address: "gssdYKcSKhE9JhMg2rjnZVw6DfJTg7eZU8AL")
          }
        `,
      })

      expect(response.errors).toBeDefined()
      expect(response.data?.getBalance).toBeUndefined()
    })
})