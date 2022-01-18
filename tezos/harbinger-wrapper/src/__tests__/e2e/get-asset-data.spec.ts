import path from "path"
import { Web3ApiClient } from "@web3api/client-js"
import { buildAndDeployApi, initTestEnvironment, stopTestEnvironment } from "@web3api/test-env-js"

import * as QuerySchema from "../../query/w3"
import { getPlugins } from "../testUtils"

jest.setTimeout(150000)

describe("getAssetData", () => {
    let client: Web3ApiClient;
    let ensUri: string;

    beforeAll(async () => {
        const { ensAddress, ethereum, ipfs } = await initTestEnvironment();
        const apiPath = path.join(__dirname, "/../../../");
        const api = await buildAndDeployApi(apiPath, ipfs, ensAddress);
        ensUri = `ens/testnet/${api.ensDomain}`;
        client = new Web3ApiClient({
            plugins: getPlugins(ipfs, ensAddress, ethereum),
        })
    })

    afterAll(async () => {
        await stopTestEnvironment()
    })

    it("should get asset data for `XTZ-USD`", async () => {
        const response =  await client.query<{ getAssetData: QuerySchema.GetAssetResponse}>({
          uri: ensUri,
          query: `
            query {
              getAssetData(
                oracleContractAddress: $oracleContractAddress,
                assetCode: $assetCode
                connection: $connection
              )
            }
          `,
          variables: {
            oracleContractAddress: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9",
            assetCode: "XTZ-USD",
            connection: {
              networkNameOrChainId: "mainnet"
            }
          }
        })
        
        expect(response.errors).toBeUndefined()
        expect(response.data).toBeDefined()
        expect(response.data?.getAssetData).toBeDefined()
        expect(response.data?.getAssetData.low).toBeDefined()
        expect(response.data?.getAssetData.open).toBeDefined()
        expect(response.data?.getAssetData.high).toBeDefined()
        expect(response.data?.getAssetData.asset).toBeDefined()
        expect(response.data?.getAssetData.close).toBeDefined()
        expect(response.data?.getAssetData.volume).toBeDefined()
        expect(response.data?.getAssetData.endPeriod).toBeDefined()
        expect(response.data?.getAssetData.startPeriod).toBeDefined()
    })
})