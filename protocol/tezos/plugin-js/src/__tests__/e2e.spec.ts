import { tezosPlugin } from "..";
import { SIMPLE_CONTRACT, SIMPLE_CONTRACT_STORAGE } from "./contracts/simple-contract"
import { PolywrapClient } from "@polywrap/client-js";
import { InMemorySigner } from "@taquito/signer";
import { TransferParams, OperationStatus, RevealParams, EstimateResult, SendParams, OriginateParams, TxOperation, TransferConfirmation, SignResult, OriginationResponse, OriginationConfirmationResponse } from "./types/wrap";

const { up, down, Account, Node, deployContract } = require("../../../test-env")

jest.setTimeout(360000)

describe("Tezos Plugin", () => {  
  let client: PolywrapClient;
  let uri: string;
  let accounts: typeof Account[];
  let node: typeof Node;
  let simpleContractAddress: string | undefined;

  beforeAll(async () => {
    uri = "wrap://ens/tezos.web3api.eth"
    const response = await up()
    node = response.node
    accounts = response.accounts
    const deployedResponse = await deployContract(accounts[0], {
      code: SIMPLE_CONTRACT, 
      storage: SIMPLE_CONTRACT_STORAGE
    }, 1)
    simpleContractAddress = deployedResponse.contractAddress
    client = new PolywrapClient({
      plugins: [
        {
          uri,
          plugin: tezosPlugin({
            networks: {
              mainnet: {
                provider: "https://rpc.tzstats.com"
              },
              ghostnet: {
                provider: "https://rpc.ghost.tzstats.com"
              },
              testnet: {
                provider: node.url,
                signer: await InMemorySigner.fromSecretKey(accounts[0].secretKey),
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
    describe("getContractCallTransferParams", () => {
      it("should get the transferParams of a contract call", async () => {
        const response = await client.invoke<{ getContractCallTransferParams: TransferParams }>({
          uri,
          method: "getContractCallTransferParams",
          args: {
            address: simpleContractAddress,
            method: "increment",
            args: "[10]",
            params: {
              mutez: true
            },
            connection: {
              networkNameOrChainId: "testnet"
            }
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.getContractCallTransferParams).toBeDefined()
        expect(response.data?.getContractCallTransferParams.to).toBe(simpleContractAddress)
        expect(response.data?.getContractCallTransferParams.mutez).toBe(true)
        expect(response.data?.getContractCallTransferParams.parameter).toBeDefined()
      })
    })

    describe("encodeMichelsonExpressionToBytes", () => {
      it("should encode a michelson expression to bytes", async () => {
        const response = await client.invoke<{ encodeMichelsonExpressionToBytes: string }>({
          uri,
          method: "encodeMichelsonExpressionToBytes",
          args: {
            expression: `{
              "prim": "pair",
              "args": [
                  {
                      "prim": "pair",
                      "args": [
                          {
                              "annots": ["%label"],
                              "prim": "bytes"
                          },
                          {
                              "annots": ["%owner"],
                              "prim": "address"
                          }
                      ]
                  },
                  {
                      "annots": ["%nonce"],
                      "prim": "nat"
                  }
              ]
            }`,
            value: `{
              "label": "636f6d6d6974", 
              "owner": "tz1VxMudmADssPp6FPDGRsvJXE41DD6i9g6n", 
              "nonce": 491919002 
            }`
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.encodeMichelsonExpressionToBytes).toBe('05070707070a00000006636f6d6d69740a0000001600007128c922351e2a0b591f36ce638880052891b9f6009ada90d503')
      })
    })

    describe("callContractView", () => {
      it("should call contract view to get balance of address", async () => {
        const response = await client.invoke<{ callContractView: string }>({
          uri,
          method: "callContractView",
          args: {
            address: "KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8", 
            view: "getBalance",
            args: '["tz1c1X8vD4pKV9TgV1cyosR7qdnkc8FTEyM1"]',
            connection: {
              networkNameOrChainId: "mainnet"
            }
          }
        })
        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.callContractView).toBeDefined()
      })
    })

    describe("getContractStorage", () => {
      it("should get storage of contract", async () => {
        const response =  await client.invoke<{ getContractStorage: string }>({
          uri,
          method: "getContractStorage",
          args: {
            address: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9", 
            connection: {
              networkNameOrChainId: "mainnet"
            }, 
            key: "oracleData", 
            field: "BTC-USD"
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getContractStorage).toBeDefined()
        expect(response.data?.getContractStorage).not.toBe("")
      })

      it("should get storage data when a field is not provided ", async () => {
        const response =  await client.invoke<{ getContractStorage: string }>({
          uri,
          method: "getContractStorage",
          args: {
            address: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton", 
            connection: {
              networkNameOrChainId: "mainnet"
            }, 
            key: "all_tokens"
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getContractStorage).toBeDefined()
        expect(response.data?.getContractStorage).not.toBe("")
      })

      it("should parse storage data", async () => {
        const response =  await client.invoke<{ getContractStorage: string }>({
          uri,
          method: "getContractStorage",
          args: {
            address: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton", 
            connection: {
              networkNameOrChainId: "mainnet"
            }, 
            key: "token_metadata",
            field: "152"
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getContractStorage).toBeDefined()
        expect(response.data?.getContractStorage).not.toBe("")
      })

      it("should parse nested keys", async () => {
        const response =  await client.invoke<{ getContractStorage: string }>({
          uri,
          method: "getContractStorage",
          args: {
            address: "KT1VNEzpf631BLsdPJjt2ZhgUitR392x6cSi", 
            connection: {
              networkNameOrChainId: "mainnet"
            }, 
            key: "storage.ledger.['tz1aNYc3qpEXp9da8Qf5iBmaNWwZXtcgXwQV', 19]",
            field: "balance"
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getContractStorage).toBeDefined()
        expect(response.data?.getContractStorage).not.toBe("")
      })
    })

    describe("executeTzip16View",() => {
      it("should execute a tzip16 view", async () => {
        const response = await client.invoke<{ executeTzip16View: string }>({
          uri,
          method: "executeTzip16View",
          args: {
            address: "KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS",
            args: JSON.stringify(["616c6963652e74657a"]),
            viewName: "resolve-name",
            connection: {
              networkNameOrChainId: "mainnet"
            },
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.executeTzip16View).toBeDefined()
        expect(typeof response.data?.executeTzip16View).toBe('string')
      })
    })

    describe("getOperationStatus", () => {
      it("should get operation status", async () => {
        const response =  await client.invoke<{ getOperationStatus: OperationStatus }>({
          uri,
          method: "getOperationStatus",
          args: {
            network: "mainnet", 
            hash: "onkA3x4oUSjsqwKWSRJNsyKYMnKx2nNQqiYcjh13rrzyYtC9wks"
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getOperationStatus).toBeDefined()
        expect(response.data?.getOperationStatus).toBeDefined()
        expect(response.data?.getOperationStatus.hash).toBeDefined()
        expect(response.data?.getOperationStatus.type).toBeDefined()
        expect(response.data?.getOperationStatus.block).toBeDefined()
        expect(response.data?.getOperationStatus.time).toBeDefined()
        expect(response.data?.getOperationStatus.height).toBeDefined()
        expect(response.data?.getOperationStatus.cycle).toBeDefined()
        expect(response.data?.getOperationStatus.counter).toBeDefined()
        expect(response.data?.getOperationStatus.status).toBeDefined()
        expect(response.data?.getOperationStatus.is_success).toBeDefined()
        expect(response.data?.getOperationStatus.confirmations).toBeDefined()
      })

      it("should get operation status on ghostnet", async () => {
        const response =  await client.invoke<{ getOperationStatus: OperationStatus }>({
          uri,
          method: "getOperationStatus",
          args: {
            network: "ghostnet", 
            hash: "oot97Ak6cYpb3eofhQaTKpZLBoyeaYrb7xZSd2SoCv8GUXZT7sc"
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getOperationStatus).toBeDefined()
        expect(response.data?.getOperationStatus.hash).toBeDefined()
        expect(response.data?.getOperationStatus.type).toBeDefined()
        expect(response.data?.getOperationStatus.block).toBeDefined()
        expect(response.data?.getOperationStatus.time).toBeDefined()
        expect(response.data?.getOperationStatus.height).toBeDefined()
        expect(response.data?.getOperationStatus.cycle).toBeDefined()
        expect(response.data?.getOperationStatus.counter).toBeDefined()
        expect(response.data?.getOperationStatus.status).toBeDefined()
        expect(response.data?.getOperationStatus.is_success).toBeDefined()
        expect(response.data?.getOperationStatus.confirmations).toBeDefined()
      })
    })

    describe("checkAddress", () => {
      it("should check if address is valid", async () => {
        const validAddress = "tz1VQnqCCqX4K5sP3FNkVSNKTdCAMJDd3E1n"
        const response =  await client.invoke<{ checkAddress: boolean }>({
          uri,
          method: "checkAddress",
          args: {
            address: validAddress
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.checkAddress).toBe(true)
      })

      it("should check invalid address", async () => {
        const invalidAddress = "zxcbvbwqiosdkdsjkdsjkdfjkdd"
        const response = await client.invoke<{ checkAddress: boolean }>({
          uri,
          method: "checkAddress",
          args: {
            address: invalidAddress
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.checkAddress).toBe(false)
      })
    })

    describe("getBalance", () => {
      it("should check if address is valid", async () => {
        const response =  await client.invoke<{ getBalance: string }>({
          uri,
          method: "getBalance",
          args: {
            address: "tz1dYKcSKhE9JhMg2rjnZVw6DfJTg7eZU8AL"
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getBalance).toBeDefined()
      })
    })

    describe("getPublicKey",() => {
      it("should check if public key is valid", async () => {
        const response = await client.invoke<{ getPublicKey: string }>({
          uri,
          method: "getPublicKey",
        })
  
        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getPublicKey).toBe(accounts[0].publicKey)
      })
    })

    describe("getPublicKeyHash", () => {
      it("should check if public key hash is valid", async () => {
        const response = await client.invoke<{ getPublicKeyHash: string }>({
          uri,
          method: "getPublicKeyHash",
        })
  
        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getPublicKeyHash).toBe(accounts[0].address)  
      })
    })

    describe("getRevealEstimate", () => {
      it("should return an error if account is already revealed", async () => {
        const params: RevealParams = {}
        const response = await client.invoke<{ getRevealEstimate: EstimateResult }>({
          uri,
          method: "getRevealEstimate",
          args: {
            params: params
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getRevealEstimate?.error).toBe(true)
        expect(response.data?.getRevealEstimate.reason).toMatch(/account is already revealed/)  
      })

      it.todo('gives an estimate of revealing an account')
    })

    describe("getTransferEstimate", () => {
      it("should estimate the cost to make a transfer operation", async () => {
        const params: SendParams = {
          to: 'tz1QQyn4VqqD9KGShaWDHPSVQnDuzq47tvSj',
          amount: 100
        }
        const response = await client.invoke<{ getTransferEstimate: EstimateResult }>({
          uri,
          method: "getTransferEstimate",
          args: {
            params
          }
        })

        expect(response.error).toBeUndefined()
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
        const params: SendParams = {
          to: 'invalid-address',
          amount: 100
        }
        const response = await client.invoke<{ getTransferEstimate: EstimateResult }>({
          uri,
          method: "getTransferEstimate",
          args: {
            params
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.getTransferEstimate).toBeDefined()
        expect(response.data?.getTransferEstimate?.error).toBe(true)
        expect(response.data?.getTransferEstimate.reason).toBeDefined()
        expect(response.data?.getTransferEstimate.estimate).toBeUndefined()
      })
    })

    describe("getOriginateEstimate", () => {
      it("should fail if code parameter is invalid", async () => {
        const params: OriginateParams = {
          code: '',
          storage: ''
        }
        const response = await client.invoke<{ getOriginateEstimate: EstimateResult }>({
          uri,
          method: "getOriginateEstimate",
          args: {
            params
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.getOriginateEstimate).toBeDefined()
        expect(response.data?.getOriginateEstimate?.error).toBe(true)
        expect(response.data?.getOriginateEstimate.reason).toMatch(/Invalid code parameter/)
        expect(response.data?.getOriginateEstimate.estimate).toBeUndefined()
      })

      it("should estimate the cost to make an origination operation", async () => {
        const params: OriginateParams = {
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
        const response = await client.invoke<{ getOriginateEstimate: EstimateResult }>({
          uri,
          method: "getOriginateEstimate",
          args: {
            params
          }
        })

        expect(response.error).toBeUndefined()
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
        const response = await client.invoke<{ callContractMethod: TxOperation }>({
          uri,
          method: "callContractMethod",
          args: {
            address: simpleContractAddress,
            method: "increment",
            args: JSON.stringify([2])
          }
        })
        expect(response.error).toBeUndefined()
        expect(response.data?.callContractMethod).toBeDefined()
      })
    })

    describe("callContractMethodAndConfirmation", () => {
      it("should be able to call contract's method and confirm", async () => {
        const response = await client.invoke<{ callContractMethodAndConfirmation: number }>({
          uri,
          method: "callContractMethodAndConfirmation",
          args: {
            address: simpleContractAddress,
            method: "increment",
            args: JSON.stringify([2]),
            confirmations: 1,
            timeout: 200
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.callContractMethodAndConfirmation).toBeDefined()
      })
    })

    describe("transfer", () => {
      it("should make a transfer", async () => {
        const response = await client.invoke<{ transfer: string }>({
          uri,
          method: "transfer",
          args: {
            params: {
              to: accounts[1].address,
              amount: 2
            }
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.transfer).toBeDefined()
      })
    })

    describe("transferAndConfirm", () => {
      it("should make a transfer and confirm", async () => {
        const response = await client.invoke<{ transferAndConfirm: TransferConfirmation }>({
          uri,
          method: "transferAndConfirm",
          args: {
            params: {
              to: accounts[1].address,
              amount: 2
            },
            confirmations: 1
          }
        })

        expect(response.error).toBeUndefined()
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
        const response = await client.invoke<{ signMessage: SignResult }>({
          uri,
          method: "signMessage",
          args: {
            message: message
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.signMessage).toBeDefined()
        expect(response.data?.signMessage.sig).toBeDefined()
        expect(response.data?.signMessage.bytes).toBeDefined()
        expect(response.data?.signMessage.sbytes).toBeDefined()
        expect(response.data?.signMessage.prefixSig).toBeDefined()
      })
    })

    describe("originate", () => {
      it("should fail if provided with invalid init value", async () => {
        const response = await client.invoke<{ originate: OriginationResponse }>({
          uri,
          method: "originate",
          args: {
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
          },
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.originate.error).toBe(true)
        expect(response.data?.originate.reason).toMatch(/Wrong init parameter type/)
      })

      it("should originate a contract", async () => {
        const response = await client.invoke<{ originate: OriginationResponse }>({
          uri,
          method: "originate",
          args: {
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

        expect(response.error).toBeUndefined()
        expect(response.data?.originate.error).toBe(false)
        expect(response.data?.originate.origination).toBeDefined()
      })
    })

    describe("originateAndConfirm", () => {
      it("should originate a contract and confirm", async () => {
        const response = await client.invoke<{ originateAndConfirm: OriginationConfirmationResponse }>({
          uri,
          method: "originateAndConfirm",
          args: {
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
            timeout: 200
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.originateAndConfirm.confirmation).toBeDefined()
        expect(response.data?.originateAndConfirm.origination).toBeDefined()
      })
    })

    describe("batchContractCalls and batchWalletContractCalls",  () => {
      it("should batch multiple contract calls", async () => {
        const transferParamsResponse = await Promise.all([
          client.invoke<{ getContractCallTransferParams: TransferParams }>({
            uri,
            method: "getContractCallTransferParams",
            args: {
              address: simpleContractAddress,
              method: "increment",
              args: "[10]",
              params: {
                mutez: true
              }
            }
          }),
          client.invoke<{ getContractCallTransferParams: TransferParams }>({
            uri,
            method: "getContractCallTransferParams",
            args: {
              address: simpleContractAddress,
              method: "increment",
              args: "[10]",
              params: {
                mutez: true
              }
            }
          })
        ])

        transferParamsResponse.forEach((response) => {
          expect(response.error).toBeUndefined()
          expect(response.data?.getContractCallTransferParams).toBeDefined()
          expect(response.data?.getContractCallTransferParams.to).toBe(simpleContractAddress)
          expect(response.data?.getContractCallTransferParams.mutez).toBe(true)
          expect(response.data?.getContractCallTransferParams.parameter).toBeDefined()
        })

        const transferParams = transferParamsResponse.map((response) => response.data?.getContractCallTransferParams);

        // @note
        // batchWalletContractCalls and batchContractCalls uses 
        // the same internals only difference is the usage of the 
        // wallet interface for external wallets to sign a transaction
        // Thus, `batchContractCalls` below can be replaced with `batchWalletContractCalls`
        const response = await client.invoke<{ batchContractCalls: string }>({
          uri,
          method: "batchContractCalls",
          args: {
            params: transferParams
          }
        })

        expect(response.error).toBeUndefined()
        expect(response.data?.batchContractCalls).toBeDefined()
        expect(typeof response.data?.batchContractCalls).toBe('string')
      })
    })
  })
});
