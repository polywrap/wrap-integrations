import { FeeAmount, Input_computePoolAddress, Token } from "./w3";

/**
 * Returns the Ethereum address of the Pool contract
 */
export function computePoolAddress(input: Input_computePoolAddress): string {
  const tokenA: Token = input.tokenA;
  const tokenB: Token = input.tokenB;
  const fee: FeeAmount = input.fee;
  const initCodeHashManualOverride: string | null = input.initCodeHashManualOverride;
  const factoryAddress: string = input.factoryAddress;
}
