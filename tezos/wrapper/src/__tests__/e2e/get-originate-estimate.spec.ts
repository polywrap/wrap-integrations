import { Web3ApiClient } from "@web3api/client-js"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"

import * as Types from "../w3Types"
import { getPlugins, getEnsUri } from "../testUtils"

jest.setTimeout(150000)

describe("getOriginateEstimate", () => {
    let client: Web3ApiClient;
    let ensUri: string;
    let node: Node;
    let accounts: Account[];

    beforeAll(async () => {
        const { ensAddress, ethereum, ipfs } = await initTestEnvironment()
        const { node: tezosNode, accounts: tezosAccounts } = await up()
        node = tezosNode
        accounts = tezosAccounts
        const signer = await InMemorySigner.fromSecretKey(accounts[0].secretKey)
        ensUri = await getEnsUri(ipfs, ensAddress);
        client = new Web3ApiClient({
            plugins: getPlugins({
              ipfs, 
              ensAddress, 
              ethereum,
              tezos: {
                name: "testnet",
                provider: node.url,
                signer: signer
              }
            }),
        })
    })
    
    afterAll(async () => {
        await stopTestEnvironment()
        await down()
    })

    it("should fail if code parameter is invalid", async () => {
        const params: Types.OriginateParams = {
          code: '',
          storage: ''
        }
        const response = await client.query<{ getOriginateEstimate: Types.EstimateResult }>({
          uri: ensUri,
          query:`
            query {
              getOriginateEstimate(params: $params) 
            }
          `,
          variables: {
            params
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.getOriginateEstimate).toBeDefined()
        expect(response.data?.getOriginateEstimate?.error).toBe(true)
        expect(response.data?.getOriginateEstimate.reason).toMatch(/Invalid code parameter/)
      })

      it("should estimate the cost to make an origination operation", async () => {
        const params: Types.OriginateParams = {
          code: `
          parameter unit;
          storage unit;
          code {
                 CDR ;
                 NIL operation ;
                 AMOUNT;
                 PUSH mutez 0;
                 IFCMPEQ
                   # Typical scenario, no operation needed
                   {
                   }
                   # Return funds if sent by mistake
                   {
                     SOURCE ;
                     CONTRACT unit ;
                     ASSERT_SOME ;
                     AMOUNT ;
                     UNIT ;
                     TRANSFER_TOKENS ;
                     CONS ;
                   };
                 PAIR;
               }
          `,
          storage: ''
        }
        const response = await client.query<{ getOriginateEstimate: Types.EstimateResult }>({
          uri: ensUri,
          query:`
            query {
              getOriginateEstimate(params: $params) 
            }
          `,
          variables: {
            params
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.getOriginateEstimate).toBeDefined()
        expect(response.data?.getOriginateEstimate?.error).toBe(false)
        expect(response.data?.getOriginateEstimate.estimate).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.burnFeeMutez).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.gasLimit).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.minimalFeeMutez).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.opSize).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.storageLimit).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.suggestedFeeMutez).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.totalCost).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.usingBaseFeeMutez).toBeDefined()
        expect(response.data?.getOriginateEstimate.estimate?.consumedMilligas).toBeDefined()
      })
})