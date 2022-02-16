import {
  listTokenPairs,
  getTokenSupply,
  getLPTokenBalance
} from "../../index";
import {
  deserializelistTokenPairsArgs,
  serializelistTokenPairsResult,
  deserializegetTokenSupplyArgs,
  serializegetTokenSupplyResult,
  deserializegetLPTokenBalanceArgs,
  serializegetLPTokenBalanceResult
} from "./serialization";

export function listTokenPairsWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializelistTokenPairsArgs(argsBuf);
  const result = listTokenPairs({
    network: args.network,
    custom: args.custom
  });
  return serializelistTokenPairsResult(result);
}

export function getTokenSupplyWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializegetTokenSupplyArgs(argsBuf);
  const result = getTokenSupply({
    network: args.network,
    custom: args.custom,
    pair_id: args.pair_id
  });
  return serializegetTokenSupplyResult(result);
}

export function getLPTokenBalanceWrapped(argsBuf: ArrayBuffer): ArrayBuffer {
  const args = deserializegetLPTokenBalanceArgs(argsBuf);
  const result = getLPTokenBalance({
    network: args.network,
    custom: args.custom,
    owner: args.owner,
    pair_id: args.pair_id
  });
  return serializegetLPTokenBalanceResult(result);
}
