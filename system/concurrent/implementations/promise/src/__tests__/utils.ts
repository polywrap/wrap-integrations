import { ClientConfig, Uri } from "@polywrap/client-js";
import { ClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { ensAddresses, providers } from "@polywrap/test-env-js";

import { concurrentPromisePlugin } from "..";

export interface TestEnvironment {
  ipfs: string;
  ethereum: string;
  ensAddress: string;
}

export const testEnv: TestEnvironment = {
  ipfs: providers.ipfs,
  ethereum: providers.ethereum,
  ensAddress: ensAddresses.ensAddress,
};

export function getClientConfig(): ClientConfig<Uri> {
  return new ClientConfigBuilder()
    .addDefaults()
    .addPlugin(
      "wrap://ens/interface.concurrent.polywrap.eth",
      concurrentPromisePlugin({})
    )
    .build();
}
