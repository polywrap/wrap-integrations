import {
  Tezos_TransferParams,
  Input_addOperator,
  Input_removeOperator,
  Input_swapDirect,
  Input_swapMultiHop,
  Input_invest,
  Input_divest,
  Input_transfer,
  Input_transferFrom,
  Tezos_SendParams,
  SwapPair,
  SwapParams,
  getSwapDirectionKey
} from "./w3"
import { Address, getConnection } from "../common";
import { Tezos_Query } from "../query/w3"

import { BigInt } from "@web3api/wasm-as"

export function addOperator(input: Input_addOperator): Tezos_TransferParams {
  const address = getConnection(input.network, input.custom);
  return Tezos_Query.getContractCallTransferParams({
    address: input.contractAddress ? input.contractAddress! : address.contractAddress,
    method: "update_operators",
    args: generateOperatorArg('add_operator', input.params.owner, input.params.operator, input.params.tokenId),
    params: input.sendParams,
    connection: address.connection
  })
}

export function removeOperator(input: Input_removeOperator): Tezos_TransferParams {
  const address = getConnection(input.network, input.custom);
  return Tezos_Query.getContractCallTransferParams({
    address: input.contractAddress ? input.contractAddress! : address.contractAddress,
    method: "update_operators",
    args: generateOperatorArg('remove_operator', input.params.owner, input.params.operator, input.params.tokenId),
    params: input.sendParams,
    connection: address.connection
  })
}

export function swapDirect(input: Input_swapDirect): Tezos_TransferParams {
  const address = getConnection(input.network, input.custom);
  return swap([{ pairId: input.params.pairId, direction: input.params.direction }], input.params.swapParams, address, input.sendParams);
}

export function swapMultiHop(input: Input_swapMultiHop): Tezos_TransferParams {
  const address = getConnection(input.network, input.custom);
  return swap(input.params.hops, input.params.swapParams, address, input.sendParams);
}

export function invest(input: Input_invest): Tezos_TransferParams {
  const address = getConnection(input.network,  input.custom);
  return Tezos_Query.getContractCallTransferParams({
    address: address.contractAddress,
    method: "invest",
    args: `[${input.params.pairId}, ${input.params.shares}, ${input.params.tokenAIn}, ${input.params.tokenBIn}, "${input.params.deadline}"]`,
    params: input.sendParams,
    connection: address.connection
  })
}

export function divest(input: Input_divest): Tezos_TransferParams {
  const address = getConnection(input.network,  input.custom);
  return Tezos_Query.getContractCallTransferParams({
    address: address.contractAddress,
    method: "divest",
    args: `[${input.params.pairId}, ${input.params.minTokenAOut}, ${input.params.minTokenBOut}, ${input.params.shares}, "${input.params.deadline}"]`,
    params: input.sendParams,
    connection: address.connection
  })
}

export function transfer(input: Input_transfer): Tezos_TransferParams {
  const address = getConnection(input.network,  input.custom);
  return Tezos_Query.getContractCallTransferParams({
    address: address.contractAddress,
    method: "transfer",
    args: generateTransferArg(address.contractAddress, input.params.to, input.params.tokenId, input.params.amount),
    params: input.sendParams,
    connection: address.connection
  });
}

export function transferFrom(input: Input_transferFrom): Tezos_TransferParams {
  const address = getConnection(input.network,  input.custom);
  return Tezos_Query.getContractCallTransferParams({
    address: address.contractAddress,
    method: "transfer",
    args: generateTransferArg(input.m_from, input.params.to, input.params.tokenId, input.params.amount),
    params: input.sendParams,
    connection: address.connection
  });
}

function swap(hops: SwapPair[], swapParams: SwapParams, address: Address, sendParams: Tezos_SendParams | null): Tezos_TransferParams {
  return Tezos_Query.getContractCallTransferParams({
    address: address.contractAddress,
    method: "swap",
    args: generateSwapArg(hops, swapParams),
    params: sendParams,
    connection: address.connection
  })
}

function generateOperatorArg(operation: string, owner: string, operator: string, tokenId: u32): string {
  return '[[{ "'+  operation +'": {"owner": "'+ owner +'","operator":"'+ operator +'", "token_id":'+ tokenId.toString() +' }}]]';
}

function generateTransferArg(from: string, to: string, tokenId: u32, amount: BigInt): string {
  return `[[{
    "from_": "${from}",
    "txs": [{
      "to_": "${to}",
      "token_id": ${tokenId},
      "amount": ${amount}
    }]  
  }]]`
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