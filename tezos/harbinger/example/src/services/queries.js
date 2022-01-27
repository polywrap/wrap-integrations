import { client } from './client'

const HARBINGER_URI = 'w3://ipfs/QmYEz2Zxr5Zd3UuWs2ijocsGkvaoLurkzXJb1Wc9NK1nWt'

export const getAssetData = async (assetCode, network) => {
    return await client.query({
            uri: HARBINGER_URI,
            query: `
                query {
                    getAssetData(
                        network: $network,
                        assetCode: $assetCode,
                    )
                }`,
            variables: {
                assetCode,
                network
            }
    });
}