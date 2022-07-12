import { Uri, PolywrapClient } from "@polywrap/client-js";
import { Substrate_Module } from "./wrap";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";



(async () => {

    //let client = new PolywrapClient();
    let client = new PolywrapClient({
      plugins: [
        {
              uri: new Uri("wrap://ens/ipfs.polywrap.eth").uri,
              plugin: ipfsPlugin({
                provider: "http://localhost:8000",
              })
        }
      ]
    });

    let uri = new Uri("wrap://ipfs/QmYYKkBcxVHCBbuCtMZ57ZE2NsKzZyLVskv8cX4nSzB27P").uri;
    //let uri = "ipfs/QmYYKkBcxVHCBbuCtMZ57ZE2NsKzZyLVskv8cX4nSzB27P";
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
