import {
  Tezos_TransferParams,
  Tezos_SendParams,
  SwapPair,
  SwapParams,
  getSwapDirectionKey,
  InvestParams,
  SwapDirection,
  Tezos_Module,
  CustomConnection,
  Network,
  Tezos_Connection
} from "./wrap"
import { getPair } from ".";

import { BigInt, JSON } from "@polywrap/wasm-as";
import { Address } from "./address";
import { FA12 } from "./FA12";
import { FA2 } from "./FA2";

export function generateTransferArg(from: string, to: string, tokenId: u32, amount: BigInt): string {
  return `[[{
    "from_": "${from}",
    "txs": [{
      "to_": "${to}",
      "token_id": ${tokenId},
      "amount": ${amount}
    }]  
  }]]`
}

export function swap(address: Address, owner: string, swapPairs: SwapPair[], swapParams: SwapParams, sendParams: Tezos_SendParams | null): Tezos_TransferParams[] {
  let addOperations: Tezos_TransferParams[] = [];
  let removeOperations: Tezos_TransferParams[] = [];
  for (let i = 0; i < swapPairs.length; i++) {
    const addAndRemoveOperations = getSwapAddAndRemoveOperations(address, owner, swapPairs[i], swapParams);
    if (!addAndRemoveOperations.addOperation) {
      throw new Error(`Add operation for pairId '${swapPairs[i].pairId}' could not be generated.`)
    }
    addOperations.push(addAndRemoveOperations.addOperation);
    if (!addAndRemoveOperations.removeOperation) {
      throw new Error(`Remove operation for pairId '${swapPairs[i].pairId}' could not be generated.`)
    }
    removeOperations.push(
      addAndRemoveOperations.removeOperation
    );
  }
  const swapOperations = generateSwapTransferParams(swapPairs,swapParams, address, sendParams);
  addOperations.push(swapOperations);
  return addOperations.concat(removeOperations);
}

export function getSwapAddAndRemoveOperations(address: Address, owner: string, pair: SwapPair,  params: SwapParams): GetAddAndRemoveOperationResult {
  const tokenPair = getPair(pair.pairId.toString(), address);
  let token = tokenPair.get("token_a");
  if (pair.direction === SwapDirection.b_to_a) {
    token = tokenPair.get("token_b");
  }
  return getAddAndRemoveOperation(address, token!, owner, params.amountIn);
}


export function getInvestAddAndRemoveOperations(address: Address, owner: string, params: InvestParams): GetOperations {
  let addOperations: Tezos_TransferParams[] = [];
  let removeOperations: Tezos_TransferParams[] = [];
  const tokenPair = getPair(params.pairId.toString(), address);

  const tokenA = tokenPair.get("token_a");
  const tokenAAddAndRemoveOperation = getAddAndRemoveOperation(address, tokenA!, owner, params.tokenAIn);
  addOperations.push(tokenAAddAndRemoveOperation.addOperation);
  removeOperations.push(tokenAAddAndRemoveOperation.removeOperation);

  const tokenB = tokenPair.get("token_b");
  const tokenBAddAndRemoveOperation = getAddAndRemoveOperation(address, tokenB!, owner, params.tokenBIn);
  addOperations.push(tokenBAddAndRemoveOperation.addOperation);
  removeOperations.push(tokenBAddAndRemoveOperation.removeOperation);

  return {
    addOperations,
    removeOperations
  };
}

function generateSwapArg(hops: SwapPair[], swapParams: SwapParams): string {
  let arg = '[';
  let stringifiedHops = '[';
  for (let i = 0; i < hops.length; i++) {
    let hop = '{';
    hop +=  '"pair_id":' + hops[i].pairId.toString() + ',';
    hop += '"operation": {' 
    hop += '"' + getSwapDirectionKey(hops[i].direction) + '"' + ': {} } }'
    stringifiedHops += hop
    if (i != hops.length - 1) {
      stringifiedHops += ',';
    }
  }
  arg += stringifiedHops + '],';
  arg += swapParams.amountIn.toString() + ','
  arg += swapParams.minAmountOut.toString() + ','
  arg += '"' + swapParams.receiver + '"' + ','
  arg += '"' + swapParams.deadline + '"'
  arg += ']';
  return arg;
}

function generateSwapTransferParams(hops: SwapPair[], swapParams: SwapParams, address: Address, sendParams: Tezos_SendParams | null): Tezos_TransferParams {
  return Tezos_Module.getContractCallTransferParams({
    address: address.contractAddress,
    method: "swap",
    args: generateSwapArg(hops, swapParams),
    params: sendParams,
    connection: address.connection
  }).unwrap()
}

function getAddAndRemoveOperation(address: Address, token: JSON.Value, owner: string, amount: BigInt): GetAddAndRemoveOperationResult {
  let addOperation: Tezos_TransferParams;
  let removeOperation: Tezos_TransferParams;
  if (token === null || token.isNull) {
    // note this shouldn't happen
    throw new Error("token should not be null");
  }
  if (token.isObj && (<JSON.Obj>token).has("fa12")) {
    const tokenFa12 = FA12.parse((<JSON.Obj>token).get("fa12")!);
    addOperation = tokenFa12.generateAddOperation(address.connection, address.contractAddress, amount);
    removeOperation = tokenFa12.generateRemoveOperation(address.connection, address.contractAddress);
  } else if (token.isObj && (<JSON.Obj>token).has("fa2")) {
    const tokenFa2 = FA2.parse((<JSON.Obj>token).get("fa2")!);
    addOperation = tokenFa2.generateAddOperation(address.connection, owner, address.contractAddress);
    removeOperation = tokenFa2.generateRemoveOperation(
      address.connection, owner, address.contractAddress
    );
  } else {
    throw new Error(`Token interface is not supported. Only FA2 and FA12 are supported. Token: '${token.stringify()}'`)
  }
  return {
    addOperation,
    removeOperation
  }
}

class GetOperations {
  addOperations: Tezos_TransferParams[]
  removeOperations: Tezos_TransferParams[]
}

class GetAddAndRemoveOperationResult {
  addOperation: Tezos_TransferParams
  removeOperation: Tezos_TransferParams
}

export function getString(object: JSON.Obj, key: string): string {
  let value = ""
  const initValue = <JSON.Str>object.getString(key);
  if (initValue != null) {
    value = initValue.valueOf();
  }
  return value;
}

export function parseTokenType(token: JSON.Obj, field: string): JSON.Obj {
  const parsedToken = <JSON.Obj>JSON.parse(getString(token, field));
  if (parsedToken.has('fa2')) {
    const fa2 = <JSON.Obj>JSON.parse(getString(parsedToken, "fa2"))
    parsedToken.set("fa2", fa2);
  }
  return parsedToken;
}

export function getConnection(network: Network, custom: CustomConnection | null): Address {
  if (network == Network.custom && custom == null) {
    throw new Error(`custom network should have a valid connection and contract address.`)
  }
  if (network == Network.custom) {
    return new Address(<Tezos_Connection>custom!.connection, custom!.contractAddress);
  }
  return Address.getAddress(network);
}