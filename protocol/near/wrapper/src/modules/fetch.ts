import { JSON, JSONEncoder } from "@polywrap/wasm-as";
import fetchJson from "../utils/fetchJson";
import { toFinalExecutionOutcome, toUsdRatio } from "../utils/jsonMap";
import { publicKeyToStr } from "../utils/typeUtils";
import {
  Args_createMasterAccount,
  Interface_FinalExecutionOutcome,
  Near_Module,
  UsdRatio,
} from "../wrap";
import {
  Args_accountsAtPublicKey,
  Args_getStakingDeposits,
  Args_likelyTokensFromBlock,
  Args_listLikelyNftsContracts,
  Args_nearToUsdRatio,
} from "../wrap/Module/serialization";

export function createMasterAccount(
  args: Args_createMasterAccount
): Interface_FinalExecutionOutcome {
  const helperUrl = Near_Module.getConfig({}).unwrap().helperUrl;

  if (helperUrl != null) {
    const encoder = new JSONEncoder();
    encoder.pushObject(null);
    encoder.setString("newAccountId", args.newAccountId);
    encoder.setString("newAccountPublicKey", publicKeyToStr(args.publicKey));
    encoder.popObject();
    const result = fetchJson(`${helperUrl!}/account`, encoder.toString());
    return toFinalExecutionOutcome(<JSON.Obj>result);
  }
  throw Error("No helper url specified in plugin config");
}

export function getStakingDeposits(args: Args_getStakingDeposits): JSON.Value {
  const indexerServiceUrl = Near_Module.getConfig({}).unwrap()
    .indexerServiceUrl;
  if (indexerServiceUrl != null) {
    return fetchJson(
      `${indexerServiceUrl!}/staking-deposits/${args.accountId}`,
      null
    );
  }
  throw Error("No helper url specified in plugin config");
}

export function listLikelyNftsContracts(
  args: Args_listLikelyNftsContracts
): JSON.Value {
  const indexerServiceUrl = Near_Module.getConfig({}).unwrap()
    .indexerServiceUrl;
  if (indexerServiceUrl != null) {
    return fetchJson(
      `${indexerServiceUrl!}/account/${args.accountId}/likelyNFTsFromBlock`,
      null
    );
  }
  throw Error("No helper url specified in plugin config");
}

export function likelyTokensFromBlock(
  args: Args_likelyTokensFromBlock
): JSON.Value {
  const indexerServiceUrl = Near_Module.getConfig({}).unwrap()
    .indexerServiceUrl;
  if (indexerServiceUrl != null) {
    return fetchJson(
      `${indexerServiceUrl!}/account/${args.accountId}/likelyTokensFromBlock`,
      null
    );
  }
  throw Error("No helper url specified in plugin config");
}

export function accountsAtPublicKey(
  args: Args_accountsAtPublicKey
): JSON.Value {
  const indexerServiceUrl = Near_Module.getConfig({}).unwrap()
    .indexerServiceUrl;
  if (indexerServiceUrl != null) {
    return fetchJson(
      `${indexerServiceUrl!}/publicKey/${args.publicKeyString}/accounts`,
      null
    );
  }
  throw Error("No helper url specified in plugin config");
}

export function nearToUsdRatio(args: Args_nearToUsdRatio): UsdRatio | null {
  const result = fetchJson(
    "https://api.coingecko.com/api/v3/simple/price?ids=near&include_last_updated_at=true&vs_currencies=usd",
    null
  );
  return toUsdRatio(<JSON.Obj>result);
}
