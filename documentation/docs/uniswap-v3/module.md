---
id: module
title: Module
sidebar_position: 1
---

### addCallParameters 

_Returns calldata for minting or adding liquidity to a pool on-chain using an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol. Optionally creates the pool if it doesn't exist._

```graphql
addCallParameters(
  position: Position! # Liquidity position to add to pool
  options: AddLiquidityOptions! # Required transaction configuration
): MethodParameters!
```

### addDelta 

_Returns x + y_

```graphql
addDelta(
  x: BigInt! 
  y: BigInt! 
): BigInt!
```

### approve 

_Call the approve(...) function of an ERC20 token contract on-chain, allowing the Uniswap router contract to transfer tokens_

```graphql
approve(
  token: Token! # Token for which to approve the Uniswap router contract to transfer
  amount: BigInt # The amount to approve for transfer; defaults to maximum amount if null
  gasOptions: GasOptions # Transaction gas configuration
): Ethereum_TxResponse!
```

### bestTradeExactIn 

_Given a list of pools, and a fixed amount in, returns the top 'maxNumResults' trades that go from an input token
amount to an output token, making at most 'maxHops' hops.
Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
the amount in among multiple routes._

```graphql
bestTradeExactIn(
  pools: Pool[]! # The pools to consider in finding the best trade
  amountIn: TokenAmount! # Exact amount of input currency to spend
  tokenOut: Token! # The desired currency out
  options: BestTradeOptions # Options used when determining the best trade
): Trade[]!
```

### bestTradeExactOut 

_similar to bestTradeExactIn(...) but instead targets a fixed output amount
given a list of pools, and a fixed amount out, returns the top 'maxNumResults' trades that go from an input token
to an output token amount, making at most 'maxHops' hops
note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
the amount in among multiple routes._

```graphql
bestTradeExactOut(
  pools: Pool[]! # The pools to consider in finding the best trade
  tokenIn: Token! # The currency to spend
  amountOut: TokenAmount! # The desired currency amount out
  options: BestTradeOptions # Options used when determining the best trade
): Trade[]!
```

### burnAmountsWithSlippage 

_Returns the minimum amounts that should be requested in order to safely burn the amount of liquidity held by the position with the given slippage tolerance_

```graphql
burnAmountsWithSlippage(
  position: Position! # Position for which to calculate burn amounts
  slippageTolerance: String! # Tolerance of unfavorable slippage from the current price
): MintAmounts!
```

### collectCallParameters 

_Returns calldata for collecting liquidity provider rewards using an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
collectCallParameters(
  options: CollectOptions! # Required transaction configuration
): MethodParameters!
```

### collectRewards 

_Returns transaction calldata for calling 'unstakeToken', 'claimReward', and 'stakeToken' in a single transaction on Uniswap's Staker contract.
Note:  A 'tokenId' can be staked in many programs but to claim rewards and continue the program you must unstake, claim, and then restake._

```graphql
collectRewards(
  incentiveKeys: IncentiveKey[]! # An array of IncentiveKeys that 'tokenId' is staked in; claims rewards for each program.
  options: ClaimOptions! # ClaimOptions to specify tokenId, recipient, and amount wanting to collect. Note that you can only specify one amount and one recipient across the various programs if you are collecting from multiple programs at once.
): MethodParameters!
```

### computePoolAddress 

_Computes a pool address_

```graphql
computePoolAddress(
  factoryAddress: String! # The Uniswap V3 factory address
  tokenA: Token! # The first token of the pool, irrespective of sort order
  tokenB: Token! # The second token of the pool, irrespective of sort order
  fee: FeeAmount! # The fee tier of the pool
  initCodeHashManualOverride: String # Override the init code hash used to compute the pool address if necessary
): String!
```

### createCallParameters 

_Returns calldata for creating a pool on-chain using an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
createCallParameters(
  pool: Pool! # An off-chain representation of the pool to create on-chain
): MethodParameters!
```

### createPool 

_Constructs and validates a Pool_

```graphql
createPool(
  tokenA: Token! # The first token of the pool, irrespective of sort order
  tokenB: Token! # The second token of the pool, irrespective of sort order
  fee: FeeAmount! # Fee amount for swaps through the pool
  sqrtRatioX96: BigInt! # Encoded representation of current swap price
  liquidity: BigInt! # The total liquidity available in the pool
  tickCurrent: Int32! # Current pool tick
  ticks: Tick[] # A validated list of all ticks in the pool
): Pool!
```

### createPosition 

_Constructs and validates a liquidity Position for a given Pool with the given liquidity_

```graphql
createPosition(
  pool: Pool! # For which pool the liquidity is assigned
  tickLower: Int32! # The lower tick of the position
  tickUpper: Int32! # The upper tick of the position
  liquidity: BigInt! # The amount of liquidity that is in the position
): Position!
```

### createPositionFromAmount0 

_Computes a position with the maximum amount of liquidity received for a given amount of token0, assuming an unlimited amount of token1_

```graphql
createPositionFromAmount0(
  pool: Pool! # The pool for which the position should be created
  tickLower: Int32! # The lower tick of the position
  tickUpper: Int32! # The upper tick of the position
  amount0: BigInt! # The desired amount of token0
  useFullPrecision: Boolean! # If false, liquidity will be maximized according to what the router can calculate, not what core can theoretically support
): Position!
```

### createPositionFromAmount1 

_Computes a position with the maximum amount of liquidity received for a given amount of token1, assuming an unlimited amount of token0. Always uses full precision._

```graphql
createPositionFromAmount1(
  pool: Pool! # The pool for which the position should be created
  tickLower: Int32! # The lower tick of the position
  tickUpper: Int32! # The upper tick of the position
  amount1: BigInt! # The desired amount of token1
): Position!
```

### createPositionFromAmounts 

_Computes the maximum amount of liquidity received for a given amount of token0, token1, and the prices at the tick boundaries_

```graphql
createPositionFromAmounts(
  pool: Pool! # The pool for which the position should be created
  tickLower: Int32! # The lower tick of the position
  tickUpper: Int32! # The upper tick of the position
  amount0: BigInt! # The amount of the first token of the pool
  amount1: BigInt! # The amount of the second token of the pool
  useFullPrecision: Boolean! # If false, liquidity will be maximized according to what the router can calculate, not what core can theoretically support
): Position!
```

### createRoute 

_Constructs and validates a Route_

```graphql
createRoute(
  pools: Pool[]! # The ordered list of pools from which to construct the route
  inToken: Token! # The input token
  outToken: Token! # The output token
): Route!
```

### createTradeExactIn 

_Constructs an exact in trade with the given amount in and route_

```graphql
createTradeExactIn(
  tradeRoute: TradeRoute! # The route of the exact in trade and the amount being passed in
): Trade!
```

### createTradeExactOut 

_Constructs an exact out trade with the given amount out and route_

```graphql
createTradeExactOut(
  tradeRoute: TradeRoute! # The route of the exact out trade and the amount returned
): Trade!
```

### createTradeFromRoute 

_Constructs a trade by simulating swaps through the given route_

```graphql
createTradeFromRoute(
  tradeRoute: TradeRoute! # The route to swap through and the amount specified, either input or output, depending on the trade type
  tradeType: TradeType! # Whether the trade is an exact input or exact output swap
): Trade!
```

### createTradeFromRoutes 

_Constructs a trade by simulating swaps through the given routes_

```graphql
createTradeFromRoutes(
  tradeRoutes: TradeRoute[]! # The routes to swap through and how much of the amount should be routed through each
  tradeType: TradeType! # Whether the trade is an exact input or exact output swap
): Trade!
```

### createUncheckedTrade 

_Creates a trade without computing the result of swapping through the route. Useful when you have simulated the trade elsewhere and do not have any tick data_

```graphql
createUncheckedTrade(
  swap: TradeSwap! # The route to swap through, the amount being passed in, and the amount returned when the trade is executed
  tradeType: TradeType! # The type of the trade, either exact in or exact out
): Trade!
```

### createUncheckedTradeWithMultipleRoutes 

_Creates a trade without computing the result of swapping through the routes. Useful when you have simulated the trade elsewhere and do not have any tick data_

```graphql
createUncheckedTradeWithMultipleRoutes(
  swaps: TradeSwap[]! # The routes to swap through, the amounts being passed in, and the amounts returned when the trade is executed
  tradeType: TradeType! # The type of the trade, either exact in or exact out
): Trade!
```

### currencyEquals 

_Returns true if the currencies are equivalent, false otherwise_

```graphql
currencyEquals(
  currencyA: Currency! 
  currencyB: Currency! 
): Boolean!
```

### deployPool 

_Deploy a pool contract on-chain_

```graphql
deployPool(
  pool: Pool! # A representation of the pool to deploy
  gasOptions: GasOptions # Transaction gas configuration
): Ethereum_TxResponse!
```

### deployPoolFromTokens 

_Deploy a pool contract on chain for the given tokens and fee amount_

```graphql
deployPoolFromTokens(
  tokenA: Token! # The first token of the pool, irrespective of sort order
  tokenB: Token! # The second token of the pool, irrespective of sort order
  fee: FeeAmount! # The fee tier of the pool
  gasOptions: GasOptions # Transaction gas configuration
): Ethereum_TxResponse!
```

### encodeDeposit 

_Returns an encoded IncentiveKey as a string_

```graphql
encodeDeposit(
  incentiveKeys: IncentiveKey[]! # An array of IncentiveKeys to be encoded and used in the data parameter in 'safeTransferFrom'
): String!
```

### encodeMulticall 

_Encodes multiple calldatas into a single calldata for making multiple calls in one transaction using a contract implementing the necessary interface, such as an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
encodeMulticall(
  calldatas: String[]! 
): String!
```

### encodePermit 

_Encodes arguments and returns transaction calldata to call selfPermit or selfPermitAllowed on an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
encodePermit(
  token: Token! 
  options: PermitOptions! 
): String!
```

### encodeRefundETH 

_Encodes arguments and returns transaction calldata to call refundEth on an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
encodeRefundETH(
): String!
```

### encodeRouteToPath 

_Converts a route to a hex encoded path_

```graphql
encodeRouteToPath(
  route: Route! # The v3 path to convert to an encoded path
  exactOutput: Boolean! # Whether the route should be encoded in reverse, for making exact output swaps
): String!
```

### encodeSqrtRatioX96 

_Returns the sqrt ratio as a Q64.96 corresponding to a given ratio of amount1 and amount0_

```graphql
encodeSqrtRatioX96(
  amount1: BigInt! # The numerator amount i.e., the amount of token1
  amount0: BigInt! # The denominator amount i.e., the amount of token0
): BigInt!
```

### encodeSweepToken 

_Encodes arguments and returns transaction calldata to call sweepToken or sweepTokenWithFee on an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
encodeSweepToken(
  token: Token! 
  amountMinimum: BigInt! 
  recipient: String! 
  feeOptions: FeeOptions 
): String!
```

### encodeUnwrapWETH9 

_Encodes arguments and returns transaction calldata to call unwrapWETH9 or unwrapWETH9WithFee on an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
encodeUnwrapWETH9(
  amountMinimum: BigInt! 
  recipient: String! 
  feeOptions: FeeOptions 
): String!
```

### execCall 

_Send an Ethereum transaction to the given address_

```graphql
execCall(
  parameters: MethodParameters! # Transaction calldata and Ether value
  address: String! # Address of the target Ethereum contract
  chainId: ChainId! # Id of the chain on which to execute the transaction
  gasOptions: GasOptions # Transaction gas configuration
): Ethereum_TxResponse!
```

### execSwap 

_Perform an on-chain swap with one or more trades in a single transaction_

```graphql
execSwap(
  trades: Trade[]! # Trades to encode into calldata
  swapOptions: SwapOptions! # Swap configuration
  gasOptions: GasOptions # Transaction gas configuration
): Ethereum_TxResponse!
```

### FACTORY_ADDRESS 

_The address of Uniswap's pool factory contract_

```graphql
FACTORY_ADDRESS(
): String!
```

### feeAmountToTickSpacing 

_Returns the tick spacing associated with a FeeAmount enum value_

```graphql
feeAmountToTickSpacing(
  feeAmount: FeeAmount! 
): Int32!
```

### fetchPoolFromAddress 

_Returns pool object constructed from the on-chain pool contract at the given address_

```graphql
fetchPoolFromAddress(
  address: String! # The Ethereum address of the pool contract
  chainId: ChainId! # The id of the chain to be queried
  fetchTicks: Boolean! # If true, the full list of pool ticks will be fetched
): Pool!
```

### fetchPoolFromTokens 

_Returns pool object constructed from the on-chain pool contract associated with the tokens and fee amount_

```graphql
fetchPoolFromTokens(
  tokenA: Token! # A token in the pool
  tokenB: Token! # The other token in the pool
  fee: FeeAmount! # The pool's fee amount
  fetchTicks: Boolean! # If true, the full list of pool ticks will be fetched
): Pool!
```

### fetchTickList 

_Returns array of ticks from the on-chain pool contract at the given address_

```graphql
fetchTickList(
  address: String! # The Ethereum address of the pool contract
  chainId: ChainId! # The id of the chain to be queried
): Tick[]!
```

### fetchToken 

_Returns token object constructed from the on-chain token contract at the given address_

```graphql
fetchToken(
  address: String! # The Ethereum address of token's ERC20 contract
  chainId: ChainId! # The id of the chain to be queried
): Token!
```

### getAmount0Delta 

_Used to facilitate liquidity math using sqrtRatioX96 values_

```graphql
getAmount0Delta(
  sqrtRatioAX96: BigInt! 
  sqrtRatioBX96: BigInt! 
  liquidity: BigInt! 
  roundUp: Boolean! 
): BigInt!
```

### getAmount1Delta 

_Used to facilitate liquidity math using sqrtRatioX96 values_

```graphql
getAmount1Delta(
  sqrtRatioAX96: BigInt! 
  sqrtRatioBX96: BigInt! 
  liquidity: BigInt! 
  roundUp: Boolean! 
): BigInt!
```

### getFeeAmount 

_Returns the fee (in one-hundred-thousandths of a percent) associated with a FeeAmount enum value_

```graphql
getFeeAmount(
  feeAmount: FeeAmount! 
): UInt32!
```

### getNative 

_Returns a native token (e.g. Ether) on the specified chain_

```graphql
getNative(
  chainId: ChainId! 
): Token!
```

### getNextSqrtPriceFromInput 

_Used to facilitate liquidity math using sqrtRatioX96 values_

```graphql
getNextSqrtPriceFromInput(
  sqrtPX96: BigInt! 
  liquidity: BigInt! 
  amountIn: BigInt! 
  zeroForOne: Boolean! 
): BigInt!
```

### getNextSqrtPriceFromOutput 

_Used to facilitate liquidity math using sqrtRatioX96 values_

```graphql
getNextSqrtPriceFromOutput(
  sqrtPX96: BigInt! 
  liquidity: BigInt! 
  amountOut: BigInt! 
  zeroForOne: Boolean! 
): BigInt!
```

### getPermitV 

_Returns v value associated with a PermitV enum value_

```graphql
getPermitV(
  permitV: PermitV! 
): Int32!
```

### getPoolAddress 

_Returns the Ethereum address of the Pool contract_

```graphql
getPoolAddress(
  tokenA: Token! # The first token of the pool, irrespective of sort order
  tokenB: Token! # The second token of the pool, irrespective of sort order
  fee: FeeAmount! # The fee tier of the pool
  initCodeHashManualOverride: String # Override the init code hash used to compute the pool address if necessary
): String!
```

### getPoolInputAmount 

_Given a desired output amount of a token, return the computed input amount and a pool with state updated after the trade_

```graphql
getPoolInputAmount(
  pool: Pool! # Pool that involves input and output tokens
  outputAmount: TokenAmount! # The output amount for which to quote the input amount
  sqrtPriceLimitX96: BigInt # The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap.
): PoolChangeResult!
```

### getPoolOutputAmount 

_Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade_

```graphql
getPoolOutputAmount(
  pool: Pool! # Pool that involves input and output tokens
  inputAmount: TokenAmount! # The input amount for which to quote the output amount
  sqrtPriceLimitX96: BigInt # The Q64.96 sqrt price limit
): PoolChangeResult!
```

### getPoolTickSpacing 

_Returns the tick spacing of ticks in the pool_

```graphql
getPoolTickSpacing(
  pool: Pool! 
): Int32!
```

### getSqrtRatioAtTick 

_Returns the sqrt ratio as a Q64.96 for the given tick. The sqrt ratio is computed as sqrt(1.0001)^tick_

```graphql
getSqrtRatioAtTick(
  tick: Int32! # The tick for which to compute the sqrt ratio
): BigInt!
```

### getTick 

_Returns the tick at the requested index_

```graphql
getTick(
  tickDataProvider: Tick[]! # A list of ticks to search
  tickIndex: Int32! # The tick index of the requested tick
): Tick!
```

### getTickAtSqrtRatio 

_Returns the tick corresponding to a given sqrt ratio, such that getSqrtRatioAtTick(tick) <= sqrtRatioX96 and getSqrtRatioAtTick(tick + 1) > sqrtRatioX96_

```graphql
getTickAtSqrtRatio(
  sqrtRatioX96: BigInt! # The sqrt ratio as a Q64.96 for which to compute the tick
): Int32!
```

### getWETH 

_Returns a Wrapped Ether token on the specified chain_

```graphql
getWETH(
  chainId: ChainId! 
): Token!
```

### isNative 

_Returns true if the token is native (e.g. Ether), false otherwise. A token representing Ether must have an empty string in its address field._

```graphql
isNative(
  token: Token! 
): Boolean!
```

### MAX_SQRT_RATIO 

_Largest valid sqrtRatioX96 in a pool_

```graphql
MAX_SQRT_RATIO(
): BigInt!
```

### MAX_TICK 

_Largest valid tick index in a pool_

```graphql
MAX_TICK(
): Int32!
```

### maxLiquidityForAmounts 

_Computes the maximum amount of liquidity received for a given amount of token0, token1, and the prices at the tick boundaries._

```graphql
maxLiquidityForAmounts(
  sqrtRatioCurrentX96: BigInt! # Encoded representation of the current price
  sqrtRatioAX96: BigInt! # Encoded representation of the price at lower tick boundary
  sqrtRatioBX96: BigInt! # Encoded representation of the price at upper tick boundary
  amount0: BigInt! # Amount for the first token of the pool
  amount1: BigInt! # Amount for the second token of the pool
  useFullPrecision: Boolean! # If false, liquidity will be maximized according to what the router can calculate, not what core can theoretically support
): BigInt!
```

### MIN_SQRT_RATIO 

_Smallest valid sqrtRatioX96 in a pool_

```graphql
MIN_SQRT_RATIO(
): BigInt!
```

### MIN_TICK 

_Smallest valid tick index in a pool_

```graphql
MIN_TICK(
): Int32!
```

### mintAmounts 

_Returns the minimum amounts that must be sent in order to mint the amount of liquidity held by the position at the current price for the pool_

```graphql
mintAmounts(
  pool: Pool! # For which pool the liquidity is assigned
  tickLower: Int32! # The lower tick of the position
  tickUpper: Int32! # The upper tick of the position
  liquidity: BigInt! # The amount of liquidity that is in the position
): MintAmounts!
```

### mintAmountsWithSlippage 

_Returns the minimum amounts that must be sent in order to safely mint the amount of liquidity held by the position with the given slippage tolerance_

```graphql
mintAmountsWithSlippage(
  position: Position! # Position for which to calculate mint amounts
  slippageTolerance: String! # Tolerance of unfavorable slippage from the current price
): MintAmounts!
```

### mostSignificantBit 

_Returns the most significant bit of a positive integer, starting with first bit = 0_

```graphql
mostSignificantBit(
  x: BigInt! 
): UInt32!
```

### mulDivRoundingUp 

_Returns (a * b) / denominator_

```graphql
mulDivRoundingUp(
  a: BigInt! 
  b: BigInt! 
  denominator: BigInt! 
): BigInt!
```

### nearestUsableTick 

_Returns the closest tick that is nearest a given tick and usable for the given tick spacing_

```graphql
nearestUsableTick(
  tick: Int32! # The target tick
  tickSpacing: Int32! # The spacing of the pool
): Int32!
```

### nextInitializedTick 

_Returns next initialized tick following the input tick_

```graphql
nextInitializedTick(
  ticks: Tick[]! # Tick list to check
  tick: Int32! # Input tick index
  lte: Boolean! # If true, searches list for next initialized tick that has index less than or equal to the input tick index
): Tick!
```

### nextInitializedTickWithinOneWord 

_Returns next initialized tick, or max or min tick. Returns true if a tick is found at index._

```graphql
nextInitializedTickWithinOneWord(
  tickDataProvider: Tick[]! # Tick list to search
  tick: Int32! # Current tick index
  lte: Boolean! # True of returned tick index should be less than or equal to current tick index
  tickSpacing: Int32! # Tick spacing of tick list
): NextTickResult!
```

### POOL_INIT_CODE_HASH 

_Pool creation byte code hash used for computing pool address_

```graphql
POOL_INIT_CODE_HASH(
): String!
```

### poolChainId 

_Returns the chain ID of the tokens in the pool_

```graphql
poolChainId(
  pool: Pool! 
): ChainId!
```

### poolInvolvesToken 

_Returns true if the token is in the Pool (i.e. pool.token0 or pool.token1)_

```graphql
poolInvolvesToken(
  pool: Pool! 
  token: Token! 
): Boolean!
```

### poolPriceOf 

_Returns the price of the given token in terms of the other token in the pool_

```graphql
poolPriceOf(
  pool: Pool! # Pool that involves the token
  token: Token! # The token to return the price of
): Price!
```

### poolToken0Price 

_Returns the current mid price of the pool in terms of token0, i.e. the ratio of token1 over token0_

```graphql
poolToken0Price(
  token0: Token! # The first token of the pool, i.e. pool.token0
  token1: Token! # The second token of the pool, i.e. pool.token1
  sqrtRatioX96: BigInt! # Encoded representation of the current price in the pool, i.e. pool.sqrtRatioX96
): Price!
```

### poolToken1Price 

_Returns the current mid price of the pool in terms of token1, i.e. the ratio of token0 over token1_

```graphql
poolToken1Price(
  token0: Token! # The first token of the pool, i.e. pool.token0
  token1: Token! # The second token of the pool, i.e. pool.token1
  sqrtRatioX96: BigInt! # Encoded representation of the current price in the pool, i.e. pool.sqrtRatioX96
): Price!
```

### positionAmount0 

_Returns the amount of token0 that this position's liquidity could be burned for at the current pool price_

```graphql
positionAmount0(
  pool: Pool! # For which pool the liquidity is assigned
  tickLower: Int32! # The lower tick of the position
  tickUpper: Int32! # The upper tick of the position
  liquidity: BigInt! # The amount of liquidity that is in the position
): TokenAmount!
```

### positionAmount1 

_Returns the amount of token1 that this position's liquidity could be burned for at the current pool price_

```graphql
positionAmount1(
  pool: Pool! # For which pool the liquidity is assigned
  tickLower: Int32! # The lower tick of the position
  tickUpper: Int32! # The upper tick of the position
  liquidity: BigInt! # The amount of liquidity that is in the position
): TokenAmount!
```

### positionToken0PriceLower 

_Returns the price of token0 at the lower tick_

```graphql
positionToken0PriceLower(
  pool: Pool! # The pool for which the liquidity is assigned
  tickLower: Int32! # The lower tick of the position
): Price!
```

### positionToken0PriceUpper 

_Returns the price of token0 at the upper tick_

```graphql
positionToken0PriceUpper(
  pool: Pool! # The pool for which the liquidity is assigned
  tickUpper: Int32! # The upper tick of the position
): Price!
```

### priceToClosestTick 

_Returns the first tick for which the given price is greater than or equal to the tick price._

```graphql
priceToClosestTick(
  price: Price! # Price for which to return the closest tick that represents a price less than or equal to the input price, i.e. the price of the returned tick is less than or equal to the input price.
Note that a string price is not used as input here, so the 'price' property of the Price type can have any value without affecting the results.
): Int32!
```

### quoteCallParameters 

_Produces the on-chain method name of the appropriate function within QuoterV2, and the relevant hex encoded parameters._

```graphql
quoteCallParameters(
  route: Route! # The swap route, a list of pools through which a swap can occur
  amount: TokenAmount! # The amount of the quote, either an amount in, or an amount out
  tradeType: TradeType! # The trade type, either exact input or exact output
  options: QuoteOptions # Optional configuration
): MethodParameters!
```

### removeCallParameters 

_Returns calldata for completely or partially exiting a liquidity position using an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
removeCallParameters(
  position: Position! # The position to exit
  options: RemoveLiquidityOptions! # Additional information necessary for generating the calldata
): MethodParameters!
```

### routeChainId 

_Returns the chain id of the tokens in the route_

```graphql
routeChainId(
  route: Route! 
): ChainId!
```

### routeMidPrice 

_Returns the mid price of the route_

```graphql
routeMidPrice(
  pools: Pool[]! # The ordered list of pools from which to calculate the mid price
  inToken: Token! # The input token
  outToken: Token! # The output token
): Price!
```

### safeTransferFromParameters 

_Returns calldata for safely transferring an NFT using an instance of Uniswap's NonfungiblePositionManager contract: https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol_

```graphql
safeTransferFromParameters(
  options: SafeTransferOptions! # Required transaction configuration
): MethodParameters!
```

### swap 

_Perform an on-chain swap within a single pool by using token and fee amount information to find the correct pool_

```graphql
swap(
  inToken: Token! # Input token of the pool
  outToken: Token! # Output token of the pool
  fee: FeeAmount! # Fee amount of the pool being used for the swap
  amount: BigInt! # Amount being swapped in or out, depending on trade type
  tradeType: TradeType! # Type of trade, either exact input or exact output
  swapOptions: SwapOptions! # Swap configuration
  gasOptions: GasOptions # Transaction gas configuration
): Ethereum_TxResponse!
```

### swapCallParameters 

_Encodes arguments and returns transaction calldata to make a swap on an Uniswap's V3 Router contract_

```graphql
swapCallParameters(
  trades: Trade[]! # Trades for which to produce call parameters
  options: SwapOptions! # Configuration options for the swap call
): MethodParameters!
```

### swapWithPool 

_Perform an on-chain swap using a single pool at provided address; requires ERC20-compliant input and output (i.e. no Ether)_

```graphql
swapWithPool(
  address: String! # Ethereum address of the pool used for the swap
  amount: TokenAmount! # Token amount being swapped in or out, depending on trade type
  tradeType: TradeType! # Type of trade, either exact input or exact output
  swapOptions: SwapOptions! # Swap configuration
  gasOptions: GasOptions # Transaction gas configuration
): Ethereum_TxResponse!
```

### tickIsAtOrAboveLargest 

_Returns true if the tick index is greater than or equal to all tick indices in the list_

```graphql
tickIsAtOrAboveLargest(
  ticks: Tick[]! # Tick list to check
  tick: Int32! # Input tick index
): Boolean!
```

### tickIsBelowSmallest 

_Returns true if the tick index is smaller than all tick indices in the list_

```graphql
tickIsBelowSmallest(
  ticks: Tick[]! # Tick list to check
  tick: Int32! # Input tick index
): Boolean!
```

### tickListIsSorted 

_Returns true if a tick list is sorted by tick index_

```graphql
tickListIsSorted(
  ticks: Tick[]! # The tick list
): Boolean!
```

### tickToPrice 

_Returns a price object corresponding to the input tick and the base/quote token. Inputs must be tokens because the address order is used to interpret the price represented by the tick._

```graphql
tickToPrice(
  baseToken: Token! # The base token of the price
  quoteToken: Token! # The quote token of the price
  tick: Int32! # The tick for which to return the price
): Price!
```

### toHex 

_Converts a big int to a hex string_

```graphql
toHex(
  value: BigInt! 
): String!
```

### tokenAmountEquals 

_Returns true if the token amounts are equivalent, false otherwise_

```graphql
tokenAmountEquals(
  tokenAmountA: TokenAmount! 
  tokenAmountB: TokenAmount! 
): Boolean!
```

### tokenEquals 

_Returns true if the tokens are equivalent, false otherwise_

```graphql
tokenEquals(
  tokenA: Token! 
  tokenB: Token! 
): Boolean!
```

### tokenSortsBefore 

_Returns true if the address of tokenA would precede the address of token B when sorted alphabetically_

```graphql
tokenSortsBefore(
  tokenA: Token! 
  tokenB: Token! 
): Boolean!
```

### tradeExecutionPrice 

_The price expressed in terms of output amount/input amount_

```graphql
tradeExecutionPrice(
  inputAmount: TokenAmount! # The trade input amount, e.g. from Trade object or tradeInputAmount(...)
  outputAmount: TokenAmount! # The trade output amount, e.g. from Trade object or tradeOutputAmount(...)
): Price!
```

### tradeInputAmount 

_The input amount for the trade assuming no slippage_

```graphql
tradeInputAmount(
  swaps: TradeSwap[]! # The routes to swap through, the amounts being passed in, and the amounts returned when the trade is executed
): TokenAmount!
```

### tradeMaximumAmountIn 

_Get the maximum amount in that can be spent via the trade for the given slippage tolerance_

```graphql
tradeMaximumAmountIn(
  slippageTolerance: String! # The tolerance of unfavorable slippage from the execution price of this trade; a decimal number between 0 and 1 (e.g. '0.03') that represents a percentage
  amountIn: TokenAmount! # The input amount of the trade, before slippage, e.g. from Trade object or tradeInputAmount(...)
  tradeType: TradeType! # The type of the trade, either exact in or exact out
): TokenAmount!
```

### tradeMinimumAmountOut 

_Get the minimum amount that must be received from the trade for the given slippage tolerance_

```graphql
tradeMinimumAmountOut(
  slippageTolerance: String! # The tolerance of unfavorable slippage from the execution price of this trade; a decimal number between 0 and 1 (e.g. '0.03') that represents a percentage
  amountOut: TokenAmount! # The output amount of the trade, before slippage, e.g. from Trade object or tradeOutputAmount(...)
  tradeType: TradeType! # The type of the trade, either exact in or exact out
): TokenAmount!
```

### tradeOutputAmount 

_The output amount for the trade assuming no slippage_

```graphql
tradeOutputAmount(
  swaps: TradeSwap[]! # The routes to swap through, the amounts being passed in, and the amounts returned when the trade is executed
): TokenAmount!
```

### tradePriceImpact 

_Returns the percent difference between the route's mid price and the price impact_

```graphql
tradePriceImpact(
  swaps: TradeSwap[]! # The routes to swap through, the amounts being passed in, and the amounts returned when the trade is executed
  outputAmount: TokenAmount! # The trade output amount, e.g. from Trade object or tradeOutputAmount(...)
): Fraction!
```

### tradeWorstExecutionPrice 

_Return the execution price after accounting for slippage tolerance_

```graphql
tradeWorstExecutionPrice(
  trade: Trade! # Trade for which to calculate execution price
  slippageTolerance: String! # The allowed tolerated slippage
): Price!
```

### validateTickList 

_Validates a tick list, returning true of the tick list is valid. Throws an exception if the tick list is not valid._

```graphql
validateTickList(
  ticks: Tick[]! # A list of ticks to validate
  tickSpacing: Int32! # The tick spacing of the list
): Boolean!
```

### withdrawToken 

_Returns transaction calldata for unstaking, claiming, and withdrawing in a single transaction on Uniswap's Staker contract._

```graphql
withdrawToken(
  incentiveKeys: IncentiveKey[]! # A list of incentiveKeys to unstake from. Should include all incentiveKeys (unique staking programs) that 'options.tokenId' is staked in.
  options: FullWithdrawOptions! # Options for producing claim calldata and withdraw calldata. Can't withdraw without unstaking all programs for 'tokenId'.
): MethodParameters!
```

### wrapAmount 

_If the input token amount represents an amount of Ether, the return value represents the same amount in Wrapped Ether; otherwise, the return value is the same as the input value._

```graphql
wrapAmount(
  amount: TokenAmount! 
): TokenAmount!
```

### wrapToken 

_If the input token is Ether, the return value is Wrapped Ether; otherwise, the return value is the same as the input value._

```graphql
wrapToken(
  token: Token! 
): Token!
```

