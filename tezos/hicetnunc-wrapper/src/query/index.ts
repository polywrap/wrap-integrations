import {
  Network,
  Tezos_Query,
  Tezos_Connection,
  GetBalanceResponse,
  Input_getBalanceOf,
  GetTokenMetadataResponse,
  GetTokenCountResponse,
  GetSwapsResponse,
  Input_getTokenMetadata,
  Input_getTokenCountData,
  Input_getSwapsData,
  CustomConnection
} from "./w3";
import { getString } from "../utils/common"

import { JSON } from "assemblyscript-json"; 

class ConnectionDetails {
  connection: Tezos_Connection;
  contractAddress: string;
}

export function getBalanceOf(input: Input_getBalanceOf): GetBalanceResponse {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and contract address`);
  }
  const connectionDetails = getConnectionDetails(input.network, input.custom, false);
  const balance = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "ledger",
    field: '["' + input.owner + '",' + input.token_id + ']',
  });
  return {
      owner: input.owner,
      token_id: input.token_id,
      balance: balance
  };
} 

export function getTokenMetadata(input: Input_getTokenMetadata): GetTokenMetadataResponse {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and contract address `)
  }
  const connectionDetails = getConnectionDetails(input.network, input.custom, false);
  const storage = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "token_metadata",
    field: input.token_id
  });
  const metadata = <JSON.Obj>JSON.parse(storage);
  const hash = <JSON.Obj>JSON.parse(getString(metadata, "token_info"));
  return {
      token_id: getString(metadata, "token_id"),
      ipfs_hash: getString(hash, "")
  };
}

export function getTokenCountData(input: Input_getTokenCountData): GetTokenCountResponse {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and contract address`)
  }
  const connectionDetails = getConnectionDetails(input.network, input.custom, false);
  const count = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "all_tokens"
  });
  return {
    tokenCount: count,
  };
}

export function getSwapsData(input: Input_getSwapsData): GetSwapsResponse {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }
  const connectionDetails = getConnectionDetails(input.network, input.custom, true);
  const storage = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "swaps",
    field: input.swap_id
  });
  const swap = <JSON.Obj>JSON.parse(storage);
  return {
    creator: getString(swap, "creator"),
    issuer: getString(swap, "issuer"),
    objkt_amount: getString(swap, "objkt_amount"),
    objkt_id: getString(swap, "objkt_id"),
    royalties: getString(swap, "royalties"),
  };
}

function getConnectionDetails(network: Network, custom: CustomConnection | null, isMarketPlace: boolean): ConnectionDetails {
  let address: string = "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton";
  if(isMarketPlace) {
    address = "KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn"
  }
  let connection: Tezos_Connection = {
    provider: "https://rpc.tzstats.com",
    networkNameOrChainId: "mainnet"
  };
  if (network == Network.custom) {
    connection = custom!.connection;
    address = custom!.contractAddress;
  }
  return {
    connection: connection,
    contractAddress: address,
  }
}