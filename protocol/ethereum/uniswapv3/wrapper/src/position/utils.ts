import { Q96 } from "../utils/constants";
import { Args_maxLiquidityForAmounts } from "../wrap";

import { BigInt, BigNumber, JSON, JSONEncoder } from "@polywrap/wasm-as";

/**
 * Returns an imprecise maximum amount of liquidity received for a given amount of token 0.
 * This function is available to accommodate LiquidityAmounts#getLiquidityForAmount0 in the v3 periphery,
 * which could be more precise by at least 32 bits by dividing by Q64 instead of Q96 in the intermediate step,
 * and shifting the subtracted ratio left by 32 bits. This imprecise calculation will likely be replaced in a future
 * v3 router contract.
 * @param sqrtRatioAX96 The price at the lower boundary
 * @param sqrtRatioBX96 The price at the upper boundary
 * @param amount0 The token0 amount
 * @returns liquidity for amount0, imprecise
 */
function maxLiquidityForAmount0Imprecise(
  sqrtRatioAX96: BigInt,
  sqrtRatioBX96: BigInt,
  amount0: BigInt
): BigInt {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    const temp = sqrtRatioAX96;
    sqrtRatioAX96 = sqrtRatioBX96;
    sqrtRatioBX96 = temp;
  }
  const intermediate: BigInt = sqrtRatioAX96.mul(sqrtRatioBX96).div(Q96);
  return amount0.mul(intermediate).div(sqrtRatioBX96.sub(sqrtRatioAX96));
}

/**
 * Returns a precise maximum amount of liquidity received for a given amount of token 0 by dividing by Q64 instead of Q96 in the intermediate step,
 * and shifting the subtracted ratio left by 32 bits.
 * @param sqrtRatioAX96 The price at the lower boundary
 * @param sqrtRatioBX96 The price at the upper boundary
 * @param amount0 The token0 amount
 * @returns liquidity for amount0, precise
 */
function maxLiquidityForAmount0Precise(
  sqrtRatioAX96: BigInt,
  sqrtRatioBX96: BigInt,
  amount0: BigInt
): BigInt {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    const temp = sqrtRatioAX96;
    sqrtRatioAX96 = sqrtRatioBX96;
    sqrtRatioBX96 = temp;
  }
  const numerator: BigInt = amount0.mul(sqrtRatioAX96).mul(sqrtRatioBX96);
  const denominator: BigInt = sqrtRatioBX96.sub(sqrtRatioAX96).mul(Q96);
  return numerator.div(denominator);
}

/**
 * Computes the maximum amount of liquidity received for a given amount of token1
 * @param sqrtRatioAX96 The price at the lower tick boundary
 * @param sqrtRatioBX96 The price at the upper tick boundary
 * @param amount1 The token1 amount
 * @returns liquidity for amount1
 */
function maxLiquidityForAmount1(
  sqrtRatioAX96: BigInt,
  sqrtRatioBX96: BigInt,
  amount1: BigInt
): BigInt {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    const temp = sqrtRatioAX96;
    sqrtRatioAX96 = sqrtRatioBX96;
    sqrtRatioBX96 = temp;
  }
  return amount1.mul(Q96).div(sqrtRatioBX96.sub(sqrtRatioAX96));
}

/**
 * Computes the maximum amount of liquidity received for a given amount of token0, token1,
 * and the prices at the tick boundaries.
 * @param args.sqrtRatioCurrentX96 the current price
 * @param args.sqrtRatioAX96 price at lower boundary
 * @param args.sqrtRatioBX96 price at upper boundary
 * @param args.amount0 token0 amount
 * @param args.amount1 token1 amount
 * @param args.useFullPrecision if false, liquidity will be maximized according to what the router can calculate,
 * not what core can theoretically support
 */
export function maxLiquidityForAmounts(
  args: Args_maxLiquidityForAmounts
): BigInt {
  const sqrtRatioCurrentX96: BigInt = args.sqrtRatioCurrentX96;
  let sqrtRatioAX96: BigInt = args.sqrtRatioAX96;
  let sqrtRatioBX96: BigInt = args.sqrtRatioBX96;
  const amount0: BigInt = args.amount0;
  const amount1: BigInt = args.amount1;
  const useFullPrecision: boolean = args.useFullPrecision;

  if (sqrtRatioAX96 > sqrtRatioBX96) {
    const temp = sqrtRatioAX96;
    sqrtRatioAX96 = sqrtRatioBX96;
    sqrtRatioBX96 = temp;
  }

  const maxLiquidityForAmount0 = useFullPrecision
    ? maxLiquidityForAmount0Precise
    : maxLiquidityForAmount0Imprecise;

  if (sqrtRatioCurrentX96 <= sqrtRatioAX96) {
    return maxLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0);
  } else if (sqrtRatioCurrentX96 < sqrtRatioBX96) {
    const liquidity0 = maxLiquidityForAmount0(
      sqrtRatioCurrentX96,
      sqrtRatioBX96,
      amount0
    );
    const liquidity1 = maxLiquidityForAmount1(
      sqrtRatioAX96,
      sqrtRatioCurrentX96,
      amount1
    );
    return liquidity0 < liquidity1 ? liquidity0 : liquidity1;
  } else {
    return maxLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1);
  }
}

class PermitDetails {
  token: string;
  amount: BigNumber;
  expiration: BigNumber;
  nonce: BigNumber;
}

export class PermitSimple {
  details: PermitDetails;
  spender: string;
  sigDeadline: BigNumber;
}

class TypedDataField {
  type: string;
  name: string;
}

export class Domain {
  name: string;
  chainId: BigNumber;
  verifyingContract: string;
}

export class TypedType {
  EIP712Domain: TypedDataField[];
  PermitSingle: TypedDataField[];
  PermitDetails: TypedDataField[];
  Permit: TypedDataField[];
}

export class TypedData {
  domain: Domain;
  permit: PermitSimple;
  types: TypedType
  primaryType: string;
}

export function toJsonTypedData(typedData: TypedData): JSON.Value {
  const encoder = new JSONEncoder();
  encoder.pushObject(null);

  // Encode domain
  encoder.pushObject("domain");
  encoder.setString("name", typedData.domain.name);
  encoder.setInteger("chainId", typedData.domain.chainId.toBigInt().toInt64());
  encoder.setString("verifyingContract", typedData.domain.verifyingContract);
  encoder.popObject();

  // Encode types
  encoder.pushObject("types");
  encoder.pushArray("EIP712Domain");
  for (let i = 0; i < typedData.types.EIP712Domain.length; i++) {
    encoder.pushObject(null);
    encoder.setString("name", typedData.types.EIP712Domain[i].name);
    encoder.setString("type", typedData.types.EIP712Domain[i].type);
    encoder.popObject();
  }
  encoder.popArray();
  // encoder.pushArray("PermitDetails");
  // for (let i = 0; i < typedData.types.PermitDetails.length; i++) {
  //   encoder.pushObject(null);
  //   encoder.setString("name", typedData.types.PermitDetails[i].name);
  //   encoder.setString("type", typedData.types.PermitDetails[i].type);
  //   encoder.popObject();
  // }
  // encoder.popArray();
  encoder.pushArray("Permit");
  for (let i = 0; i < typedData.types.Permit.length; i++) {
    encoder.pushObject(null);
    encoder.setString("name", typedData.types.Permit[i].name);
    encoder.setString("type", typedData.types.Permit[i].type);
    encoder.popObject();
  }
  encoder.popArray();
  encoder.popObject();

  encoder.setString("primaryType", typedData.primaryType);

  // Encode values
  encoder.pushObject("message");
  encoder.setString("spender", typedData.permit.spender);
  encoder.setString("holder", typedData.permit.spender);
  encoder.setBoolean("allowed", true);
  encoder.setInteger("expiry", typedData.permit.details.expiration.toBigInt().toInt64());
  encoder.setInteger("nonce", typedData.permit.details.nonce.toBigInt().toInt64());

  // encoder.pushObject("details");
  // encoder.setString("token", typedData.permit.details.token);
  // encoder.setString("amount", typedData.permit.details.amount.toString());
  // encoder.popObject();

  encoder.popObject();
  encoder.popObject();

  return <JSON.Value>JSON.parse(encoder.serialize());
}
