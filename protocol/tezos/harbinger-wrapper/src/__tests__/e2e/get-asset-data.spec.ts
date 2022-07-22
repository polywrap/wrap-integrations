import path from "path"
import { PolywrapClient } from "@polywrap/client-js"
import { buildWrapper } from "@polywrap/test-env-js"
import { AssetCandle, Providers } from "../../wrap"

const { tezosPlugin } = require("../../../../plugin-js")

jest.setTimeout(150000)

describe("Query", () => {
  let client: PolywrapClient;
  let wrapperUri: string;
  
  beforeAll(async () => {
      const wrapperPath = path.join(__dirname, "/../../../");
      wrapperUri = `fs/${wrapperPath}/build`;
      await buildWrapper(wrapperPath);

      client = new PolywrapClient({
          plugins: [
            {
              uri: "wrap://ens/tezos.polywrap.eth",
              plugin: tezosPlugin({
                  networks: {
                      mainnet: {
                          provider: "https://rpc.tzstats.com"
                      },  
                      ghostnet: {
                          provider: "https://rpc.ghost.tzstats.com",
                      }
                  },
                  defaultNetwork: "mainnet"
                })
            },
        ]
      })
  })
  
  afterAll(async () => { })

  describe("getAssetData", () => {
    it("should get asset data for `XTZ-USD` on mainnet", async () => {
        const response =  await client.invoke<{ getAssetData: AssetCandle}>({
          uri: wrapperUri,
          method: "getAssetData",
          args: {
            assetCode: "XTZ-USD",
            network: "mainnet",
            providerAddress: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9"
          },
        })

        expect(response.error).toBeUndefined()
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
      const response =  await client.invoke<{ getAssetData: AssetCandle}>({
        uri: wrapperUri,
        method: "getAssetData",
        args: {
          assetCode: "XTZ-USD",
          providerAddress: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9",
          network: "custom",
          custom: {
            connection: {
              provider: "https://rpc.tzstats.com",
              networkNameOrChainId: "mainnet"
            },
          }
        }
      })
      
      expect(response.error).toBeUndefined()
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
      const response =  await client.invoke<{ getAssetData: AssetCandle}>({
        uri: wrapperUri,
        method: "getAssetData",
        args: {
          assetCode: "XTZ-USD",
          providerAddress: "",
          network: "custom"
        }
      })

      expect(response.error).toBeDefined()
      expect(response.data?.getAssetData).toBeUndefined()
    })
  })

  describe("listProviders", () => {
    it("should get a list of Assets fron a Provider", async () => {
      const response =  await client.invoke<{ listProviders: Providers[]}>({
        uri: wrapperUri,
        method: "listProviders",
      })
  
      expect(response.error).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.listProviders).toBeDefined()
    })
  })

  describe("listAssets", () => {
    it("should get a list of Assets from a Provider", async () => {
      const response =  await client.invoke<{ listAssets: string }>({
        uri: wrapperUri,
        method: "listAssets",
        args: {
          providerAddress: "KT1AdbYiPYb5hDuEuVrfxmFehtnBCXv4Np7r",
          network: "mainnet"
        }
      })
  
      expect(response.error).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.listAssets).toBeDefined()
    })
  })

  describe("getCandle", () => {
    it("should get Candle data from a Provider", async () => {
      const response =  await client.invoke<{ getCandle: AssetCandle}>({
        uri: wrapperUri,
        method: "getCandle",
        args: {
          assetCode: "XTZ-USD",
          providerAddress: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9",
          network: "mainnet"
        }
      })
  
      expect(response.error).toBeUndefined()
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
    it("should get Normalized Price of a crypto pair from a Provider", async () => {
      const response =  await client.invoke<{ getNormalizedPrice: string }>({
        uri: wrapperUri,
          method: "getNormalizedPrice",
          args: {
            assetCode: "XTZ-USD",
            providerAddress: "KT1AdbYiPYb5hDuEuVrfxmFehtnBCXv4Np7r",
            network: "mainnet"
          }
        })
  
      expect(response.error).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.getNormalizedPrice).toBeDefined()
    })
  })

})