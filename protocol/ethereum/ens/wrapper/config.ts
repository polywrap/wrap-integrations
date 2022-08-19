import { PolywrapClientConfig } from "@polywrap/client-js";

export function getClientConfig(defaultConfigs: Partial<PolywrapClientConfig>) {
  return {
    redirects: [
      {
        from: "wrap://ens/uts46.polywrap.eth",
        to: "wrap://ipfs/QmZFz2KxpugGU7Lgo8mkEiAZVBGHqgMt7FLP42LRGRqsHT"
      },
      {
        from: "wrap://ens/sha3.polywrap.eth",
        to: "wrap://ipfs/QmYFWh4D91sAiYKf8o37EravLwFKAtUAmut4Xnevnt4QZR"
      }
    ]
  }
}
