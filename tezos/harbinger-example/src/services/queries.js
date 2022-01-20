
import { get } from '@tacoinfra/harbinger-lib';
import { client } from './client'
const uri = 'w3://ens/tezos-domains.web3api.eth'

export const harbinger_lib = async () => {
    return await get(
        "https://mainnet.smartpy.io",
        "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9",
        "BAT-USDC",
        "Debug",
    );
}
        
export const helloworld = async () => {
    return await client.query({
        uri: 'ens/helloworld.web3api.eth',
        query: `{
        logMessage(message: "Hello World!")
        }`,
    });
}
    
export const bw_harbinger = async () => {
    return await client.query({
            uri: 'w3://ipfs/QmZh1Hek5xPy22huJgokwUE1XQP2bujYpun1GzcuKt96kv/harbinger',
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
    });
}