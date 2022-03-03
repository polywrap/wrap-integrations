import {
  Network,
  Tezos_Query,
  Input_listTokenPairs,
  Input_getTokenSupply,
  Input_getLPTokenBalance,
  GetTokenSupplyResponse
} from "./w3";
import { getString, getConnection, parseTokenType } from "../common/utils";

import { JSON } from "@web3api/wasm-as"; 

export function listTokenPairs(input: Input_listTokenPairs): JSON.Arr {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }
  const connection = getConnection(input.network, input.custom);
  const pairsCount = Tezos_Query.getContractStorage({
    address: connection.contractAddress,
    connection: connection.connection,
    key: "storage",
    field: "pairs_count"
  });
  const tokenPairs = JSON.Value.Array();
  for (let i = 0; i < parseInt(pairsCount); i++) {
    const token = Tezos_Query.getContractStorage({
      address: connection.contractAddress,
      connection: connection.connection,
      key: `storage.tokens`,
      field: i.toString()
    });
    const parsedToken = <JSON.Obj>JSON.parse(token);
    const parsedTokenA = parseTokenType(parsedToken, "token_a_type");
    const parsedTokenB = parseTokenType(parsedToken, "token_b_type");
    const tokenObj = JSON.Value.Object();
    tokenObj.set("pair_id", i);
    tokenObj.set("token_a", parsedTokenA);
    tokenObj.set("token_b", parsedTokenB);
    tokenPairs.push(tokenObj);
  }
  return tokenPairs;
}

export function getTokenSupply(input: Input_getTokenSupply): GetTokenSupplyResponse{
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }
  const connection = getConnection(input.network, input.custom);
  const storage = Tezos_Query.getContractStorage({
    address: connection.contractAddress,
    connection: connection.connection,
    key: "storage.pairs",
    field: input.pairId
  });
  const assetData = <JSON.Obj>JSON.parse(storage);
  return {
    token_a_pool: getString(assetData, "token_a_pool"),
    token_b_pool: getString(assetData, "token_b_pool"),
    total_supply: getString(assetData, "total_supply")
  };
}


export function getLPTokenBalance(input: Input_getLPTokenBalance): string {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }
  const connection = getConnection(input.network, input.custom);
  return Tezos_Query.getContractStorage({
    address: connection.contractAddress,
    connection: connection.connection,
    key: 'storage.ledger.["' + input.owner + '",' + input.pairId + '].balance',
    field: ""
  });
}