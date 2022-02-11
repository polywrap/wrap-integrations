import { Network, Tezos_Connection } from "../query/w3";
import { SupportedActions, DefaultAddresses } from "./default-address"

const SupportedNetworks = [Network.mainnet, Network.hangzhounet, Network.granadanet];

export class Address {
  connection: Tezos_Connection;
  contractAddress: string;

  constructor(conn: Tezos_Connection, contractAddress: string) {
    this.connection = conn;
    this.contractAddress = contractAddress;
  }

  static getAddress(network: Network, action: string): Address {
    let contractAddress: string;
    let connection: Tezos_Connection;
    if (!SupportedActions.includes(action)) {
      throw new Error(`action '${action}' is not supported`);
    }
    if (!SupportedNetworks.includes(network)) {
      throw new Error(`network '${network}' is not supported`);
    }
    switch (network) {
      case Network.granadanet: 
        contractAddress = DefaultAddresses.get(`Granadanet.${action}`);
        connection = <Tezos_Connection> {
          provider: "https://rpc.granada.tzstats.com",
          networkNameOrChainId: "granadanet"  
        }
        break;
      case Network.hangzhounet: 
        contractAddress = DefaultAddresses.get(`Hangzhounet.${action}`);
        connection = <Tezos_Connection> {
          provider: "https://rpc.hangzhou.tzstats.com",
          networkNameOrChainId: "hangzhounet"  
        }
        break;
      case Network.mainnet: 
        contractAddress = DefaultAddresses.get(`Mainnet.${action}`);
        connection = <Tezos_Connection> {
          provider: "https://rpc.tzstats.com",
          networkNameOrChainId: "mainnet"
        };
        break;
    }
    return new Address(connection, contractAddress);
  }
}