import { tezosPlugin } from "..";
import * as Schema from "../w3";
import { deployContract, SIMPLE_CONTRACT, SIMPLE_CONTRACT_STORAGE } from "../scripts/deploy"

import { up, down, Account, Node } from "@web3api/tezos-test-env"
import { Web3ApiClient } from "@web3api/client-js";
import { InMemorySigner } from "@taquito/signer";

jest.setTimeout(360000)

describe("Tezos Plugin", () => {  
  let client: Web3ApiClient;
  let uri: string;
  let accounts: Account[];
  let node: Node;

  beforeAll(async () => {
    uri = "w3://ens/tezos.web3api.eth"
    const response = await up()
    node = response.node
    accounts = response.accounts
    client = new Web3ApiClient({
      plugins: [
        {
          uri,
          plugin: tezosPlugin({
            networks: {
              mainnet: {
                provider: "https://rpc.tzstats.com"
              },
              testnet: {
                provider: node.url,
                signer: await InMemorySigner.fromSecretKey(accounts[0].secretKey)
              }
            },
            defaultNetwork: "testnet"
          }),
        },
      ],
    });
  });

  afterAll(async () => {
    await down()
  })

  describe("Query", () => {
    describe("getContractStorage", () => {
      it("should get storage of contract", async () => {
        const response =  await client.query<{ getContractStorage: string }>({
          uri,
          query: `
            query {
              getContractStorage(address: $address, connection: $connection, key: $key, field: $field)
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

    describe("checkAddress", () => {
      it("should check if address is valid", async () => {
        const validAddress = "tz1VQnqCCqX4K5sP3FNkVSNKTdCAMJDd3E1n"
        const response =  await client.query<{ checkAddress: boolean }>({
          uri,
          query: `
            query {
              checkAddress(address: "${validAddress}")
            }
          `,
        })

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.checkAddress).toBe(true)
      })

      it("should check invalid address", async () => {
        const invalidAddress = "zxcbvbwqiosdkdsjkdsjkdfjkdd"
        const response = await client.query<{ checkAddress: boolean }>({
          uri,
          query: `
            query {
              checkAddress(address: "${invalidAddress}")
            }
          `,
        })

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.checkAddress).toBe(false)
      })
    })

    describe("getBalance", () => {
      it("should check if address is valid", async () => {
        const response =  await client.query<{ getBalance: string }>({
          uri,
          query: `
            query {
              getBalance(address: "tz1dYKcSKhE9JhMg2rjnZVw6DfJTg7eZU8AL")
            }
          `,
        })

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getBalance).toBeDefined()
      })
    })

    describe("getPublicKey",() => {
      it("should check if public key is valid", async () => {
        const response = await client.query<{ getPublicKey: string }>({
          uri,
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

    describe("getPublicKeyHash", () => {
      it("should check if public key hash is valid", async () => {
        const response = await client.query<{ getPublicKeyHash: string }>({
          uri,
          query: `
            query {
              getPublicKeyHash
            }
          `,
        })
  
        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getPublicKeyHash).toBe(accounts[0].address)  
      })
    })

    describe("getRevealEstimate", () => {
      it("should return an error if account is already revealed", async () => {
        const params: Schema.RevealParams = {}
        const response = await client.query<{ getRevealEstimate: Schema.EstimateResult }>({
          uri,
          query:`
            query {
              getRevealEstimate(params: ${params}) 
            }
          `
        })

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getRevealEstimate?.error).toBe(true)
        expect(response.data?.getRevealEstimate.reason).toMatch(/account is already revealed/)  
      })

      it.todo('gives an estimate of revealing an account')
    })

    describe("getTransferEstimate", () => {
      it("should estimate the cost to make a transfer operation", async () => {
        const params: Schema.TransferParams = {
          to: 'tz1QQyn4VqqD9KGShaWDHPSVQnDuzq47tvSj',
          amount: 100
        }
        const response = await client.query<{ getTransferEstimate: Schema.EstimateResult }>({
          uri,
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
        const params: Schema.TransferParams = {
          to: 'invalid-address',
          amount: 100
        }
        const response = await client.query<{ getTransferEstimate: Schema.EstimateResult }>({
          uri,
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
        expect(response.data?.getTransferEstimate.estimate).toBeUndefined()
      })
    })

    describe("getOriginateEstimate", () => {
      it("should fail if code parameter is invalid", async () => {
        const params: Schema.OriginateParams = {
          code: '',
          storage: ''
        }
        const response = await client.query<{ getOriginateEstimate: Schema.EstimateResult }>({
          uri,
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
        expect(response.data?.getOriginateEstimate.estimate).toBeUndefined()
      })

      it("should estimate the cost to make an origination operation", async () => {
        const params: Schema.OriginateParams = {
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
        const response = await client.query<{ getOriginateEstimate: Schema.EstimateResult }>({
          uri,
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
  })

  describe("Mutation", () => {
    describe("callContractMethod", () => {
      it("should be able to call contract's method", async () => {
        const contractAddress = await deployContract(node.url, accounts[0].secretKey, {
          code: SIMPLE_CONTRACT, 
          storage: SIMPLE_CONTRACT_STORAGE
        })
        const response = await client.query<{ callContractMethod: Schema.TxOperation }>({
          uri,
          query: `
            mutation {
              callContractMethod (
                address: $address,
                method: $method,
                args: $args
              )
            }
          `,
          variables: {
            address: contractAddress,
            method: "increment",
            args: JSON.stringify([2])
          }
        })
        expect(response.errors).toBeUndefined()
        expect(response.data?.callContractMethod).toBeDefined()
      })
    })

    describe("callContractMethodAndConfirmation", () => {
      it("should be able to call contract's method and confirm", async () => {
        const contractAddress = await deployContract(node.url, accounts[0].secretKey, {
          code: SIMPLE_CONTRACT, 
          storage: SIMPLE_CONTRACT_STORAGE
        })
        const response = await client.query<{ callContractMethodAndConfirmation: number }>({
          uri,
          query: `
            mutation {
              callContractMethodAndConfirmation (
                address: $address,
                method: $method,
                args: $args,
                confirmations: $confirmations,
                interval: $interval,
                timeout: $timeout
              )
            }
          `,
          variables: {
            address: contractAddress,
            method: "increment",
            args: JSON.stringify([2]),
            confirmations: 1,
            interval: 10,
            timeout: 200
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.callContractMethodAndConfirmation).toBeDefined()
      })
    })

    describe("transfer", () => {
      it("should make a transfer", async () => {
        const response = await client.query<{ transfer: string }>({
          uri,
          query: `
            mutation {
              transfer(
                params: $params
              )
            }
          `,
          variables: {
            params: {
              to: 'tz1QD2Cp8uoxn7tCEfxGsqE6FiXkYXJwNeS1',
              amount: 2
            }
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.transfer).toBeDefined()
      })
    })

    describe("transferAndConfirm", () => {
      it("should make a transfer and confirm", async () => {
        const response = await client.query<{ transferAndConfirm: Schema.TransferConfirmation }>({
          uri,
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
              to: 'tz1QD2Cp8uoxn7tCEfxGsqE6FiXkYXJwNeS1',
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

    describe("signMessage", () => {
      it("signs a message", async () => {
        const message = "random-message"
        const response = await client.query<{ signMessage: Schema.SignResult }>({
          uri,
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

    describe("originate", () => {
      it("should fail if provided with invalid init value", async () => {
        const response = await client.query<{ originate: Schema.OriginationResponse }>({
          uri,
          query: `
            mutation {
              originate(
                params: $params
              )
            }
          `,
          variables: {
            params: {
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
            }
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.originate.error).toBe(true)
        expect(response.data?.originate.reason).toMatch(/Wrong init parameter type/)
      })

      it("should originate a contract", async () => {
        const response = await client.query<{ originate: Schema.OriginationResponse }>({
          uri,
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
              init: `0`
            }
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.originate.error).toBe(false)
        expect(response.data?.originate.origination).toBeDefined()
      })
    })

    describe("originateAndConfirm", () => {
      it("should originate a contract and confirm", async () => {
        const response = await client.query<{ originateAndConfirm: Schema.OriginationConfirmationResponse }>({
          uri,
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
              init: `0`,
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
  })
});