import { getString } from "../utils/common";
import {
  Network,
  Tezos_Query,
  Tezos_Connection,
  Input_resolveAddress,
  Input_resolveDomain,
  DomainInfo,
  CustomConnection
} from "./w3";

import { JSON } from "assemblyscript-json"; 

class ConnectionDetails {
  connection: Tezos_Connection;
  contractAddress: string;
}

export function resolveAddress(input: Input_resolveAddress): DomainInfo | null {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and contract address`);
  }
  const connectionDetails = getConnectionDetails(input.network, input.custom);
  const record = Tezos_Query.executeTzip16View({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection, 
    viewName: "resolve-address",
    args: '["' + input.address + '"]'
  });
  if (record.length === 0) {
    return null
  }
  const domainInfo = <JSON.Obj>JSON.parse(record);
  return {
    Name: decodeFromHex(getString(domainInfo, "name")),
    Address: getString(domainInfo, "address"),
    Data: getString(domainInfo, "data"),
    Expiry: getString(domainInfo, "expiry")
  };
} 

export function resolveDomain(input: Input_resolveDomain): DomainInfo | null {
  if (input.network == Network.custom && input.custom === null) {
    throw new Error(`custom network should have a valid connection and contract address`);
  }
  const domain = encodeToHex(input.domain);
  const connectionDetails = getConnectionDetails(input.network, input.custom);
  const record = Tezos_Query.executeTzip16View({
    address: connectionDetails.contractAddress,
    connection: connectionDetails.connection, 
    viewName: "resolve-name",
    args: '["' + domain + '"]'
  });
  if (record.length === 0) {
    return null
  }
  const domainInfo = <JSON.Obj>JSON.parse(record);
  return {
    Name: input.domain,
    Address: getString(domainInfo, "address"),
    Data: getString(domainInfo, "data"),
    Expiry: getString(domainInfo, "expiry")
  };
} 


function getConnectionDetails(network: Network, custom: CustomConnection | null): ConnectionDetails {
  let address: string = "KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS";
  let connection: Tezos_Connection = {
    provider: "https://rpc.tzstats.com",
    networkNameOrChainId: "mainnet"
  };
  switch (network) {
    case Network.granadanet:
      connection = <Tezos_Connection> {
        provider: "https://rpc.granada.tzstats.com",
        networkNameOrChainId: "granadanet"  
      }
      address = "KT1Ch6PstAQG32uNfQJUSL2bf2WvimvY5umk";
      break;
    case Network.hangzhounet:
      connection = <Tezos_Connection> {
        provider: "https://rpc.hangzhou.tzstats.com",
        networkNameOrChainId: "granadanet"  
      }
      address = "KT1MgQjmWMBQ4LyuMAqZccTkMSUJbEXeGqii";
      break;
    default:
      break;
  }
  if (network == Network.custom) {
    connection = custom!.connection;
    address = custom!.contractAddress;
  }
  return {
    connection: connection,
    contractAddress: address,
  }
}

function encodeToHex(data: string): string {
  const array = Uint8Array.wrap(String.UTF8.encode(data));
  let hex = '';
  for (let i = 0; i < array.length; i++) {
      hex += array[i].toString(16);
  };
  return hex;
}

export function decodeFromHex(data: string): string {
  let array = new Uint8Array(data.length >>> 1);
  for (let i = 0; i < data.length >>> 1; ++i) {
    array.fill(i32(parseInt('0x' + data.substr(i * 2, 2), 16)), i, i + 1);
  }
  return String.UTF8.decode(array.buffer);
}