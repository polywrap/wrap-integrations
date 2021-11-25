import { ethers } from "ethers";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

const ERC20ABI = [
  "function decimals() external pure returns (uint8)",
  "function symbol() external pure returns (string memory)",
  "function name() external pure returns (string memory)",
];

interface Immutables {
  factory: string;
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  maxLiquidityPerTick: ethers.BigNumber;
}

interface State {
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}

async function getPoolImmutables(poolContract: ethers.Contract): Promise<Immutables> {
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
      poolContract.factory(),
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.maxLiquidityPerTick(),
    ]);

  return {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  };
}

async function getPoolState(poolContract: ethers.Contract): Promise<State> {
  const [liquidity, slot] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  };
}

async function getToken(tokenContract: ethers.Contract): Promise<Token> {
  const [decimals, symbol, name] = await Promise.all([
    tokenContract.decimals(),
    tokenContract.symbol(),
    tokenContract.name(),
  ]);
  return new Token(1, tokenContract.address, decimals, symbol, name);
}

export async function getUniswapPool(poolAddress: string, provider: ethers.providers.Provider): Promise<Pool> {

  const poolContract: ethers.Contract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI,
    provider
  );

  const [immutables, state] = await Promise.all([
    getPoolImmutables(poolContract),
    getPoolState(poolContract),
  ]);

  const tokenContractA: ethers.Contract = new ethers.Contract(immutables.token0, ERC20ABI, provider);
  const TokenA: Token = await getToken(tokenContractA);

  const tokenContractB: ethers.Contract = new ethers.Contract(immutables.token1, ERC20ABI, provider);
  const TokenB: Token = await getToken(tokenContractB);

  return new Pool(
    TokenA,
    TokenB,
    immutables.fee,
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick
  );
}