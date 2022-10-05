import { PolywrapClientConfig } from '@polywrap/client-js'
import { ipfsPlugin } from '@polywrap/ipfs-plugin-js'

export async function getClientConfig(_: Partial<PolywrapClientConfig>): Promise<Partial<PolywrapClientConfig>> {
  return {
    plugins: [
      {
        uri: "wrap://ens/ipfs.polywrap.eth",
        plugin: ipfsPlugin({
          provider: "https://ipfs.wrappers.io",
          fallbackProviders: ["https://ipfs.io", "http://localhost:48084", "http://127.0.0.1:45005"],
        }),
      },
    ],
  }
}
