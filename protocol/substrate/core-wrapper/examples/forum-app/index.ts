import { PolywrapClient } from "@polywrap/client-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";

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
            uri:"wrap://ipfs/QmaAs1DCQDRMVsD2zWaf7L9C6YdESKRj6cTRixJKJs6Duk",
            method,
            args,
        });
    }
}

// attach the PolywrapClient to the window so we can access it later in the rust code
window.PolywrapClientWrapper = PolywrapClientWrapper;
