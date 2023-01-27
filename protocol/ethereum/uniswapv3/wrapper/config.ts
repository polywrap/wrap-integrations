import { IClientConfigBuilder } from '@polywrap/client-js'
import path from "path";
import fs from "fs";
import { WasmWrapper } from '@polywrap/wasm-js';
import { IUriWrapper } from '@polywrap/core-js';
import { buildWrapper } from '@polywrap/test-env-js';

export async function configure(builder: IClientConfigBuilder): Promise<IClientConfigBuilder> {
  const relSystemWrappersPath = path.join(__dirname, "../../../../system");
  const systemsWrappersPath = path.resolve(relSystemWrappersPath);

  const graphNodePath = path.join(systemsWrappersPath, "graph-node", "wrapper");
  await buildWrapper(graphNodePath, undefined, true);
  const graphNodeWrapperManifest = fs.readFileSync(path.join(graphNodePath, "build", "wrap.info"));
  const graphNodeWrapperModule = fs.readFileSync(path.join(graphNodePath, "build", "wrap.wasm"));
  const subgraphWrapper =  await WasmWrapper.from(graphNodeWrapperManifest, graphNodeWrapperModule);
  const subgraphUriWrapper: IUriWrapper<string> = {
    uri: "wrap://ens/graph-node.polywrap.eth",
    wrapper: subgraphWrapper,
  }

  const sha3Path = path.join(systemsWrappersPath, "sha3", "wrapper");
  await buildWrapper(sha3Path, undefined, true);
  const sha3WrapperManifest = fs.readFileSync(path.join(sha3Path, "build", "wrap.info"));
  const sha3WrapperModule = fs.readFileSync(path.join(sha3Path, "build", "wrap.wasm"));
  const sha3Wrapper =  await WasmWrapper.from(sha3WrapperManifest, sha3WrapperModule);
  const sha3UriWrapper: IUriWrapper<string> = {
    uri: "wrap://ens/sha3.polywrap.eth",
    wrapper: sha3Wrapper,
  }

  return builder
    .addDefaults()
    .addEnv("wrap://ens/ipfs.polywrap.eth", {
      provider: "https://ipfs.wrappers.io",
      fallbackProviders: ["https://ipfs.io", "http://localhost:48084", "http://127.0.0.1:45005"],
    })
    .addWrapper(subgraphUriWrapper)
    .addWrapper(sha3UriWrapper)
}
