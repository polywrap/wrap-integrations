import { Uri, PolywrapClient } from "@polywrap/client-js";
import { Substrate_Module } from "./wrap";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";
import { ensAddress } from "@polywrap/test-env-js";



(async () => {

    export const ensAddress = {
      ensAddress: "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab",
      resolverAddress: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
      registrarAddress: "0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb",
      reverseAddress: "0xe982E462b094850F12AF94d21D470e21bE9D0E9C",
    } as const;

    //let client = new PolywrapClient();
    let client = new PolywrapClient({
      plugins: [
        {
              uri: new Uri("wrap://ens/ipfs.polywrap.eth").uri,
              plugin: ipfsPlugin({
                provider: "http://localhost:8000",
              })
        },
        {
          uri: "wrap://ens/ens-resolver.polywrap.eth",
          plugin: ensResolverPlugin({
            addresses: {
              testnet: ensAddress,
            },
          }),
        }
      ]
    });
    /*
    let client = new PolywrapClient({
          uri: "wrap://ens/ens-resolver.polywrap.eth",
          plugin: ensResolverPlugin({
            addresses: {
              testnet: ensAddress,
            },
          }),
        });
    */

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
