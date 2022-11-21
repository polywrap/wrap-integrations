import { PolywrapClientConfig } from '@polywrap/client-js'

export async function getClientConfig(_: Partial<PolywrapClientConfig>): Promise<Partial<PolywrapClientConfig>> {
  return {
    envs: [
      {
        uri: "wrap://ens/ipfs.polywrap.eth",
        env:{
          provider: "https://ipfs.wrappers.io",
          fallbackProviders: ["https://ipfs.io", "http://localhost:48084", "http://127.0.0.1:45005"],
        },
      },
    ],
  }
}
