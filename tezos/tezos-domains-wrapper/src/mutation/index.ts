import {
  Input_commit, 
  Tezos_Mutation,
  Tezos_TxOperation,
  Input_buy,
  TezosDomainsPlugin_Query,
} from "./w3"
import { getConnection, parseDomainMetadata } from "../common/utils";
import { encodeCommitment } from "../query";

export function commit(input: Input_commit): string {
  const label = TezosDomainsPlugin_Query.char2Bytes({
    text: input.params.label
  });
  const commitmentBytes = encodeCommitment(label, input.params.owner, input.params.nonce);
  const commitmentHash = TezosDomainsPlugin_Query.bytesToHex({
    bytes: commitmentBytes
  });
  const address = getConnection(input.network, "Commit", input.custom);
  const hash = Tezos_Mutation.walletContractCallMethod({
    address: address.contractAddress,
    method: "commit",
    args: '["' + commitmentHash + '"]',
    params: input.sendParams,
    connection: address.connection
  })
  return hash;
}

export function buy(input: Input_buy): string {
  const label = TezosDomainsPlugin_Query.char2Bytes({
    text: input.params.label
  });
  const address = getConnection(input.network, "Buy", input.custom);
  const hash = Tezos_Mutation.walletContractCallMethod({
    address: address.contractAddress,
    method: "buy",
    args: '["' + 
      label + '", "' + 
      input.params.duration.toString() + '", "' +  
      input.params.owner + '", "' + 
      input.params.address + '", ' +
      input.params.data + ', "' + 
      input.params.nonce.toString() + 
    '"]',
    params: input.sendParams,
    connection: address.connection
  })
  return hash;
}