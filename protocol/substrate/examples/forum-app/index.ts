import { PolywrapClient } from "@polywrap/client-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";

let module_uri = 'wrap://ipfs/QmUShkhii5JUM9t3RnZtS2kTUqReSjNVHQ9NaMzEMazqJ9';

class PolywrapClientWrapper extends PolywrapClient{
    constructor() {
        super({
            plugins: [
                {
                  uri: "wrap://ens/ipfs.polywrap.eth",
                  plugin: ipfsPlugin({
                      provider: "https://ipfs.wrappers.io"
                  }),
                }
            ]
        })
    }

    async invoke_method(method, args){
        return super.invoke({
            uri: module_uri,
            method,
            args,
        });
    }
}

// attach the PolywrapClient to the window so we can access it later in the rust code
window.PolywrapClientWrapper = PolywrapClientWrapper;
