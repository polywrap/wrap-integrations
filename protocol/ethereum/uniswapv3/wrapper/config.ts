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

  return builder
    .addDefaults()
    .addEnv("wrap://ens/ipfs.polywrap.eth", {
      provider: "https://ipfs.wrappers.io",
      fallbackProviders: ["https://ipfs.io", "http://localhost:48084", "http://127.0.0.1:45005"],
    })
    .addWrapper(subgraphUriWrapper)
}
