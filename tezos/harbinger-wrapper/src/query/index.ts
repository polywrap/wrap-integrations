import {
  Tezos_Query,
  GetAssetResponse,
  Input_getAssetData
} from "./w3";
import { getString, normalizeValue } from "../utils/common"

import { JSON } from "assemblyscript-json"; 

export function getAssetData(input: Input_getAssetData): GetAssetResponse {
  const storageValue = Tezos_Query.getContractStorage({
    address: input.oracleContractAddress,
    connection: input.connection,
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