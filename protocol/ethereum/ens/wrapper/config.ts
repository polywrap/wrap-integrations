import { PolywrapClientConfig } from "@polywrap/client-js";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";

export function getClientConfig(defaultConfigs: Partial<PolywrapClientConfig>) {
  return {
    redirects: [
      {
        from: "wrap://ens/uts46.polywrap.eth",
        to: "wrap://ens/goerli/uts46-lite.wrappers.eth"
      },
      {
        from: "wrap://ens/sha3.polywrap.eth",
        to: "wrap://ens/goerli/sha3.wrappers.eth"
      }
    ],
    plugins: [
      {
        uri: "ens/ethereum.polywrap.eth",
        plugin: ethereumPlugin({
          networks: {
            mainnet: {
              provider:
                "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
            },
            goerli: {
              provider:
                "https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
            },
          },
          defaultNetwork: "goerli",
        }),
      }
    ]
  }
}
