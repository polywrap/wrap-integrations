import path from "path"
import { Web3ApiClient } from "@web3api/client-js"
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import add from "date-fns/add"


import * as QuerySchema from "../../query/w3"
import { getPlugins } from "../testUtils"

jest.setTimeout(300000)

describe("e2e", () => {
  let client: Web3ApiClient;
  let ensUri: string;

  beforeAll(async () => {
    const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
    const apiPath = path.join(__dirname, "/../../..");
    const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
    ensUri = `ens/testnet/${api.ensDomain}`;
    const tezosConnection = {
      network: "hangzhounet",
      provider: "https://rpc.hangzhou.tzstats.com",
      signer: await InMemorySigner.fromSecretKey("")
    }
    client = new Web3ApiClient({
        plugins: getPlugins(ipfs, ensAddress, ethereum, tezosConnection),
    })
  })

  afterAll(async () => {
    await stopTestEnvironment()
  })

  describe("Query", () => {
    describe("listTokenPairs", () => {
      it("should get a list of token pairs from storage", async () => {
        const response =  await client.query<{ listTokenPairs: object }>({
          uri: ensUri,
          query: `
            query {
              listTokenPairs(
                network: mainnet
              )
            }
          `,
        });

        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.listTokenPairs).toBeDefined()
      })
    })
      
    describe("getTokenSupply", () => {
      it("should get a list of assets from a provider", async () => {
        const response =  await client.query<{ getTokenSupply: QuerySchema.GetTokenSupplyResponse}>({
          uri: ensUri,
            query: `
              query {
                getTokenSupply(
                  pairId: $pairId,
                  network: mainnet
                )
              }`,
          variables: {
            pairId: "0"
          }
        })
    
        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getTokenSupply).toBeDefined()
        expect(response.data?.getTokenSupply.token_a_pool).toBeDefined()
        expect(response.data?.getTokenSupply.token_b_pool).toBeDefined()
        expect(response.data?.getTokenSupply.total_supply).toBeDefined()
      })
    })

    describe("getLPTokenBalance", () => {
      it("should get candle data from a provider", async () => {
        const response = await client.query<{ getLPTokenBalance: string }>({
          uri: ensUri,
          query: `
            query {
              getLPTokenBalance(
                network: mainnet
                owner: $owner 
                pairId: $pairId
              )
          }`,
          variables: {
            owner: "tz1LSMu9PugfVyfX2ynNU9y4eVvSACJKP7sg",
            pairId: "0"
          }
        })
      
        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getLPTokenBalance).toBeDefined()
      })
    })
  })

  describe("Mutation", () => {
    describe("addOperator", () => {
      it("should add operator", async () => {
        const response = await client.query<{ addOperator: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              addOperator(
                network: hangzhounet,
                contractAddress: $contractAddress
                params: $params
              )
            }
          `,
          variables: {
            contractAddress: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC",
            params: {
              owner: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
              tokenId: 0,
              operator: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC"
            }
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.addOperator).toBeDefined()
        expect(response.data?.addOperator.to).toBeDefined()
        expect(response.data?.addOperator.amount).toBeDefined()
      });
    })
    
    describe("removeOperator", () => {
      it("should remove operator", async () => {
        const response = await client.query<{ removeOperator: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              removeOperator(
                network: hangzhounet,
                contractAddress: $contractAddress
                params: $params
              )
            }
          `,
          variables: {
            contractAddress: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC",
            params: {
              owner: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
              tokenId: 0,
              operator: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC"
            }
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.removeOperator).toBeDefined()
        expect(response.data?.removeOperator.to).toBeDefined()
        expect(response.data?.removeOperator.amount).toBeDefined()
      });
    })

    describe("swapMultiHop", () => {
      it.todo("should swap multiple tokens");
    })

    describe("swapDirect", () => {
      it("should swap tokens directly", async() => {
        const QUIPU_CONTRACT_ADDRESS = "KT1VowcKqZFGhdcDZA3UN1vrjBLmxV5bxgfJ";
        const addQuipuResponse = await client.query<{ addOperator: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              addOperator(
                network: hangzhounet,
                contractAddress: $contractAddress,
                params: $params
              )
            }
          `,
          variables: {
            contractAddress: QUIPU_CONTRACT_ADDRESS,
            params: {
              owner: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
              tokenId: 0,
              operator: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC"
            }
          }
        })
        expect(addQuipuResponse.errors).toBeUndefined()
        expect(addQuipuResponse.data?.addOperator).toBeDefined()
        expect(addQuipuResponse.data?.addOperator.to).toBe(QUIPU_CONTRACT_ADDRESS)
        expect(addQuipuResponse.data?.addOperator.mutez).toBe(false)
        expect(addQuipuResponse.data?.addOperator.parameter).toBeDefined()
        
        const swapResponse = await client.query<{ swapDirect: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              swapDirect(
                network: hangzhounet,
                params: $params,
                sendParams: $sendParams
              )
            }
          `,
          variables: {
            params: {
              pairId: 14,
              direction: `b_to_a`,
              swapParams: {
                amountIn: "1",
                minAmountOut: "26288",
                deadline: add(new Date(), { minutes: 10 }).toISOString(),
                receiver:  "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z"
              }
            },
            sendParams: {
              to: "",
              amount: 0,
              mutez: true
            }
          }
        })
        expect(swapResponse.errors).toBeUndefined()
        expect(swapResponse.data?.swapDirect).toBeDefined()
        expect(swapResponse.data?.swapDirect.mutez).toBe(true)
        expect(swapResponse.data?.swapDirect.parameter).toBeDefined()

        const removeQuipuResponse = await client.query<{ removeOperator: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              removeOperator(
                network: hangzhounet,
                contractAddress: $contractAddress,
                params: $params
              )
            }
          `,
          variables: {
            contractAddress: QUIPU_CONTRACT_ADDRESS,
            params: {
              owner: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
              tokenId: 0,
              operator: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC"
            }
          }
        })
        expect(removeQuipuResponse.errors).toBeUndefined()
        expect(removeQuipuResponse.data?.removeOperator).toBeDefined()
        expect(removeQuipuResponse.data?.removeOperator.to).toBe(QUIPU_CONTRACT_ADDRESS)
        expect(removeQuipuResponse.data?.removeOperator.mutez).toBe(false)
        expect(removeQuipuResponse.data?.removeOperator.parameter).toBeDefined()
        
        const batchContractCallResponse = await client.query<{ batchContractCalls: string }>({
          uri: "w3://ens/tezos.web3api.eth",
          query: `
            mutation {
              batchContractCalls(
                params: $params
              )
            }
          `,
          variables: {
            params: [addQuipuResponse.data?.addOperator, swapResponse.data?.swapDirect, removeQuipuResponse.data?.removeOperator]
          }
        })

        expect(batchContractCallResponse.errors).toBeUndefined()
        expect(batchContractCallResponse.data?.batchContractCalls).toBeDefined()
      });
    })

    describe("transfer", () => {
      it.skip("should transfer token from caller/sender", async () => {
         // transfer
         const transferResponse = await client.query<{ transfer: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              transfer(
                network: hangzhounet,
                params: $params,
                sendParams: $sendParams
              )
            }
          `,
          variables: {
            params: {
              to: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
              tokenId: 0,
              amount: "1",
            },
            sendParams: {
              to: "",
              amount: 0,
              mutez: true
            }
          }
        })
        expect(transferResponse.errors).toBeUndefined()
        expect(transferResponse.data?.transfer).toBeDefined()
        expect(transferResponse.data?.transfer.mutez).toBe(true)
        expect(transferResponse.data?.transfer.parameter).toBeDefined()
        // batch contract calls
        const batchContractCallResponse = await client.query<{ batchContractCalls: string }>({
          uri: "w3://ens/tezos.web3api.eth",
          query: `
            mutation {
              batchContractCalls(
                params: $params
              )
            }
          `,
          variables: {
            params: [transferResponse.data?.transfer]
          }
        })
        expect(batchContractCallResponse.errors).toBeUndefined()
        expect(batchContractCallResponse.data?.batchContractCalls).toBeDefined()
      });
    })

    describe("transferFrom", () => {
      it.skip("should transfer token from address provided", async () => {
         // transferFrom
         const transferFromResponse = await client.query<{ transferFrom: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              transferFrom(
                network: hangzhounet,
                from: $from,
                params: $params,
                sendParams: $sendParams
              )
            }
          `,
          variables: {
            from: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC",
            params: {
              to: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
              tokenId: 0,
              amount: "1",
            },
            sendParams: {
              to: "",
              amount: 0,
              mutez: true
            }
          }
        })
        expect(transferFromResponse.errors).toBeUndefined()
        expect(transferFromResponse.data?.transferFrom).toBeDefined()
        expect(transferFromResponse.data?.transferFrom.mutez).toBe(true)
        expect(transferFromResponse.data?.transferFrom.parameter).toBeDefined()
        // batch contract calls
        const batchContractCallResponse = await client.query<{ batchContractCalls: string }>({
          uri: "w3://ens/tezos.web3api.eth",
          query: `
            mutation {
              batchContractCalls(
                params: $params
              )
            }
          `,
          variables: {
            params: [transferFromResponse.data?.transferFrom]
          }
        })
        expect(batchContractCallResponse.errors).toBeUndefined()
        expect(batchContractCallResponse.data?.batchContractCalls).toBeDefined()
      });
    })

    describe("invest", () => {
      it("should invest into a token pair", async () => {
        const QUIPU_CONTRACT_ADDRESS = "KT1VowcKqZFGhdcDZA3UN1vrjBLmxV5bxgfJ";
        const RCT_CONTRACT_ADDRESS = "KT1QGgr6k1CDf4Svd18MtKNQukboz8JzRPd5";
        // Add operator for Quipu
        const addQuipuResponse = await client.query<{ addOperator: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              addOperator(
                network: hangzhounet,
                contractAddress: $contractAddress,
                params: $params
              )
            }
          `,
          variables: {
            contractAddress: QUIPU_CONTRACT_ADDRESS,
            params: {
              owner: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
              tokenId: 0,
              operator: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC"
            }
          }
        })
        expect(addQuipuResponse.errors).toBeUndefined()
        expect(addQuipuResponse.data?.addOperator).toBeDefined()
        expect(addQuipuResponse.data?.addOperator.to).toBe(QUIPU_CONTRACT_ADDRESS)
        expect(addQuipuResponse.data?.addOperator.mutez).toBe(false)
        expect(addQuipuResponse.data?.addOperator.parameter).toBeDefined()
        // Add operator for RCT
        const addRctResponse = await client.query<{ addOperator: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              addOperator(
                network: hangzhounet,
                contractAddress: $contractAddress,
                params: $params
              )
            }
          `,
          variables: {
            contractAddress: RCT_CONTRACT_ADDRESS,
            params: {
              owner: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
              tokenId: 0,
              operator: "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC"
            }
          }
        })
        expect(addRctResponse.errors).toBeUndefined()
        expect(addRctResponse.data?.addOperator).toBeDefined()
        expect(addRctResponse.data?.addOperator.to).toBe(RCT_CONTRACT_ADDRESS)
        expect(addRctResponse.data?.addOperator.mutez).toBe(false)
        expect(addRctResponse.data?.addOperator.parameter).toBeDefined()
        // invest
        const investResponse = await client.query<{ invest: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              invest(
                network: hangzhounet,
                params: $params,
                sendParams: $sendParams
              )
            }
          `,
          variables: {
            params: {
              pairId: 14,
              shares: "1",
              tokenAIn: "26543",
              tokenBIn: "1",
              deadline: add(new Date(), { minutes: 10 }).toISOString(),
            },
            sendParams: {
              to: "",
              amount: 0,
              mutez: true
            }
          }
        })
        expect(investResponse.errors).toBeUndefined()
        expect(investResponse.data?.invest).toBeDefined()
        expect(investResponse.data?.invest.mutez).toBe(true)
        expect(investResponse.data?.invest.parameter).toBeDefined()
        // batch contract calls
        const batchContractCallResponse = await client.query<{ batchContractCalls: string }>({
          uri: "w3://ens/tezos.web3api.eth",
          query: `
            mutation {
              batchContractCalls(
                params: $params
              )
            }
          `,
          variables: {
            params: [addQuipuResponse.data?.addOperator, addRctResponse.data?.addOperator, investResponse.data?.invest]
          }
        })
        expect(batchContractCallResponse.errors).toBeUndefined()
        expect(batchContractCallResponse.data?.batchContractCalls).toBeDefined()
      });
    })

    describe("divest", () => {
      it("should divest into a token pair", async () => {
        // divest
        const divestResponse = await client.query<{ divest: QuerySchema.Tezos_TransferParams }>({
          uri: ensUri,
          query: `
            mutation {
              divest(
                network: hangzhounet,
                params: $params,
                sendParams: $sendParams
              )
            }
          `,
          variables: {
            params: {
              pairId: 14,
              shares: "10",
              minTokenAOut: "144587",
              minTokenBOut: "4",
              deadline: add(new Date(), { minutes: 10 }).toISOString(),
            },
            sendParams: {
              to: "",
              amount: 0,
              mutez: true
            }
          }
        })
        expect(divestResponse.errors).toBeUndefined()
        expect(divestResponse.data?.divest).toBeDefined()
        expect(divestResponse.data?.divest.mutez).toBe(true)
        expect(divestResponse.data?.divest.parameter).toBeDefined()
        // batch contract calls
        const batchContractCallResponse = await client.query<{ batchContractCalls: string }>({
          uri: "w3://ens/tezos.web3api.eth",
          query: `
            mutation {
              batchContractCalls(
                params: $params
              )
            }
          `,
          variables: {
            params: [divestResponse.data?.divest]
          }
        })
        expect(batchContractCallResponse.errors).toBeUndefined()
        expect(batchContractCallResponse.data?.batchContractCalls).toBeDefined()
      });
    })
  })
})