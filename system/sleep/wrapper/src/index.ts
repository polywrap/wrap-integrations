import { Interface, Interface_Module, Args_sleep } from "./wrap";
import { Option } from "@polywrap/wasm-as";

export function sleep(args: Args_sleep): Option<bool> {
  const uris = Interface.getImplementations();
  return new Interface_Module(uris[0]).sleep({
      ms: args.ms
    }).unwrap();
}