import add from "date-fns/add"
import path from "path"
import { PolywrapClient } from "@polywrap/client-js"
import { InMemorySigner } from "@taquito/signer"
import { buildWrapper } from "@polywrap/test-env-js"

import { GetTokenSupplyResponse, Tezos_TransferParams } from "../../wrap"
import { Config } from "../config"

const { tezosPlugin } = require("../../../../plugin-js")

jest.setTimeout(460000)

describe("e2e", () => {
  let client: PolywrapClient;
  let apiUri: string;

  beforeAll(async () => {
    const apiPath = path.join(__dirname, "/../../..");
    apiUri = `fs/${apiPath}`;
    
    await buildWrapper(apiPath);
    const signer = await InMemorySigner.fromSecretKey(Config.TZ_SECRET)
    client = new PolywrapClient({
        plugins: [
          {
            uri: "wrap://ens/tezos.polywrap.eth",
            plugin: tezosPlugin({
                networks: {
                    mainnet: {
                        provider: "https://rpc.tzstats.com"
                    },
                    hangzhounet: {
                        provider: "https://rpc.tzkt.io/hangzhou2net",
                        signer
                    },
                    ithacanet: {
                        provider: "https://rpc.ithaca.tzstats.com"
                    }
                },
                defaultNetwork: "hangzhounet"
              })
          }
      ],
    })
  })

  describe("getTokenPair", () => {
    it("should get a token pair", async () => {
      const response =  await client.query<{ getTokenPair: object }>({
        uri: apiUri,
        query: `
          query {
            getTokenPair(
              network: hangzhounet,
              pairId: "4"
            )
          }
        `,
      });

      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.getTokenPair).toBeDefined()
    })

    it("throws an error when paidId is invalid", async () => {
      const response =  await client.query<{ getTokenPair: object }>({
        uri: apiUri,
        query: `
          query {
            getTokenPair(
              network: hangzhounet,
              pairId: "1000"
            )
          }
        `,
      });

      expect(response.data?.getTokenPair).toBeUndefined()
      expect(response.errors).toBeDefined()
      expect(response.errors?.[0].message).toMatch(/invalid pair id/)   
    })
  })

  describe("listTokenPairs", () => {
    it("should get a list of token pairs from storage", async () => {
      const response =  await client.query<{ listTokenPairs: object }>({
        uri: apiUri,
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
      const response =  await client.query<{ getTokenSupply: GetTokenSupplyResponse}>({
        uri: apiUri,
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
        uri: apiUri,
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

  describe("addOperator", () => {
    it("should add operator", async () => {
      const response = await client.query<{ addOperator: Tezos_TransferParams }>({
        uri: apiUri,
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
      const response = await client.query<{ removeOperator: Tezos_TransferParams }>({
        uri: apiUri,
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
    it("should be to swap token directly on hangzhounet", async () => {
      const swapResponse = await client.query<{ swapDirect: Tezos_TransferParams[] }>({
        uri: apiUri,
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
            pairId: 3,
            direction: `b_to_a`,
            swapParams: {
              amountIn: "1",
              minAmountOut: "1",
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
      expect(swapResponse.data?.swapDirect).toHaveLength(3)
    });

    it("should swap tokens directly", async() => {
      const swapResponse = await client.query<{ swapDirect: Tezos_TransferParams[] }>({
        uri: apiUri,
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
      expect(swapResponse.data?.swapDirect).toHaveLength(3)
      
      const batchContractCallResponse = await client.query<{ batchContractCalls: string }>({
        uri: "wrap://ens/tezos.polywrap.eth",
        query: `
          mutation {
            batchContractCalls(
              params: $params
            )
          }
        `,
        variables: {
          params: swapResponse.data?.swapDirect
        }
      })

      expect(batchContractCallResponse.errors).toBeUndefined()
      expect(batchContractCallResponse.data?.batchContractCalls).toBeDefined()
    });
  })

  describe("transfer", () => {
    it.skip("should transfer token from caller/sender", async () => {
        // transfer
        const transferResponse = await client.query<{ transfer: Tezos_TransferParams }>({
        uri: apiUri,
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
        uri: "wrap://ens/tezos.polywrap.eth",
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
        const transferFromResponse = await client.query<{ transferFrom: Tezos_TransferParams }>({
        uri: apiUri,
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
          from: "tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z",
          params: {
            to: "tz1dUru8MXTpHoXLmcHQrs2iPWmDP1Y9rDEY",
            tokenId: 0,
            amount: "0",
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
    });
  })

  describe("invest", () => {
    it("should invest into a token pair", async () => {
      // invest
      const investResponse = await client.query<{ invest: Tezos_TransferParams[] }>({
        uri: apiUri,
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
      expect(investResponse.data?.invest).toHaveLength(5)
      // batch contract calls
      const batchContractCallResponse = await client.query<{ batchContractCalls: string }>({
        uri: "wrap://ens/tezos.polywrap.eth",
        query: `
          mutation {
            batchContractCalls(
              params: $params
            )
          }
        `,
        variables: {
          params: investResponse.data?.invest
        }
      })
      expect(batchContractCallResponse.errors).toBeUndefined()
      expect(batchContractCallResponse.data?.batchContractCalls).toBeDefined()
    });
  })

  describe("divest", () => {
    it("should divest into a token pair", async () => {
      // divest
      const divestResponse = await client.query<{ divest: Tezos_TransferParams }>({
        uri: apiUri,
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
      });
      expect(divestResponse.errors).toBeUndefined()
      expect(divestResponse.data?.divest).toBeDefined()
      expect(divestResponse.data?.divest.mutez).toBe(true)
      expect(divestResponse.data?.divest.parameter).toBeDefined()
      // batch contract calls
      const batchContractCallResponse = await client.query<{ batchContractCalls: string }>({
        uri: "wrap://ens/tezos.polywrap.eth",
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