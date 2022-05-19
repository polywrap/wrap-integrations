import { Network, Tezos_Connection } from "../query/w3";
const SupportedNetworks = [Network.mainnet, Network.hangzhounet];

export class Address {
  connection: Tezos_Connection;
  contractAddress: string;

  constructor(conn: Tezos_Connection, contractAddress: string) {
    this.connection = conn;
    this.contractAddress = contractAddress;
  }

  static getAddress(network: Network): Address {
    let contractAddress: string;
    let connection: Tezos_Connection;
    if (!SupportedNetworks.includes(network)) {
      throw new Error(`network '${network}' is not supported`);
    }
    switch (network) {
      case Network.hangzhounet: 
        contractAddress = "KT1Ni6JpXqGyZKXhJCPQJZ9x5x5bd7tXPNPC";
        connection = <Tezos_Connection> {
          provider: "https://rpc.hangzhou.tzstats.com",
          networkNameOrChainId: "hangzhounet"  
        }
        break;
      case Network.mainnet: 
        contractAddress = "KT1VNEzpf631BLsdPJjt2ZhgUitR392x6cSi";
        connection = <Tezos_Connection> {
          provider: "https://rpc.tzstats.com",
          networkNameOrChainId: "mainnet"
        };
        break;
      default:
        throw new Error('unknown network');
    }
    return new Address(connection, contractAddress);
  }
}