import { PolywrapCoreClientConfig } from "@polywrap/client-js";
import path from "path";
import { ClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { Uri } from "@polywrap/core-js";
import { fileSystemPlugin } from "@polywrap/fs-plugin-js";
import { fileSystemResolverPlugin } from "@polywrap/fs-resolver-plugin-js";
import { httpPlugin } from "@polywrap/http-plugin-js";

export function getClientConfig(
  provider: string,
  timeout?: number,
  disableParallelRequests?: boolean
): PolywrapCoreClientConfig {
  const ipfsResolverPath = path.resolve(path.join(__dirname, "/../../../build"));
  const ipfsResolverUri = `wrap://fs/${ipfsResolverPath}`;

  // found on https://ipfs.github.io/public-gateway-checker/
  const slowIpfsProviders = [
    "https://hardbin.com",
    "https://ipns.co",
    "https://nftstorage.link",
    "https://storry.tv",
  ];

  return new ClientConfigBuilder()
    .addEnvs([
        {
          uri: new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
          env: { provider: "https://ipfs.io", fallbackProviders: [...slowIpfsProviders, provider], timeout, disableParallelRequests },
        },
      ])
    .addRedirects([
        {
          from: new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
          to: new Uri(ipfsResolverUri),
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
          uri: new Uri("wrap://ens/http.polywrap.eth"),
          package: httpPlugin({}),
        },
      ])
    .addInterfaceImplementations(
      new Uri("wrap://ens/uri-resolver.core.polywrap.eth"),[
            new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
            new Uri("wrap://ens/fs-resolver.polywrap.eth"),
          ])
    .buildCoreConfig()
}