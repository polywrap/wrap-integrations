import { ChainId, Subgraph_Module } from "../wrap";

import { JSON } from "@polywrap/wasm-as";

export class SubgraphEndpoint {
  author: string;
  name: string;
}

export class QueryArgs {
  subgraphAuthor: string;
  subgraphName: string;
  query: string;
}

export function getSubgraphEndpoint(chainId: ChainId): SubgraphEndpoint {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.RINKEBY:
      return { author: "ianlapham", name: "uniswap-v3" };
    case ChainId.OPTIMISM:
      return { author: "ianlapham", name: "uniswap-optimism-dev" };
    case ChainId.ARBITRUM_ONE:
      return { author: "ianlapham", name: "arbitrum-minimal" };
    default:
      throw new Error("Unknown or Unsupported chain ID");
  }
}

export function subgraphQuery(args: QueryArgs): JSON.Obj {
  const response = Subgraph_Module.querySubgraph({
    subgraphAuthor: args.subgraphAuthor,
    subgraphName: args.subgraphName,
    query: args.query,
  }).unwrap();

  const json = JSON.parse(response);

  if (!json.isObj) {
    throw new Error(
      "Subgraph response is not an object.\n" +
        `Author: ${args.subgraphAuthor}\n` +
        `Subgraph: ${args.subgraphName}\n` +
        `Query: ${args.query}\n` +
        `Response: ${response}`
    );
  }

  const obj = json as JSON.Obj;
  return obj.valueOf().get("data") as JSON.Obj;
}
