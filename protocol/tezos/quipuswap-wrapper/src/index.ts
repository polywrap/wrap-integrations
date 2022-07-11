import {
  Tezos_TransferParams,
  Args_addOperator,
  Args_removeOperator,
  Args_swapDirect,
  Args_swapMultiHop,
  Args_invest,
  Args_divest,
  Args_transfer,
  Args_transferFrom,
  Tezos_Module,
  Args_listTokenPairs,
  Args_getTokenSupply,
  Args_getLPTokenBalance,
  Args_getTokenPair,
  GetTokenSupplyResponse
} from "./wrap"
import { swap, getInvestAddAndRemoveOperations, generateTransferArg } from "./utils";

import { getString, getConnection, parseTokenType } from "./utils";

import { JSON } from "@polywrap/wasm-as"; 
import { FA2 } from "./FA2";
import { Address } from "./address";

export function getTokenPair(input: Args_getTokenPair): JSON.Obj {
  const connection = getConnection(input.network, input.custom);
  return getPair(input.pairId, connection);
}

export function listTokenPairs(input: Args_listTokenPairs): JSON.Arr {
  const connection = getConnection(input.network, input.custom);
  const pairsCount = Tezos_Module.getContractStorage({
    address: connection.contractAddress,
    connection: connection.connection,
    key: "storage",
    field: "pairs_count"
  }).unwrap();
  const tokenPairs = JSON.Value.Array();
  for (let i = 0; i < parseInt(pairsCount); i++) {
    const tokenPair = getPair(i.toString(), connection);
    tokenPairs.push(tokenPair);
  }
  return tokenPairs;
}

export function getTokenSupply(input: Args_getTokenSupply): GetTokenSupplyResponse{
  const connection = getConnection(input.network, input.custom);
  const storage = Tezos_Module.getContractStorage({
    address: connection.contractAddress,
    connection: connection.connection,
    key: "storage.pairs",
    field: input.pairId
  }).unwrap();
  const assetData = <JSON.Obj>JSON.parse(storage);
  return {
    token_a_pool: getString(assetData, "token_a_pool"),
    token_b_pool: getString(assetData, "token_b_pool"),
    total_supply: getString(assetData, "total_supply")
  };
}


export function getLPTokenBalance(input: Args_getLPTokenBalance): string {
  const connection = getConnection(input.network, input.custom);
  return Tezos_Module.getContractStorage({
    address: connection.contractAddress,
    connection: connection.connection,
    key: 'storage.ledger.["' + input.owner + '",' + input.pairId + '].balance',
    field: ""
  }).unwrap();
}

export function getPair(pairId: string, connection: Address): JSON.Obj {
  const token = Tezos_Module.getContractStorage({
    address: connection.contractAddress,
    connection: connection.connection,
    key: `storage.tokens`,
    field: pairId
  }).unwrap();
  if (token == "") {
    throw new Error(`invalid pair id "${pairId}"`);
  }
  const parsedToken = <JSON.Obj>JSON.parse(token);
  const parsedTokenA = parseTokenType(parsedToken, "token_a_type");
  const parsedTokenB = parseTokenType(parsedToken, "token_b_type");
  const tokenObj = JSON.Value.Object();
  tokenObj.set("pair_id", pairId);
  tokenObj.set("token_a", parsedTokenA);
  tokenObj.set("token_b", parsedTokenB);
  return tokenObj;
}

export function addOperator(input: Args_addOperator): Tezos_TransferParams {
  const address = getConnection(input.network, input.custom);
  const fa2Token = new FA2(input.params.tokenId, input.contractAddress!)
  const owner = Tezos_Module.getWalletPKH({
    connection: address.connection,
  }).unwrap();
  return fa2Token.generateAddOperation(address.connection, owner, input.params.operator);
}

export function removeOperator(input: Args_removeOperator): Tezos_TransferParams {
  const address = getConnection(input.network, input.custom);
  const fa2Token = new FA2(input.params.tokenId, input.contractAddress!)
  const owner = Tezos_Module.getWalletPKH({
    connection: address.connection,
  }).unwrap();
  return fa2Token.generateRemoveOperation(address.connection, owner, input.params.operator);
}

export function swapDirect(input: Args_swapDirect): Tezos_TransferParams[] {
  const address = getConnection(input.network, input.custom);
  const owner = Tezos_Module.getWalletPKH({
    connection: address.connection,
  }).unwrap();
  return swap(address, owner, [{ pairId: input.params.pairId, direction: input.params.direction }], input.params.swapParams, input.sendParams);
}

export function swapMultiHop(input: Args_swapMultiHop): Tezos_TransferParams[] {
  const address = getConnection(input.network, input.custom);
  const owner = Tezos_Module.getWalletPKH({
    connection: address.connection,
  }).unwrap();
  return swap(address, owner, input.params.hops, input.params.swapParams, input.sendParams);
}

export function invest(input: Args_invest): Tezos_TransferParams[] {
  const address = getConnection(input.network,  input.custom);
  const owner = Tezos_Module.getWalletPKH({
    connection: address.connection,
  }).unwrap();
  const addAndRemoveOperations = getInvestAddAndRemoveOperations(address, owner, input.params);
  const investQueryOperation = Tezos_Module.getContractCallTransferParams({
    address: address.contractAddress,
    method: "invest",
    args: `[${input.params.pairId}, ${input.params.shares}, ${input.params.tokenAIn}, ${input.params.tokenBIn}, "${input.params.deadline}"]`,
    params: input.sendParams,
    connection: address.connection
  }).unwrap();
  const operations = addAndRemoveOperations.addOperations;
  operations.push(investQueryOperation);
  return operations.concat(addAndRemoveOperations.removeOperations);
}

export function divest(input: Args_divest): Tezos_TransferParams {
  const address = getConnection(input.network,  input.custom);
  return Tezos_Module.getContractCallTransferParams({
    address: address.contractAddress,
    method: "divest",
    args: `[${input.params.pairId}, ${input.params.minTokenAOut}, ${input.params.minTokenBOut}, ${input.params.shares}, "${input.params.deadline}"]`,
    params: input.sendParams,
    connection: address.connection
  }).unwrap();
}

export function transfer(input: Args_transfer): Tezos_TransferParams {
  const address = getConnection(input.network,  input.custom);
  const owner = Tezos_Module.getWalletPKH({
    connection: address.connection,
  }).unwrap();
  return Tezos_Module.getContractCallTransferParams({
    address: address.contractAddress,
    method: "transfer",
    args: generateTransferArg(owner, input.params.to, input.params.tokenId, input.params.amount),
    params: input.sendParams,
    connection: address.connection
  }).unwrap();
}

export function transferFrom(input: Args_transferFrom): Tezos_TransferParams {
  const address = getConnection(input.network,  input.custom);
  return Tezos_Module.getContractCallTransferParams({
    address: address.contractAddress,
    method: "transfer",
    args: generateTransferArg(input.m_from, input.params.to, input.params.tokenId, input.params.amount),
    params: input.sendParams,
    connection: address.connection
  }).unwrap();
}
