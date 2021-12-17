import { ethers } from "ethers";
import { Pool, Tick, TickMath } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { isDefined } from "./testUtils";

const ERC20ABI = [
  "function decimals() external pure returns (uint8)",
  "function symbol() external pure returns (string memory)",
  "function name() external pure returns (string memory)",
];

interface Immutables {
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
}

interface State {
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
}

async function getPoolImmutables(poolContract: ethers.Contract): Promise<Immutables> {
  const [token0, token1, fee, tickSpacing] =
    await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
    ]);

  return {
    token0,
    token1,
    fee,
    tickSpacing,
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
  };
}

async function getTickAtIndex(poolContract: ethers.Contract, index: number): Promise<Tick | undefined> {
  try {
    const tickInfo = await poolContract.ticks(index);
    return new Tick({
      index: index,
      liquidityGross: tickInfo[0],
      liquidityNet: tickInfo[1],
    });
  } catch (e) {
    return undefined;
  }
}

async function getPoolTicks(poolContract: ethers.Contract, tickSpacing: number): Promise<Tick[]> {
  const ticks: Promise<Tick | undefined>[] = [];
  for (let i = 0; i >= TickMath.MIN_TICK; i -= tickSpacing) {
    ticks.push(getTickAtIndex(poolContract, i));
  }
  ticks.reverse();
  for (let i = tickSpacing; i <= TickMath.MAX_TICK; i += tickSpacing) {
    ticks.push(getTickAtIndex(poolContract, i));
  }
  const result: (Tick | undefined)[] = await Promise.all(ticks);
  return result.filter(isDefined);
}

async function getToken(tokenContract: ethers.Contract): Promise<Token> {
  const [decimals, symbol, name] = await Promise.all([
    tokenContract.decimals(),
    tokenContract.symbol(),
    tokenContract.name(),
  ]);
  return new Token(1, tokenContract.address, decimals, symbol, name);
}

export async function getUniswapPool(poolAddress: string, provider: ethers.providers.Provider, fetchTicks?: boolean): Promise<Pool | undefined> {

  const poolContract: ethers.Contract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI,
    provider
  );

  const immutables: Immutables = await getPoolImmutables(poolContract);

  const tokenContractA: ethers.Contract = new ethers.Contract(immutables.token0, ERC20ABI, provider);
  const tokenContractB: ethers.Contract = new ethers.Contract(immutables.token1, ERC20ABI, provider);

  const [state, tokenA, tokenB] = await Promise.all([
    getPoolState(poolContract),
    getToken(tokenContractA),
    getToken(tokenContractB),
  ]);

  let ticks: Tick[] | undefined = undefined;
  if (fetchTicks) {
    ticks = await getPoolTicks(poolContract, immutables.tickSpacing);
  }

  let pool: Pool | undefined;
  try {
    pool = new Pool(
      tokenA,
      tokenB,
      immutables.fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick,
      ticks
    );
  } catch (e) {
    console.log("getUniswapPool: " + e.message);
    pool = undefined;
  }
  return pool;
}