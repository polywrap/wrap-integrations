import { IClientConfigBuilder } from "@polywrap/client-config-builder-js";

export function configure(builder: IClientConfigBuilder): IClientConfigBuilder {
  return builder.addRedirect(
    "wrap://ens/wraps.eth:http@1.1.0",
    "wrap://ens/wrappers.polywrap.eth:http@1.1.0"
  );
}
