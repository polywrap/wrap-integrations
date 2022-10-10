import { concurrentPromisePlugin } from "@polywrap/concurrent-promise-plugin";
import { PolywrapClientConfig } from "@polywrap/client-js";
import path from "path";

export function getClientConfig(
  provider: string,
  timeout?: number
): Partial<PolywrapClientConfig> {
  const ipfsExecPath = path.resolve(path.join(__dirname, "/../../../build"));
  const ipfsExecUri = `wrap://fs/${ipfsExecPath}`;

  const ipfsClientPath = path.resolve(path.join(__dirname, "/../../../../wrapper-ipfs-client/build"));
  const ipfsClientUri = `wrap://fs/${ipfsClientPath}`;

  const concurrencyInterfacePath = path.resolve(path.join(__dirname, "/../../../../../../system/concurrency/interface/build"));
  const concurrencyInterfaceUri = `wrap://fs/${concurrencyInterfacePath}`;

  return {
    envs: [
      {
        uri: "wrap://ens/ipfs.polywrap.eth",
        env: { provider, timeout, disableParallelRequests: true },
      },
    ],
    redirects: [
      {
        from: "wrap://ens/ipfs.polywrap.eth",
        to: ipfsExecUri,
      },
      {
        from: "ens/ipfs-client.polywrap.eth",
        to: ipfsClientUri,
      },
      {
        from: "ens/interface.concurrent.polywrap.eth",
        to: concurrencyInterfaceUri,
      },
    ],
    plugins: [
      {
        uri: "ens/concurrent.polywrap.eth",
        plugin: concurrentPromisePlugin({})
      }
    ],
    interfaces: [
      {
        interface: concurrencyInterfaceUri,
        implementations: ["ens/concurrent.polywrap.eth"]
      }
    ]
  };
}