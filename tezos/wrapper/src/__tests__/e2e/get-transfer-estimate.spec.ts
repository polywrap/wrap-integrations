import { Web3ApiClient } from "@web3api/client-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as Types from "../w3Types"
import { getPlugins, getEnsUri } from "../testUtils"

jest.setTimeout(150000)

describe("getTransferEstimate", () => {
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

    it("should estimate the cost to make a transfer operation", async () => {
        const params: Types.TransferParams = {
          to: 'tz1QQyn4VqqD9KGShaWDHPSVQnDuzq47tvSj',
          amount: 100
        }
        const response = await client.query<{ getTransferEstimate: Types.EstimateResult }>({
          uri: ensUri,
          query:`
            query {
              getTransferEstimate(params: $params) 
            }
          `,
          variables: {
            params
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.getTransferEstimate).toBeDefined()
        expect(response.data?.getTransferEstimate?.error).toBe(false)
        expect(response.data?.getTransferEstimate.estimate).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.burnFeeMutez).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.gasLimit).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.minimalFeeMutez).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.opSize).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.storageLimit).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.suggestedFeeMutez).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.totalCost).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.usingBaseFeeMutez).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate?.consumedMilligas).toBeDefined()
      })

      it("should fail to estimate the cost to make a transfer if address is invalid", async () => {
        const params: Types.TransferParams = {
          to: 'invalid-address',
          amount: 100
        }
        const response = await client.query<{ getTransferEstimate: Types.EstimateResult }>({
          uri: ensUri,
          query:`
            query {
              getTransferEstimate(params: $params) 
            }
          `,
          variables: {
            params
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.getTransferEstimate).toBeDefined()
        expect(response.data?.getTransferEstimate?.error).toBe(true)
        expect(response.data?.getTransferEstimate.reason).toBeDefined()
      })
})