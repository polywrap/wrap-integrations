import { PolywrapClient } from "@polywrap/client-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";

let module_uri = "wrap://ens/testnet/substrate.polywrap.eth";

class PolywrapClientWrapper extends PolywrapClient{
    constructor() {
        super({
            plugins: [
              {
                uri: "wrap://ens/ens-resolver.polywrap.eth",
                plugin: ensResolverPlugin({
                  addresses: {
                    testnet: "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"
                  }
                }),
              },
              {
                uri: "wrap://ens/ethereum.polywrap.eth",
                plugin: ethereumPlugin({
                  networks: {
                    testnet: {
                      provider: "http://localhost:8545",
                    },
                  }
                }),
              },
            ]
          })
    }

    async invoke_method(method, args){
        console.log("invoking method:", method);
        console.log("with args:", args);

        let result = await super.invoke({
            uri: module_uri,
            method,
            args,
        });

        console.log("got result: ", result);

        return result.data;
    }
}

// attach the PolywrapClient to the window so we can access it later in the rust code
window.PolywrapClientWrapper = PolywrapClientWrapper;
