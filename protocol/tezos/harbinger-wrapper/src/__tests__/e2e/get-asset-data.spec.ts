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
        const response =  await client.query<{ getAssetData: AssetCandle}>({
          uri: wrapperUri,
          query: `
            query {
              getAssetData(
                assetCode: $assetCode,
                network: mainnet,
                providerAddress: $providerAddress
              )
            }
          `,
          variables: {
            assetCode: "XTZ-USD",
            providerAddress: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9"
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
      const response =  await client.query<{ getAssetData: AssetCandle}>({
        uri: wrapperUri,
        query: `
        query {
            getAssetData(
              assetCode: $assetCode,
              providerAddress: $providerAddress
              network: custom,
              custom: $custom
            )
          }
          `,
          variables: {
            custom: {
              connection: {
                provider: "https://rpc.tzstats.com",
                networkNameOrChainId: "mainnet"
              },
            },
            providerAddress: "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9",
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
      const response =  await client.query<{ getAssetData: AssetCandle}>({
        uri: wrapperUri,
        query: `
        query {
            getAssetData(
              assetCode: $assetCode,
              providerAddress: ""
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
    it("should get a list of Assets fron a Provider", async () => {
      const response =  await client.query<{ listProviders: Providers[]}>({
        uri: wrapperUri,
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
      expect(response.data?.listProviders).toBeDefined()
    })
  })

  describe("listAssets", () => {
    it("should get a list of Assets from a Provider", async () => {
      const response =  await client.query<{ listAssets: string }>({
        uri: wrapperUri,
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
              network: "mainnet",
            }
          })
  
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.listAssets).toBeDefined()
    })
  })

  describe("getCandle", () => {
    it("should get Candle data from a Provider", async () => {
      const response =  await client.query<{ getCandle: AssetCandle}>({
        uri: wrapperUri,
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
              network: "mainnet",
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
    it("should get Normalized Price of a crypto pair from a Provider", async () => {
      const response =  await client.query<{ getNormalizedPrice: string }>({
        uri: wrapperUri,
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
              network: "mainnet",
            }
          })
  
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.getNormalizedPrice).toBeDefined()
    })
  })

})