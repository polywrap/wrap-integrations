import { IClientConfigBuilder } from '@polywrap/client-js'

export function configure(builder: IClientConfigBuilder): IClientConfigBuilder {
  return builder.addEnv("wrap://ens/ipfs.polywrap.eth",
    {
      provider: "https://ipfs.wrappers.io",
      fallbackProviders: ["https://ipfs.io", "http://localhost:48084", "http://127.0.0.1:45005"],
    },
  )
}
