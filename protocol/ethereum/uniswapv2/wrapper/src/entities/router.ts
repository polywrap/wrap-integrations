import { tradeMaximumAmountIn, tradeMinimumAmountOut } from "./trade";
import {
  ChainId,
  Ethereum_Module,
  getChainIdKey,
  Args_estimateGas,
  Args_swapCallParameters,
  Args_execCallStatic,
  SwapParameters,
  TradeType,
  TxOverrides,
  Ethereum_StaticTxResult,
} from "../wrap";
import { currencyEquals } from "./token";
import { UNISWAP_ROUTER_CONTRACT, getSwapMethodAbi, ETHER } from "../utils";

import { BigInt, Option } from "@polywrap/wasm-as";

const ZERO_HEX = "0x0";

export function toHex(currencyAmount: BigInt): string {
  return "0x" + currencyAmount.toString(16);
}

export function swapCallParameters(
  args: Args_swapCallParameters
): SwapParameters {
  const etherIn = currencyEquals({
    currency: args.trade.inputAmount.token.currency,
    other: ETHER,
  });
  const etherOut = currencyEquals({
    currency: args.trade.outputAmount.token.currency,
    other: ETHER,
  });

  if (etherIn && etherOut) {
    throw new Error("Ether can't be trade input and output");
  }

  if (args.tradeOptions.ttl.isNone && args.tradeOptions.deadline.isNone) {
    throw new Error("Either ttl or deadline have to be defined for trade");
  }

  const to = args.tradeOptions.recipient;
  const amountIn = toHex(
    tradeMaximumAmountIn({
      trade: args.trade,
      slippageTolerance: args.tradeOptions.allowedSlippage,
    }).amount
  );
  const amountOut = toHex(
    tradeMinimumAmountOut({
      trade: args.trade,
      slippageTolerance: args.tradeOptions.allowedSlippage,
    }).amount
  );

  const pathArray = args.trade.route.path.map<string>((token) => token.address);
  const path = '["' + pathArray.join('","') + '"]';
  const deadline = !args.tradeOptions.ttl.isNone
    ? "0x" +
      (
        args.tradeOptions.unixTimestamp + args.tradeOptions.ttl.unwrap()
      ).toString(16)
    : "0x" + (args.tradeOptions.deadline.unwrap() as u32).toString(16);
  const useFeeOnTransfer = args.tradeOptions.feeOnTransfer;

  let methodName: string;
  let input: string[];
  let value: string;

  switch (args.trade.tradeType) {
    case TradeType.EXACT_INPUT:
      if (etherIn) {
        methodName =
          !useFeeOnTransfer.isNone && useFeeOnTransfer.unwrap()
            ? "swapExactETHForTokensSupportingFeeOnTransferTokens"
            : "swapExactETHForTokens";
        // (uint amountOutMin, address[] calldata path, address to, uint deadline)
        input = [amountOut, path, to, deadline];
        value = amountIn;
      } else if (etherOut) {
        methodName =
          !useFeeOnTransfer.isNone && useFeeOnTransfer.unwrap()
            ? "swapExactTokensForETHSupportingFeeOnTransferTokens"
            : "swapExactTokensForETH";
        // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        input = [amountIn, amountOut, path, to, deadline];
        value = ZERO_HEX;
      } else {
        methodName =
          !useFeeOnTransfer.isNone && useFeeOnTransfer.unwrap()
            ? "swapExactTokensForTokensSupportingFeeOnTransferTokens"
            : "swapExactTokensForTokens";
        // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        input = [amountIn, amountOut, path, to, deadline];
        value = ZERO_HEX;
      }
      break;
    case TradeType.EXACT_OUTPUT:
      if (!useFeeOnTransfer.isNone && useFeeOnTransfer.unwrap()) {
        throw new Error("Cannot use fee on transfer with exact out trade");
      }

      if (etherIn) {
        methodName = "swapETHForExactTokens";
        // (uint amountOut, address[] calldata path, address to, uint deadline)
        input = [amountOut, path, to, deadline];
        value = amountIn;
      } else if (etherOut) {
        methodName = "swapTokensForExactETH";
        // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        input = [amountOut, amountIn, path, to, deadline];
        value = ZERO_HEX;
      } else {
        methodName = "swapTokensForExactTokens";
        // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        input = [amountOut, amountIn, path, to, deadline];
        value = ZERO_HEX;
      }
      break;
    default:
      throw new Error("method name not found");
  }

  return {
    methodName: methodName,
    args: input,
    value: value,
  };
}

export function estimateGas(args: Args_estimateGas): BigInt {
  const swapParameters: SwapParameters = args.parameters;
  const chainId: Option<ChainId> = args.chainId;
  return Ethereum_Module.estimateContractCallGas({
    address: UNISWAP_ROUTER_CONTRACT,
    method: getSwapMethodAbi(swapParameters.methodName),
    args: swapParameters.args,
    connection: chainId.isNone
      ? null
      : {
          node: null,
          networkNameOrChainId: getChainIdKey(chainId.unwrap()),
        },
    txOverrides: {
      value: BigInt.fromString(swapParameters.value.substring(2), 16),
      gasPrice: null,
      gasLimit: null,
    },
  }).unwrap();
}

export function execCallStatic(
  args: Args_execCallStatic
): Ethereum_StaticTxResult {
  const swapParameters: SwapParameters = args.parameters;
  const chainId: ChainId = args.chainId;
  const txOverrides: TxOverrides =
    args.txOverrides === null
      ? { gasLimit: null, gasPrice: null }
      : args.txOverrides!;

  return Ethereum_Module.callContractStatic({
    address: UNISWAP_ROUTER_CONTRACT,
    method: getSwapMethodAbi(swapParameters.methodName),
    args: swapParameters.args,
    connection: {
      node: null,
      networkNameOrChainId: getChainIdKey(chainId),
    },
    txOverrides: {
      value: BigInt.fromString(swapParameters.value.substring(2), 16),
      gasPrice: txOverrides.gasPrice,
      gasLimit: txOverrides.gasLimit,
    },
  }).unwrap();
}
