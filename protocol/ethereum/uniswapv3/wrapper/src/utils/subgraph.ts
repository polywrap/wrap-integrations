import { ChainId, Subgraph_Module } from "../wrap";

import { JSON } from "@polywrap/wasm-as";

export class SubgraphEndpoint {
  author: string;
  name: string;
}

export class QueryArgs {
  url: string;
  query: string;
}

export function getSubgraphEndpoint(chainId: ChainId): string {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.RINKEBY:
      return "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
    case ChainId.OPTIMISM:
      return "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-optimism-dev";
    case ChainId.ARBITRUM_ONE:
      return "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal";
    default:
      throw new Error("Unknown or Unsupported chain ID");
  }
}

export function subgraphQuery(args: QueryArgs): JSON.Obj {
  const response = Subgraph_Module.querySubgraph({
    url: args.url,
    query: args.query,
  }).unwrap();

  const json = JSON.parse(response);

  if (!json.isObj) {
    throw new Error(
      "Subgraph response is not an object.\n" +
        `Subgraph: ${args.url}\n` +
        `Query: ${args.query}\n` +
        `Response: ${response}`
    );
  }

  const obj = json as JSON.Obj;
  return obj.valueOf().get("data") as JSON.Obj;
}
