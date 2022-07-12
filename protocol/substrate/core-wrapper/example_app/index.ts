import { Uri, PolywrapClient } from "@polywrap/client-js";
import { Substrate_Module } from "./wrap";



(async () => {
    let uri = new Uri("wrap://ipfs/QmYYKkBcxVHCBbuCtMZ57ZE2NsKzZyLVskv8cX4nSzB27P").uri;
    console.log("uri:", uri);

    let client = new PolywrapClient();
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
