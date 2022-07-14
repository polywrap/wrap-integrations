import { Uri, PolywrapClient } from "@polywrap/client-js";
import { Substrate_Module } from "./wrap";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";
import { ipfsResolverPlugin } from "@polywrap/ipfs-resolver-plugin-js";
import { ensAddress } from "@polywrap/test-env-js";



(async () => {

    let client = new PolywrapClient({
        plugins: [
            {
              uri: "wrap://ens/ipfs.polywrap.eth",
              plugin: ipfsPlugin({
                  provider: "https://ipfs.wrappers.io"
                  //provider: "http://localhost:5001"
                  //provider: "https://gateway.ipfs.io"
              }),
            }
        ]
    });

    // old hash (propagated)
    let uri = 'wrap://ipfs/QmaAs1DCQDRMVsD2zWaf7L9C6YdESKRj6cTRixJKJs6Duk';
    //let uri = 'wrap://ipfs/QmU9tc62Ve7C3LkvyvL4HACt2729gPi5yBwf9SSm14wBg8';
    console.log("uri:", uri);

    let result = await client.invoke({
      uri,
      method: "chainGetMetadata",
        args: {
          url: "http://localhost:9933",
        }
    });

    console.log("result: ", result);


    const result_alt = await Substrate_Module.chainGetMetadata(
      {
          url: "http://localhost:9933"
      },
      client,
      uri
    );

      console.log("http response: ", result_alt);
})()
