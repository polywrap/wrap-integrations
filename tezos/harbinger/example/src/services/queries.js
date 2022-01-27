import { client } from './client'

const HARBINGER_URI = 'w3://ipfs/QmZh1Hek5xPy22huJgokwUE1XQP2bujYpun1GzcuKt96kv/harbinger'

export const getAssetData = async (assetCode, network) => {
    return await client.query({
            uri: HARBINGER_URI,
            query: `
                query {
                    getAssetData(
                        network: $network
                        assetCode: $assetCode
                        connection: $connection
                    )
                }`,
            variables: {
                assetCode,
                network,
                connection: {
                    networkNameOrChainId: network
                }
            }
    });
}