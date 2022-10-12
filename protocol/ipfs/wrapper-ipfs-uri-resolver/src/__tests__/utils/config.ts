import { concurrentPromisePlugin } from "@polywrap/concurrent-promise-plugin";
import { PolywrapClientConfig } from "@polywrap/client-js";
import path from "path";
import {
  LegacyPluginsResolver,
  LegacyRedirectsResolver,
  WrapperCache,
  PackageToWrapperCacheResolver,
  RecursiveResolver,
} from "@polywrap/uri-resolvers-js";
import { ExtendableUriResolver } from "@polywrap/uri-resolver-extensions-js";
import { ClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { Uri } from "@polywrap/core-js";
import { fileSystemPlugin } from "@polywrap/fs-plugin-js";
import { fileSystemResolverPlugin } from "@polywrap/fs-resolver-plugin-js";
import { httpPlugin } from "@polywrap/http-plugin-js";

export function getClientConfig(
  provider: string,
  timeout?: number
): Partial<PolywrapClientConfig<Uri>> {
  const ipfsResolverPath = path.resolve(path.join(__dirname, "/../../../build"));
  const ipfsResolverUri = `wrap://fs/${ipfsResolverPath}`;

  const ipfsClientPath = path.resolve(path.join(__dirname, "/../../../../wrapper-ipfs-resolver-client/build"));
  const ipfsClientUri = `wrap://fs/${ipfsClientPath}`;

  const concurrencyInterfacePath = path.resolve(path.join(__dirname, "/../../../../../../system/concurrency/interface/build"));
  const concurrencyInterfaceUri = `wrap://fs/${concurrencyInterfacePath}`;

  return new ClientConfigBuilder()
    .add({
      envs: [
        {
          uri: "wrap://ens/ipfs-resolver.polywrap.eth",
          env: { provider, timeout, disableParallelRequests: true },
        },
      ]})
    .add({
      redirects: [
        {
          from: "wrap://ens/ipfs-resolver.polywrap.eth",
          to: ipfsResolverUri,
        },
        {
          from: "ens/ipfs-resolver-client.polywrap.eth",
          to: ipfsClientUri,
        },
        {
          from: "ens/interface.concurrent.polywrap.eth",
          to: concurrencyInterfaceUri,
        },
      ]})
    .add({
      plugins: [
        {
          uri: new Uri("wrap://ens/fs.polywrap.eth"),
          plugin: fileSystemPlugin({}),
        },
        {
          uri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
          plugin: fileSystemResolverPlugin({}),
        },
        {
          uri: "ens/concurrent.polywrap.eth",
          plugin: concurrentPromisePlugin({})
        },
        {
          uri: new Uri("wrap://ens/http.polywrap.eth"),
          plugin: httpPlugin({}),
        },
      ]})
    .add({
      interfaces: [
        {
          interface: new Uri("wrap://ens/uri-resolver.core.polywrap.eth"),
          implementations: [
            new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
            new Uri("wrap://ens/fs-resolver.polywrap.eth"),
          ],
        },
        {
          interface: "ens/interface.concurrent.polywrap.eth",
          implementations: ["ens/concurrent.polywrap.eth"]
        }
      ]})
    .setResolver(
      new RecursiveResolver(
        new PackageToWrapperCacheResolver(new WrapperCache(), [
          new LegacyRedirectsResolver(),
          new LegacyPluginsResolver(),
          new ExtendableUriResolver(),
        ])
      )
    )
    .build();
}