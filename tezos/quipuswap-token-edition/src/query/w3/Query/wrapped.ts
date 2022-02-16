import {
  getAssetData,
  listAssets,
  getCandle,
  listProviders,
  getNormalizedPrice
} from "../../index";
import {
  deserializegetAssetDataArgs,
  serializegetAssetDataResult,
  deserializelistAssetsArgs,
  serializelistAssetsResult,
  deserializegetCandleArgs,
  serializegetCandleResult,
  deserializelistProvidersArgs,
  serializelistProvidersResult,
  deserializegetNormalizedPriceArgs,
  serializegetNormalizedPriceResult
} from "./serialization";

export function getAssetDataWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializegetAssetDataArgs(argsBuf);
  const result = getAssetData({
    network: args.network,
    assetCode: args.assetCode,
    custom: args.custom
  });
  return serializegetAssetDataResult(result);
}

export function listAssetsWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializelistAssetsArgs(argsBuf);
  const result = listAssets({
    network: args.network,
    custom: args.custom,
    providerAddress: args.providerAddress
  });
  return serializelistAssetsResult(result);
}

export function getCandleWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializegetCandleArgs(argsBuf);
  const result = getCandle({
    network: args.network,
    custom: args.custom,
    assetCode: args.assetCode,
    providerAddress: args.providerAddress
  });
  return serializegetCandleResult(result);
}

export function listProvidersWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const result = listProviders();
  return serializelistProvidersResult(result);
}

export function getNormalizedPriceWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializegetNormalizedPriceArgs(argsBuf);
  const result = getNormalizedPrice({
    network: args.network,
    custom: args.custom,
    assetCode: args.assetCode,
    providerAddress: args.providerAddress
  });
  return serializegetNormalizedPriceResult(result);
}
