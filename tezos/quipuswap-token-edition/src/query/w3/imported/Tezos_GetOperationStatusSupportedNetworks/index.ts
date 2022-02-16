export enum Tezos_GetOperationStatusSupportedNetworks {
  mainnet,
  hangzhounet,
  granadanet,
  _MAX_
}

export function sanitizeTezos_GetOperationStatusSupportedNetworksValue(value: i32): void {
  const valid = value >= 0 && value < Tezos_GetOperationStatusSupportedNetworks._MAX_;
  if (!valid) {
    throw new Error("Invalid value for enum 'Tezos_GetOperationStatusSupportedNetworks': " + value.toString());
  }
}

export function getTezos_GetOperationStatusSupportedNetworksValue(key: string): Tezos_GetOperationStatusSupportedNetworks {
  if (key == "mainnet") {
    return Tezos_GetOperationStatusSupportedNetworks.mainnet;
  }
  if (key == "hangzhounet") {
    return Tezos_GetOperationStatusSupportedNetworks.hangzhounet;
  }
  if (key == "granadanet") {
    return Tezos_GetOperationStatusSupportedNetworks.granadanet;
  }

  throw new Error("Invalid key for enum 'Tezos_GetOperationStatusSupportedNetworks': " + key);
}

export function getTezos_GetOperationStatusSupportedNetworksKey(value: Tezos_GetOperationStatusSupportedNetworks): string {
  sanitizeTezos_GetOperationStatusSupportedNetworksValue(value);

  switch (value) {
    case Tezos_GetOperationStatusSupportedNetworks.mainnet: return "mainnet";
    case Tezos_GetOperationStatusSupportedNetworks.hangzhounet: return "hangzhounet";
    case Tezos_GetOperationStatusSupportedNetworks.granadanet: return "granadanet";
    default:
      throw new Error("Invalid value for enum 'Tezos_GetOperationStatusSupportedNetworks': " + value.toString());
  }
}
