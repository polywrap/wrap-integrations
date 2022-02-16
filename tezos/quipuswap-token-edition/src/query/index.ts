import {
  Network,
  Tezos_Query,
  GetAssetResponse,
  GetCandleResponse,
  GetNormalizedPriceResponse,
  Tezos_Connection,
  Input_getAssetData,
  Input_getCandle,
  Input_listAssets,
  Input_getNormalizedPrice,
  listProvidersResponse,
  listAssetsResponse,
  CustomConnection
} from "./w3";
import { getString, normalizeValue } from "../utils/common"

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

function getConnectionDetails(network: Network, custom: CustomConnection | null, providerAddress: string): ConnectionDetails {
  let address: string = providerAddress;

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



export function listProviders(): listProvidersResponse {
  
  const storageValue = '{"MainNet":{"Coinbase":{"Storage": "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9","Normalizer": "KT1AdbYiPYb5hDuEuVrfxmFehtnBCXv4Np7r"},"Binance":{ "Storage": "KT1Mx5sFU4BZqnAaJRpMzqaPbd2qMCFmcqea","Normalizer": "KT1SpD9Xh3PcmBGwbZPhVmHUM8shTwYhQFBa"},"Gemini":{"Storage": "KT1Jud6STRGZs6hSfgZsaeztbkzfwC3JswJP","Normalizer": "KT1JywdJbaVW5HtsYh4XNNuHcVL2vE6sYh7W"},"OKEx":{"Storage": "KT1G3UMEkhxso5cdx2fvoJRJu5nUjBWKMrET","Normalizer": "KT1J623FNZ6an8NHkWFbtvm5bKXgFzhBc5Zf"}},"Florencenet":{"Coinbase":{"Storage": "KT1PuT2NwwNjnxKy5XZEDZGHQNgdtLgN69i9","Normalizer": "KT1SUP27JhX24Kvr11oUdWswk7FnCW78ZyUn"}},"Granadanet":{"Coinbase":{"Storage": "KT1ENR6CK7cBWCtZt1G3PovwTw3FgSW472mS","Normalizer": "KT1MwuujtBodVQFm1Jk1KTGNc49wygqoLvpe"}}}';

  const assetData = <JSON.Obj>JSON.parse(storageValue);

  return {
    providers: storageValue
  };
}


export function listAssets(input: Input_listAssets): listAssetsResponse {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }

  const connectionDetails = getConnectionDetails(input.network, input.custom, input.providerAddress);
  const storage = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "assetCodes",
    field: ""
  });
  
  const assetData = storage;
  return {
      assets:  assetData,
  };

}


export function getCandle(input: Input_getCandle): GetCandleResponse{
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }

  const connectionDetails = getConnectionDetails(input.network, input.custom, input.providerAddress);
  const storage = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "oracleData",
    field: input.assetCode
  });
  
  const assetData = <JSON.Obj>JSON.parse(storage);
  return {
      low:  normalizeValue(parseFloat(getString(assetData, "4"))),
      open: normalizeValue(parseFloat(getString(assetData, "2"))),
      high: normalizeValue(parseFloat(getString(assetData, "3"))),
      asset: input.assetCode,
      close: normalizeValue(parseFloat(getString(assetData, "5"))),
      volume: normalizeValue(parseFloat(getString(assetData, "6"))),
      endPeriod: getString(assetData, "1"),
      startPeriod: getString(assetData, "0"),
  };

}


export function getNormalizedPrice(input: Input_getNormalizedPrice): GetNormalizedPriceResponse{
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }

  const connectionDetails = getConnectionDetails(input.network, input.custom, input.providerAddress);
  const storage = Tezos_Query.getContractStorage({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection,
    key: "assetMap",
    field: input.assetCode
  });
  
  const assetData = <JSON.Obj>JSON.parse(storage);
  return {
      price:  getString(assetData, "computedPrice"),
  };

}



export function getAssetData(input: Input_getAssetData): GetAssetResponse {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }
  let oracleContractAddress: string = "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9";
  let connection: Tezos_Connection = {
    provider: "https://rpc.tzstats.com",
    networkNameOrChainId: "mainnet"
  };
  switch (input.network) {
    case Network.granadanet:
      connection = <Tezos_Connection> {
        provider: "https://rpc.granada.tzstats.com",
        networkNameOrChainId: "granadanet"  
      }
      oracleContractAddress = "KT1ENR6CK7cBWCtZt1G3PovwTw3FgSW472mS";
      break;
    case Network.custom:
      connection = input.custom!.connection;
      oracleContractAddress = input.custom!.oracleContractAddress;
      break;
  }
  const storageValue = Tezos_Query.getContractStorage({
    address: oracleContractAddress,
    connection: connection,
    key: "oracleData",
    field: input.assetCode
  });
  const assetData = <JSON.Obj>JSON.parse(storageValue);
  return {
      low:  normalizeValue(parseFloat(getString(assetData, "4"))),
      open: normalizeValue(parseFloat(getString(assetData, "2"))),
      high: normalizeValue(parseFloat(getString(assetData, "3"))),
      asset: input.assetCode,
      close: normalizeValue(parseFloat(getString(assetData, "5"))),
      volume: normalizeValue(parseFloat(getString(assetData, "6"))),
      endPeriod: getString(assetData, "1"),
      startPeriod: getString(assetData, "0"),
  };
}