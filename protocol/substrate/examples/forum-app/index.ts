import { PolywrapClient } from "@polywrap/client-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";

let module_uri = "//ens/testnet/polywrap.substrate.eth";

class PolywrapClientWrapper extends PolywrapClient{
    constructor() {
        super({
          plugins: [
            {
                  uri: "wrap://ens/ethereum.eth",
                  plugin: ethereumPlugin({
                    networks: {
                      testnet: {
                        provider: "http://localhost:8545",
                      },
                    },
                    defaultNetwork: "testnet",
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
