---
id: module
title: Module
sidebar_position: 1
---

### approve 

```graphql
approve(
  token: Token! 
  amount: BigInt 
  txOverrides: TxOverrides 
): Ethereum_TxResponse!
```

### bestTradeExactIn 

```graphql
bestTradeExactIn(
  pairs: Pair[]! 
  amountIn: TokenAmount! 
  tokenOut: Token! 
  options: BestTradeOptions 
): Trade[]!
```

### bestTradeExactOut 

```graphql
bestTradeExactOut(
  pairs: Pair[]! 
  tokenIn: Token! 
  amountOut: TokenAmount! 
  options: BestTradeOptions 
): Trade[]!
```

### createRoute 

```graphql
createRoute(
  pairs: Pair[]! 
  input: Token! 
  output: Token 
): Route!
```

### createTrade 

```graphql
createTrade(
  route: Route! 
  amount: TokenAmount! 
  tradeType: TradeType! 
): Trade!
```

### currencyEquals 

```graphql
currencyEquals(
  currency: Currency! 
  other: Currency! 
): Boolean!
```

### estimateGas 

```graphql
estimateGas(
  parameters: SwapParameters! 
  chainId: ChainId 
): BigInt!
```

### exec 

```graphql
exec(
  trade: Trade! 
  tradeOptions: TradeOptions! 
  txOverrides: TxOverrides 
): Ethereum_TxResponse!
```

### execCall 

```graphql
execCall(
  parameters: SwapParameters! 
  chainId: ChainId! 
  txOverrides: TxOverrides 
): Ethereum_TxResponse!
```

### execCallStatic 

```graphql
execCallStatic(
  parameters: SwapParameters! 
  chainId: ChainId! 
  txOverrides: TxOverrides 
): Ethereum_StaticTxResult!
```

### fetchKLast 

```graphql
fetchKLast(
  token: Token! 
): BigInt!
```

### fetchPairData 

```graphql
fetchPairData(
  token0: Token! 
  token1: Token! 
): Pair!
```

### fetchTokenData 

```graphql
fetchTokenData(
  chainId: ChainId! 
  address: String! 
  symbol: String 
  name: String 
): Token!
```

### fetchTotalSupply 

```graphql
fetchTotalSupply(
  token: Token! 
): TokenAmount!
```

### pairAddress 

```graphql
pairAddress(
  token0: Token! 
  token1: Token! 
): String!
```

### pairInputAmount 

```graphql
pairInputAmount(
  pair: Pair! 
  outputAmount: TokenAmount! 
): TokenAmount!
```

### pairInputNextPair 

```graphql
pairInputNextPair(
  pair: Pair! 
  outputAmount: TokenAmount! 
): Pair!
```

### pairLiquidityMinted 

```graphql
pairLiquidityMinted(
  pair: Pair! 
  totalSupply: TokenAmount! 
  tokenAmount0: TokenAmount! 
  tokenAmount1: TokenAmount! 
): TokenAmount
```

### pairLiquidityToken 

```graphql
pairLiquidityToken(
  pair: Pair! 
): Token!
```

### pairLiquidityValue 

```graphql
pairLiquidityValue(
  pair: Pair! 
  totalSupply: TokenAmount! 
  liquidity: TokenAmount! 
  feeOn: Boolean 
  kLast: BigInt 
): TokenAmount[]!
```

### pairOutputAmount 

```graphql
pairOutputAmount(
  pair: Pair! 
  inputAmount: TokenAmount! 
): TokenAmount!
```

### pairOutputNextPair 

```graphql
pairOutputNextPair(
  pair: Pair! 
  inputAmount: TokenAmount! 
): Pair!
```

### pairReserves 

```graphql
pairReserves(
  pair: Pair! 
): TokenAmount[]!
```

### pairToken0Price 

```graphql
pairToken0Price(
  pair: Pair! 
): String!
```

### pairToken1Price 

```graphql
pairToken1Price(
  pair: Pair! 
): String!
```

### routeMidPrice 

```graphql
routeMidPrice(
  route: Route! 
): String!
```

### routePath 

```graphql
routePath(
  pairs: Pair[]! 
  input: Token! 
): Token[]!
```

### swap 

```graphql
swap(
  tokenIn: Token! 
  tokenOut: Token! 
  amount: BigInt! 
  tradeType: TradeType! 
  tradeOptions: TradeOptions! 
  txOverrides: TxOverrides 
): Ethereum_TxResponse!
```

### swapCallParameters 

```graphql
swapCallParameters(
  trade: Trade! 
  tradeOptions: TradeOptions! 
): SwapParameters!
```

### tokenAmountEquals 

```graphql
tokenAmountEquals(
  tokenAmount0: TokenAmount! 
  tokenAmount1: TokenAmount! 
): Boolean!
```

### tokenEquals 

```graphql
tokenEquals(
  token: Token! 
  other: Token! 
): Boolean!
```

### tokenSortsBefore 

```graphql
tokenSortsBefore(
  token: Token! 
  other: Token! 
): Boolean!
```

### tradeExecutionPrice 

```graphql
tradeExecutionPrice(
  trade: Trade! 
): String!
```

### tradeMaximumAmountIn 

```graphql
tradeMaximumAmountIn(
  trade: Trade! 
  slippageTolerance: String! 
): TokenAmount!
```

### tradeMinimumAmountOut 

```graphql
tradeMinimumAmountOut(
  trade: Trade! 
  slippageTolerance: String! 
): TokenAmount!
```

### tradeNextMidPrice 

```graphql
tradeNextMidPrice(
  trade: Trade! 
): String!
```

### tradeSlippage 

```graphql
tradeSlippage(
  trade: Trade! 
): String!
```

