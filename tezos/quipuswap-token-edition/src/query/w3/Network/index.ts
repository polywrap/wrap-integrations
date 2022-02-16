export enum Network {
  custom,
  mainnet,
  granadanet,
  _MAX_
}

export function sanitizeNetworkValue(value: i32): void {
  const valid = value >= 0 && value < Network._MAX_;
  if (!valid) {
    throw new Error("Invalid value for enum 'Network': " + value.toString());
  }
}

export function getNetworkValue(key: string): Network {
  if (key == "custom") {
    return Network.custom;
  }
  if (key == "mainnet") {
    return Network.mainnet;
  }
  if (key == "granadanet") {
    return Network.granadanet;
  }

  throw new Error("Invalid key for enum 'Network': " + key);
}

export function getNetworkKey(value: Network): string {
  sanitizeNetworkValue(value);

  switch (value) {
    case Network.custom: return "custom";
    case Network.mainnet: return "mainnet";
    case Network.granadanet: return "granadanet";
    default:
      throw new Error("Invalid value for enum 'Network': " + value.toString());
  }
}
