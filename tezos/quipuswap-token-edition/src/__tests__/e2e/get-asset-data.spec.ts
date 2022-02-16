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

    it("should get asset data for `XTZ-USD` on mainnet", async () => {
        const response =  await client.query<{ getAssetData: QuerySchema.GetAssetResponse}>({
          uri: ensUri,
          query: `
            query {
              getAssetData(
                assetCode: $assetCode,
                network: mainnet
              )
            }
          `,
          variables: {
            assetCode: "XTZ-USD",
            network: "granadanet",
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

    it("should get asset data for `XTZ-USD` on granadanet", async () => {
      const response =  await client.query<{ getAssetData: QuerySchema.GetAssetResponse}>({
        uri: ensUri,
        query: `
        query {
          getAssetData(
            assetCode: $assetCode,
            network: granadanet,
            custom: $custom
            )
          }
          `,
          variables: {
            assetCode: "XTZ-USD",
            custom: {
              oracleContractAddress: "KT1ENR6CK7cBWCtZt1G3PovwTw3FgSW472mS",
            },
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

    it("should get asset data for `XTZ-USD` on custom network", async () => {
      const response =  await client.query<{ getAssetData: QuerySchema.GetAssetResponse}>({
        uri: ensUri,
        query: `
        query {
            getAssetData(
              assetCode: $assetCode,
              network: custom,
              custom: $custom
            )
          }
          `,
          variables: {
            custom: {
              oracleContractAddress: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9",
              connection: {
                provider: "https://rpc.tzstats.com",
                networkNameOrChainId: "mainnet"
              },
            },
            assetCode: "XTZ-USD",
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

    it("should fail if get connection and oracle address is not provided when using custom network", async () => {
      const response =  await client.query<{ getAssetData: QuerySchema.GetAssetResponse}>({
        uri: ensUri,
        query: `
        query {
            getAssetData(
              assetCode: $assetCode,
              network: custom
            )
          }
          `,
          variables: {
            assetCode: "XTZ-USD",
          }
        })

      expect(response.errors).toBeDefined()
      expect(response.data?.getAssetData).toBeUndefined()
    })
})

describe("listProviders", () => {
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
    
  it("should get a list of Assets fron a Provider", async () => {
    const response =  await client.query<{ listProviders: QuerySchema.listProvidersResponse}>({
      uri: ensUri,
      query: `
        query {
          listProviders
        }
      `,
      variables: {
      }
    })

    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.listProviders.providers).toBeDefined()
  })
  
})

describe("listAssets", () => {
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
    
  it("should get a list of Assets from a Provider", async () => {
    const response =  await client.query<{ listAssets: QuerySchema.listAssetsResponse}>({
      uri: ensUri,
        query: `
          query {
            listAssets(
              providerAddress: $providerAddress,
              network: mainnet
            )
          }
          `,
          variables: {
            providerAddress: "KT1AdbYiPYb5hDuEuVrfxmFehtnBCXv4Np7r",
            network: "granadanet",
          }
        })

    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.listAssets.assets).toBeDefined()
  })
  
})

describe("getCandle", () => {
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
    
  it("should get Candle data from a Provider", async () => {
    const response =  await client.query<{ getCandle: QuerySchema.GetCandleResponse}>({
      uri: ensUri,
        query: `
          query {
            getCandle(
              providerAddress: $providerAddress,
              network: mainnet
              assetCode: $assetCode
            )
          }
          `,
          variables: {
            providerAddress: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9",
            assetCode: "XTZ-USD",
            network: "granadanet",
          }
        })

    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.getCandle).toBeDefined()
    expect(response.data?.getCandle.low).toBeDefined()
    expect(response.data?.getCandle.open).toBeDefined()
    expect(response.data?.getCandle.high).toBeDefined()
    expect(response.data?.getCandle.asset).toBeDefined()
    expect(response.data?.getCandle.close).toBeDefined()
    expect(response.data?.getCandle.volume).toBeDefined()
    expect(response.data?.getCandle.endPeriod).toBeDefined()
    expect(response.data?.getCandle.startPeriod).toBeDefined()
  })
  
})

describe("getNormalizedPrice", () => {
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
    
  it("should get Normalized Price of a crypto pair from a Provider", async () => {
    const response =  await client.query<{ getNormalizedPrice: QuerySchema.GetNormalizedPriceResponse}>({
      uri: ensUri,
        query: `
          query {
            getNormalizedPrice(
              providerAddress: $providerAddress,
              network: mainnet
              assetCode: $assetCode
            )
          }
          `,
          variables: {
            providerAddress: "KT1AdbYiPYb5hDuEuVrfxmFehtnBCXv4Np7r",
            assetCode: "XTZ-USD",
            network: "granadanet",
          }
        })

    expect(response.errors).toBeUndefined()
    expect(response.data).toBeDefined()
    expect(response.data?.getNormalizedPrice).toBeDefined()
  })
  
})