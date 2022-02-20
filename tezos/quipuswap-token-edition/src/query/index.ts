import {
  Network,
  Tezos_Query,
  Tezos_Connection,
  Input_listTokenPairs,
  Input_getTokenSupply,
  Input_getLPTokenBalance,
  ListTokenPairsResponse,
  GetTokenSupplyResponse,
  GetLPTokenBalanceResponse,
  CustomConnection
} from "./w3";
import { getString } from "../utils/common"

import { JSON } from "assemblyscript-json"; 

// Provide default oracle contract addresses for network
// @link for contract references - https://github.com/tacoinfra/harbinger
// Below are contract addresses
// NB: Florencenet is not supported because there are no available public rpc node
// MainNet    -> KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9
// Granadanet -> KT1ENR6CK7cBWCtZt1G3PovwTw3FgSW472mS


class ConnectionDetails {
  connection: Tezos_Connection;
  contractAddress: string;
}

function getConnectionDetails(network: Network, custom: CustomConnection | null): ConnectionDetails {
  let address: string = "KT1VNEzpf631BLsdPJjt2ZhgUitR392x6cSi";

  let connection: Tezos_Connection = {
    provider: "https://rpc.tzstats.com",
    networkNameOrChainId: "mainnet"
  };
  if (network == Network.custom) {
    connection = custom!.connection;
    address = custom!.oracleContractAddress;
  }else if(network == Network.granadanet){
    connection = <Tezos_Connection> {
      provider: "https://rpc.granada.tzstats.com",
      networkNameOrChainId: "granadanet"  
    }
    address = custom!.oracleContractAddress;
  }

  return {
    connection: connection,
    contractAddress: address,
  }
}

export function listTokenPairs(input: Input_listTokenPairs): ListTokenPairsResponse {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }

  const connectionDetails = getConnectionDetails(input.network, input.custom);
  
  const pairs_count = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "storage",
    field: "pairs_count"
  });
  
  var token_list = "";

  for (let i = 0, len = parseInt(pairs_count); i < len; i++) {
    
    const token = Tezos_Query.getContractStorage({
      address: connectionDetails.contractAddress,
      connection: connectionDetails.connection,
      key: "storage.tokens",
      field: i.toString()
    });
    
    let comma = i == (parseInt(pairs_count) - 1) ? '' : ',';

    const tokenData = <JSON.Obj>JSON.parse(token);
    token_list = token_list + '{"pair_id":'+i.toString()+'"token_a": '+getString(tokenData, "token_a_type")+', "token_b":' + getString(tokenData, "token_b_type") + '}' + comma;

  }

  return {
    token_list:  token_list,
  };

}


export function getTokenSupply(input: Input_getTokenSupply): GetTokenSupplyResponse{
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }

  const connectionDetails = getConnectionDetails(input.network, input.custom);
  const storage = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "storage.pairs",
    field: input.pair_id
  });
  
  const assetData = <JSON.Obj>JSON.parse(storage);

  return {
    token_a_pool: getString(assetData, "token_a_pool"),
    token_b_pool: getString(assetData, "token_b_pool"),
    total_supply: getString(assetData, "total_supply")
  };

}


export function getLPTokenBalance(input: Input_getLPTokenBalance): GetLPTokenBalanceResponse{
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }

  const connectionDetails = getConnectionDetails(input.network, input.custom);
  const storage = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: 'storage.ledger.["' + input.owner + '",' + input.pair_id + ']',
    field: "balance"
  });
  
  return {
      balance:  storage
  };

}
