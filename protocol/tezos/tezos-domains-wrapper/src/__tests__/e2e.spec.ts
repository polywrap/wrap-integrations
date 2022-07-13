import path from 'path'
import { randomInt} from 'crypto'
import { PolywrapClient } from "@polywrap/client-js"
import { InMemorySigner } from "@taquito/signer"
import { buildWrapper } from "@polywrap/test-env-js"

import { Config } from "./config"
import { getRandomString, waitForConfirmation } from "./testUtils"
import { DomainInfo, Tezos_TxOperation } from '../wrap'

const { tezosPlugin } = require("../../../tezos-domains-plugin-js")

jest.setTimeout(600000)

describe("Tezos Domains Wrapper", () => {
  const PKH = Config.TZ_PKH;
  let client: PolywrapClient;
  let apiUri: string;

  beforeAll(async () => {
    const apiPath = path.join(__dirname, "/../..");
    apiUri = `fs/${apiPath}`;

    await buildWrapper(apiPath);

    const signer = await InMemorySigner.fromSecretKey(Config.TZ_SECRET_KEY);
    client = new PolywrapClient({
      plugins: [
        {
          uri: "wrap://ens/tezos.polywrap.eth",
          plugin: tezosPlugin({
              networks: {
                  mainnet: {
                      provider: "https://rpc.tzstats.com"
                  },  
                  ithacanet: {
                      provider: "https://rpc.ithaca.tzstats.com",
                      signer,
                  }
              },
              defaultNetwork: "ithacanet"
            })
        },
      ]
    })
  })

  describe("Commit", () => {
    it("should be to make a commitment to a domain", async () => {
      const response =  await client.query<{ commit: string }>({
        uri: apiUri,
        query: `
          mutation {
            commit(
              network: ithacanet,
              params: $params
            )
          }
        `,
        variables: {
          params: {
            label: `commit-${getRandomString()}`,
            owner: PKH,
            nonce: 491919002
          },
        }
      });
      expect(response.errors).toBeUndefined()
      expect(response.data?.commit).toBeDefined()
      expect(typeof response.data?.commit).toBe('string')

      await waitForConfirmation(client, response.data?.commit!)
    })
  })
  
  describe("Buy", () => {
    it("should be to purchase a domain", async () => {
      // @dev 
      // To be able to purchase a domain you need to make a commitment first
      const MAX_32_BIT_INTEGER = 2147483648;
      const buyParams = {
        label: `zakager-${getRandomString()}`,
        nonce: randomInt(MAX_32_BIT_INTEGER),
        owner: 'tz1ZuBvvtrS9JroGs5e4B3qg2PLntxhj1h8Z',
        duration: 365,
        metadata: {
          isMichelsonMap: true,
          values: []
        }
      }

      const commitResponse =  await client.query<{ commit: string }>({
        uri: apiUri,
        query: `
          mutation {
            commit(
              network: ithacanet,
              params: $params
            )
          }
        `,
        variables: {
          params: {
            label: buyParams.label,
            owner: buyParams.owner,
            nonce: buyParams.nonce
          },
        }
      });
      expect(commitResponse.errors).toBeUndefined()
      expect(commitResponse.data?.commit).toBeDefined()
      expect(typeof commitResponse.data?.commit).toBe('string')

      // Wait till the commitment operation has more  confirmations
      await waitForConfirmation(client, commitResponse.data?.commit!)
      
      const buyResponse = await client.query<{ buy: Tezos_TxOperation }>({
        uri: apiUri,
        query: `
          mutation {
            buy(
              network: ithacanet,
              params: $params,
              sendParams: $sendParams
            )
          }
        `,
        variables: {
          params: {
            label: buyParams.label,
            owner: buyParams.owner,
            address: buyParams.owner,
            nonce: buyParams.nonce,
            duration: buyParams.duration,
            data: JSON.stringify(buyParams.metadata)
          },
          sendParams: {
            amount: 1
          }
        }
      });
      expect(buyResponse.errors).toBeUndefined()
      expect(buyResponse.data).toBeDefined()
      expect(buyResponse.data?.buy).toBeDefined()
      expect(typeof buyResponse.data?.buy).toBe('string')
    })
  })

  describe("resolveDomain", () => {
    it("should resolve a valid domain name", async () => {
      const response =  await client.query<{ resolveDomain: DomainInfo | null }>({
        uri: apiUri,
        query: `
          query {
            resolveDomain(
              network: mainnet,
              domain: $domain
            )
          }
        `,
        variables: {
          domain: "alice.tez"
        }
      })
  
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.resolveDomain).toBeDefined()
      expect(response.data?.resolveDomain?.Name).toBeDefined()
      expect(response.data?.resolveDomain?.Address).toBeDefined()
      expect(response.data?.resolveDomain?.Data).toBeDefined()
      expect(response.data?.resolveDomain?.Expiry).toBeDefined()
    })
  
    it("should return null for an invalid domain name", async () => {
      const response =  await client.query<{ resolveDomain: DomainInfo | null }>({
        uri: apiUri,
        query: `
          query {
            resolveDomain(
              network: mainnet,
              domain: $domain
            )
          }
        `,
        variables: {
          domain: `chalak-${Math.random() * 1000}.tez`
        }
      })
  
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.resolveDomain).toBeNull()
    })
  })

  describe("resolveAddress", () => {
    it("should resolve address to domain record", async () => {
      const response =  await client.query<{ resolveAddress: DomainInfo | null }>({
        uri: apiUri,
        query: `
          query {
            resolveAddress(
              network: mainnet,
              address: $address
            )
          }
        `,
        variables: {
          address: 'tz1PnpYYdcgoVq1RYgj6qSdbzwSJRXXcfU3F'
        }
      })

      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.resolveAddress).toBeDefined()
      expect(response.data?.resolveAddress?.Name).toBeDefined()
      expect(response.data?.resolveAddress?.Address).toBeDefined()
      expect(response.data?.resolveAddress?.Data).toBeDefined()
      expect(response.data?.resolveAddress?.Expiry).toBeDefined()
    })
  })
})