import { Web3ApiClient } from "@web3api/client-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as Types from "../w3Types"
import { getPlugins, getEnsUri } from "../testUtils"

jest.setTimeout(150000)

describe("originate", () => {
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

    it("should originate a contract", async () => {
      const response = await client.query<{ originate: Types.OriginationResponse }>({
        uri: ensUri,
        query: `
          mutation {
            originate(
              params: $params
            )
          }
        `,
        variables: {
          params: {
            code: `{ parameter (or (int %decrement) (int %increment)) ;
              storage int ;
              code { DUP ;
                      CDR ;
                      DIP { DUP } ;
                      SWAP ;
                      CAR ;
                      IF_LEFT
                        { DIP { DUP } ;
                          SWAP ;
                          DIP { DUP } ;
                          PAIR ;
                          DUP ;
                          CAR ;
                          DIP { DUP ; CDR } ;
                          SUB ;
                          DIP { DROP 2 } }
                        { DIP { DUP } ;
                          SWAP ;
                          DIP { DUP } ;
                          PAIR ;
                          DUP ;
                          CAR ;
                          DIP { DUP ; CDR } ;
                          ADD ;
                          DIP { DROP 2 } } ;
                      NIL operation ;
                      PAIR ;
                      DIP { DROP 2 } } }
                  `,
            storage: `${0}`
          }
        }
      })

      expect(response.errors).toBeUndefined()
      expect(response.data?.originate.error).toBe(false)
      expect(response.data?.originate.origination).toBeDefined()
    })
})


describe("originateAndConfirm", () => {
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

    it("should originate a contract and confirm", async () => {
        const response = await client.query<{ originateAndConfirm: Types.OriginationConfirmationResponse }>({
          uri: ensUri,
          query: `
            mutation {
              originateAndConfirm(
                params: $params,
                confirmations: $confirmations,
                interval: $interval,
                timeout: $timeout
              )
            }
          `,
          variables: {
            params: {
              code: `{ parameter (or (int %decrement) (int %increment)) ;
                storage int ;
                code { DUP ;
                       CDR ;
                       DIP { DUP } ;
                       SWAP ;
                       CAR ;
                       IF_LEFT
                         { DIP { DUP } ;
                           SWAP ;
                           DIP { DUP } ;
                           PAIR ;
                           DUP ;
                           CAR ;
                           DIP { DUP ; CDR } ;
                           SUB ;
                           DIP { DROP 2 } }
                         { DIP { DUP } ;
                           SWAP ;
                           DIP { DUP } ;
                           PAIR ;
                           DUP ;
                           CAR ;
                           DIP { DUP ; CDR } ;
                           ADD ;
                           DIP { DROP 2 } } ;
                       NIL operation ;
                       PAIR ;
                       DIP { DROP 2 } } }
                    `,
              storage: `0`,
            },
            confirmations: 1,
            interval: 10,
            timeout: 200
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.originateAndConfirm.confirmation).toBeDefined()
        expect(response.data?.originateAndConfirm.origination).toBeDefined()
      })
})