export enum Tezos_GetOperationStatusSupportedNetworks {
  Mainnet,
  Hangzhounet,
  Granadanet,
  _MAX_
}

export function sanitizeTezos_GetOperationStatusSupportedNetworksValue(value: i32): void {
  const valid = value >= 0 && value < Tezos_GetOperationStatusSupportedNetworks._MAX_;
  if (!valid) {
    throw new Error("Invalid value for enum 'Tezos_GetOperationStatusSupportedNetworks': " + value.toString());
  }
}

export function getTezos_GetOperationStatusSupportedNetworksValue(key: string): Tezos_GetOperationStatusSupportedNetworks {
  if (key == "Mainnet") {
    return Tezos_GetOperationStatusSupportedNetworks.Mainnet;
  }
  if (key == "Hangzhounet") {
    return Tezos_GetOperationStatusSupportedNetworks.Hangzhounet;
  }
  if (key == "Granadanet") {
    return Tezos_GetOperationStatusSupportedNetworks.Granadanet;
  }

  throw new Error("Invalid key for enum 'Tezos_GetOperationStatusSupportedNetworks': " + key);
}

export function getTezos_GetOperationStatusSupportedNetworksKey(value: Tezos_GetOperationStatusSupportedNetworks): string {
  sanitizeTezos_GetOperationStatusSupportedNetworksValue(value);

  switch (value) {
    case Tezos_GetOperationStatusSupportedNetworks.Mainnet: return "Mainnet";
    case Tezos_GetOperationStatusSupportedNetworks.Hangzhounet: return "Hangzhounet";
    case Tezos_GetOperationStatusSupportedNetworks.Granadanet: return "Granadanet";
    default:
      throw new Error("Invalid value for enum 'Tezos_GetOperationStatusSupportedNetworks': " + value.toString());
  }
}
