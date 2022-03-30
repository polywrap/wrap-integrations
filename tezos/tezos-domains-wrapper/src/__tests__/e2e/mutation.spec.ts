import { randomInt} from 'crypto'
import { Web3ApiClient, Subscription } from "@web3api/client-js"
import { InMemorySigner } from "@blockwatch-cc/tezos-plugin-js"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import { Config } from "../config"
import * as QuerySchema from "../../query/w3"
import * as MutationSchema from "../../mutation/w3"
import { getEnsUri, getPlugins, getRandomString } from "../testUtils"

jest.setTimeout(600000)

describe("Mutation", () => {
  let client: Web3ApiClient;
  let ensUri: string;

  beforeAll(async () => {
    const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
    ensUri = await getEnsUri(ipfs, ensAddress);
    const signer = await InMemorySigner.fromSecretKey(Config.TZ_SECRET_KEY);
    client = new Web3ApiClient({
      plugins: getPlugins(ipfs, ensAddress, ethereum, signer),
    })
  })

  afterAll(async () => {
    await stopTestEnvironment()
  })

  describe("Commit", () => {
    it("should be to make a commitment to a domain", async () => {
      const response =  await client.query<{ commit: MutationSchema.Tezos_TxOperation }>({
        uri: ensUri,
        query: `
          mutation {
            commit(
              network: hangzhounet,
              params: $params
            )
          }
        `,
        variables: {
          params: {
            label: `commit-${getRandomString()}`,
            owner: "tz1VxMudmADssPp6FPDGRsvJXE41DD6i9g6n",
            nonce: 491919002
          },
        }
      });

      expect(response.errors).toBeUndefined()
      expect(response.data?.commit).toBeDefined()
      expect(typeof response.data?.commit).toBe('string')
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

      const commitResponse =  await client.query<{ commit: MutationSchema.Tezos_TxOperation }>({
        uri: ensUri,
        query: `
          mutation {
            commit(
              network: hangzhounet,
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

      // Wait till the commitment operation has more than 15 confirmations
      const getSubscription: Subscription<{
        getOperationStatus: QuerySchema.Tezos_OperationStatus;
      }> = client.subscribe<{
        getOperationStatus: QuerySchema.Tezos_OperationStatus;
      }>({
        uri: "w3://ens/tezos.web3api.eth",
        query: `
          query {
            getOperationStatus(
              hash: $hash
              network: hangzhounet
            )
          }
        `,
        variables: {
          hash: commitResponse.data?.commit,
        },
        frequency: { ms: 4500 },
      });

      for await (let query of getSubscription) {
        if (query.errors) {
          continue
        }
        expect(query.errors).toBeUndefined();
        const operationStatus = query.data?.getOperationStatus;
        if (operationStatus !== undefined) {
          if (operationStatus.confirmations > 15) {
            break
          }
        }
      }
      
      const buyResponse = await client.query<{ buy: MutationSchema.Tezos_TxOperation }>({
        uri: ensUri,
        query: `
          mutation {
            buy(
              network: hangzhounet,
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
})