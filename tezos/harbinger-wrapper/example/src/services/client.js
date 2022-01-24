import { Web3ApiClient } from "@web3api/client-js"
import { tezosPlugin } from "@web3api/tezos-plugin-js"


export const client = new Web3ApiClient({
    plugins: [
        {
          uri: "w3://ens/tezos.web3api.eth",
          plugin: tezosPlugin({
            networks: {
                mainnet: {
                    provider: "https://rpc.tzstats.com"
                },  
                testnet: {
                    provider: "https://rpc.granada.tzstats.com",
                }
            },
            defaultNetwork: "mainnet"
          })
        }
    ]
})