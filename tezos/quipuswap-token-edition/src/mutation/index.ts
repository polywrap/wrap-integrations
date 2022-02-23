import {
  Input_addOperator, 
  Tezos_Mutation,
  TezosDomainsPlugin_Query,
} from "./w3"
import { getConnection, getSendParams } from "../common/utils";


export function addOperator(input: Input_addOperator): string {
  const label = TezosDomainsPlugin_Query.char2Bytes({
    text: input.params.label
  });
  const address = getConnection(input.network, "AddOperator", input.custom);
  const hash = Tezos_Mutation.walletContractCallMethod({
    address: address.contractAddress,
    method: "addOperator",
    args: '["' + 
      label + '", "' + 
      input.params.duration.toString() + '", "' +  
      input.params.owner + '", "' + 
      input.params.address + '", ' +
      input.params.data + ', "' + 
      input.params.nonce.toString() + 
    '"]',
    params: getSendParams(input.sendParams, address.contractAddress),
    connection: address.connection
  })
  return hash;
}