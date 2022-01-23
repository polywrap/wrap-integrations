import {
  Network,
  Tezos_Query,
  GetAssetResponse,
  Tezos_Connection,
  Input_getAssetData
} from "./w3";
import { getString, normalizeValue } from "../utils/common"

import { JSON } from "assemblyscript-json"; 

// Provide default oracle contract addresses for network
// @link for reference - https://github.com/tacoinfra/harbinger
// Below are contract addresses
// NB: Florencenet is not supported because there are no available public rpc node
// MainNet    -> KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9
// Granadanet -> KT1ENR6CK7cBWCtZt1G3PovwTw3FgSW472mS
export function getAssetData(input: Input_getAssetData): GetAssetResponse {
  if (input.network == Network.CUSTOM && input.custom === null) {
    throw new Error(`custom network should have a valid connection and oracle contract address `)
  }
  let oracleContractAddress: string = "KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9";
  let connection: Tezos_Connection = {
    provider: "https://rpc.tzstats.com",
    networkNameOrChainId: "mainnet"
  };
  switch (input.network) {
    case Network.GRANADANET:
      connection = <Tezos_Connection> {
        provider: "https://rpc.granada.tzstats.com",
        networkNameOrChainId: "granadanet"  
      }
      oracleContractAddress = "KT1ENR6CK7cBWCtZt1G3PovwTw3FgSW472mS";
      break;
    case Network.CUSTOM:
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