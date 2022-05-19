const TezosRpcNodes: { [key: string]: string } = {
  mainnet: "https://rpc.tzstats.com",
  granadanet: "https://rpc.granada.tzstats.com",
  hangzhounet: "https://rpc.hangzhou.tzstats.com",
};

export const getProvider: (name: string) => string = (name) =>
  TezosRpcNodes[name];
