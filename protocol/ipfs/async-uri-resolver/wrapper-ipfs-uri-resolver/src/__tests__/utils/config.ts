import { concurrentPromisePlugin } from "@polywrap/concurrent-promise-plugin";
import { PolywrapCoreClientConfig } from "@polywrap/client-js";
import path from "path";
import { ClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { Uri } from "@polywrap/core-js";
import { fileSystemPlugin } from "@polywrap/fs-plugin-js";
import { fileSystemResolverPlugin } from "@polywrap/fs-resolver-plugin-js";
import { httpPlugin } from "@polywrap/http-plugin-js";

export function getClientConfig(
  provider: string,
  timeout?: number
): PolywrapCoreClientConfig {
  const ipfsResolverPath = path.resolve(path.join(__dirname, "/../../../build"));
  const ipfsResolverUri = `wrap://fs/${ipfsResolverPath}`;

  const ipfsClientPath = path.resolve(path.join(__dirname, "/../../../../wrapper-ipfs-resolver-client/build"));
  const ipfsClientUri = `wrap://fs/${ipfsClientPath}`;

  const concurrencyInterfacePath = path.resolve(path.join(__dirname, "/../../../../../../../system/concurrency/interface/build"));
  const concurrencyInterfaceUri = `wrap://fs/${concurrencyInterfacePath}`;

  return new ClientConfigBuilder()
    .addEnvs([
        {
          uri: new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
          env: { provider, timeout },
        },
      ])
    .addRedirects([
        {
          from: new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
          to: new Uri(ipfsResolverUri),
        },
        {
          from: new Uri("ens/ipfs-resolver-client.polywrap.eth"),
          to: new Uri(ipfsClientUri),
        },
        {
          from: new Uri("ens/interface.concurrent.polywrap.eth"),
          to: new Uri(concurrencyInterfaceUri),
        },
      ])
    .addPackages( [
        {
          uri: new Uri("wrap://ens/fs.polywrap.eth"),
          package: fileSystemPlugin({}),
        },
        {
          uri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
          package: fileSystemResolverPlugin({}),
        },
        {
          uri: new Uri("ens/concurrent.polywrap.eth"),
          package: concurrentPromisePlugin({})
        },
        {
          uri: new Uri("wrap://ens/http.polywrap.eth"),
          package: httpPlugin({}),
        },
      ])
    .addInterfaceImplementations(
      new Uri("wrap://ens/uri-resolver.core.polywrap.eth"),[
            new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
            new Uri("wrap://ens/fs-resolver.polywrap.eth"),
          ])
    .addInterfaceImplementations(
      new Uri("ens/interface.concurrent.polywrap.eth"),
      [new Uri("ens/concurrent.polywrap.eth")]
    )
    .buildCoreConfig()
}