import { PolywrapClient } from "@polywrap/client-js";
import { ClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { substrateSignerProviderPlugin } from "substrate-signer-provider-plugin-js";

//let module_uri = "wrap://ipfs/QmNdPLkAF4H36N99wfbdbvygG9gQXbp9xVDtjX81cfpAon";
let module_uri = "wrap://ipfs/Qmf6jbRELZJutekPC8hGC7V3eeMxaAh5CKgV2nf9NfyTHa";

class PolywrapClientWrapper extends PolywrapClient{
    constructor() {
        const config = new ClientConfigBuilder()
            .addDefaults()
            .addPlugin(
                "ens/substrate-signer-provider.chainsafe.eth",
                substrateSignerProviderPlugin({})
            )
            .build();

        super(config);
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
// See `src/api.rs` this is linked into the rust code using `wasm-bindgen`.
window.PolywrapClientWrapper = PolywrapClientWrapper;

