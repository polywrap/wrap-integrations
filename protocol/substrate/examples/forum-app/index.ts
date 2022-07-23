import { PolywrapClient } from "@polywrap/client-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";


//let module_uri = "wrap://ipfs/QmbjF9VSGQTHTSiervdxDP77hvaRs4vTJ39bdtBpMHtr6K";
//let module_uri = "wrap://ipfs/QmVmGnb49AoCGLS99BzKYrPCZyryWGjpiX1VYFGFX7nzK3";
//let module_uri = "wrap://ipfs/Qmdaefmdtjy3neq4vpLzg4EmLTSjFBiJUnXqUhXTf3zmaN";
//let module_uri = "wrap://ipfs/QmVttKyAX2cN2zaF1ztC4G4RRqN9xCsiJ6Vg4Rv9S5juZr";
//let module_uri = "wrap://ipfs/QmfJEC73Zb7D9zinwBqsXpcyGT6YvBeUjtMmv8X9h9dY6C";
let module_uri = "wrap://ipfs/QmQDqV2Y3QD87CG48quXmWXigLBZ3J2qn5z4BY4ZhwMTtL"

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
