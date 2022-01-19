import { Web3ApiClient } from "@web3api/client-js"
import { InMemorySigner } from "@web3api/tezos-plugin-js"
import { initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"
import { up, down, Node, Account } from "@web3api/tezos-test-env"

import * as Types from "../w3Types"
import { getEnsUri, getPlugins } from "../testUtils"
import { deployContract, SIMPLE_CONTRACT, SIMPLE_CONTRACT_STORAGE } from "../helpers.ts/deploy"

jest.setTimeout(300000)

describe("callContractMethod", () => {
    let client: Web3ApiClient;
    let ensUri: string;
    let node: Node;
    let accounts: Account[];

    beforeAll(async () => {
        const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
        const { accounts: tezosAccounts, node: tezosNode } = await up()
        node = tezosNode
        accounts = tezosAccounts
        const signer = await InMemorySigner.fromSecretKey(accounts[0].secretKey);
        ensUri = await getEnsUri(ipfs, ensAddress)
        client = new Web3ApiClient({
            plugins: getPlugins({
              ipfs, 
              ensAddress, 
              ethereum, 
              tezos: {
                name: "testnet",
                provider: node.url,
                signer
              }
            }),
        });
    })

    afterAll(async () => {
        await stopTestEnvironment()
        await down()
    })

    it("should be able to call contract's method", async () => {
      const contractAddress = await deployContract(node.url, accounts[0].secretKey, {
        code: SIMPLE_CONTRACT, 
        storage: SIMPLE_CONTRACT_STORAGE
      })
      const response = await client.query<{ callContractMethod: Types.TxOperation }>({
        uri: ensUri,
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
  let client: Web3ApiClient;
  let ensUri: string;
  let node: Node;
  let accounts: Account[];

  beforeAll(async () => {
      const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
      const { accounts: tezosAccounts, node: tezosNode } = await up()
      node = tezosNode
      accounts = tezosAccounts
      const signer = await InMemorySigner.fromSecretKey(accounts[0].secretKey);  
      ensUri = await getEnsUri(ipfs, ensAddress)
      client = new Web3ApiClient({
          plugins: getPlugins({
            ipfs, 
            ensAddress, 
            ethereum,
            tezos: {
              name: "testnet",
              provider: node.url,
              signer
            }
          }),
      });
  })

  afterAll(async () => {
      await stopTestEnvironment()
      await down()
  })

  it("should be able to call contract's method and confirm", async () => {
    const contractAddress = await deployContract(node.url, accounts[0].secretKey, {
      code: SIMPLE_CONTRACT, 
      storage: SIMPLE_CONTRACT_STORAGE
    })
    const response = await client.query<{ callContractMethodAndConfirmation: number }>({
      uri: ensUri,
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
        }`,
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