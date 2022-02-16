import {
  Read,
  ReadDecoder,
  Write,
  WriteSizer,
  WriteEncoder,
  Nullable,
  BigInt,
  JSON,
  Context
} from "@web3api/wasm-as";
import * as Types from "..";

export class Input_getAssetData {
  network: Types.Network;
  assetCode: string;
  custom: Types.CustomConnection | null;
}

export function deserializegetAssetDataArgs(argsBuf: ArrayBuffer): Input_getAssetData {
  const context: Context =  new Context("Deserializing query-type: getAssetData");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _network: Types.Network = 0;
  let _networkSet: bool = false;
  let _assetCode: string = "";
  let _assetCodeSet: bool = false;
  let _custom: Types.CustomConnection | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "network") {
      reader.context().push(field, "Types.Network", "type found, reading property");
      let value: Types.Network;
      if (reader.isNextString()) {
        value = Types.getNetworkValue(reader.readString());
      } else {
        value = reader.readInt32();
        Types.sanitizeNetworkValue(value);
      }
      _network = value;
      _networkSet = true;
      reader.context().pop();
    }
    else if (field == "assetCode") {
      reader.context().push(field, "string", "type found, reading property");
      _assetCode = reader.readString();
      _assetCodeSet = true;
      reader.context().pop();
    }
    else if (field == "custom") {
      reader.context().push(field, "Types.CustomConnection | null", "type found, reading property");
      let object: Types.CustomConnection | null = null;
      if (!reader.isNextNil()) {
        object = Types.CustomConnection.read(reader);
      }
      _custom = object;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_networkSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'network: Network'"));
  }
  if (!_assetCodeSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'assetCode: String'"));
  }

  return {
    network: _network,
    assetCode: _assetCode,
    custom: _custom
  };
}

export function serializegetAssetDataResult(result: Types.GetAssetResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) query-type: getAssetData");
  const sizer = new WriteSizer(sizerContext);
  writegetAssetDataResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) query-type: getAssetData");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetAssetDataResult(encoder, result);
  return buffer;
}

export function writegetAssetDataResult(writer: Write, result: Types.GetAssetResponse): void {
  writer.context().push("getAssetData", "Types.GetAssetResponse", "writing property");
  Types.GetAssetResponse.write(writer, result);
  writer.context().pop();
}

export class Input_listAssets {
  network: Types.Network;
  custom: Types.CustomConnection | null;
  providerAddress: string;
}

export function deserializelistAssetsArgs(argsBuf: ArrayBuffer): Input_listAssets {
  const context: Context =  new Context("Deserializing query-type: listAssets");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _network: Types.Network = 0;
  let _networkSet: bool = false;
  let _custom: Types.CustomConnection | null = null;
  let _providerAddress: string = "";
  let _providerAddressSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "network") {
      reader.context().push(field, "Types.Network", "type found, reading property");
      let value: Types.Network;
      if (reader.isNextString()) {
        value = Types.getNetworkValue(reader.readString());
      } else {
        value = reader.readInt32();
        Types.sanitizeNetworkValue(value);
      }
      _network = value;
      _networkSet = true;
      reader.context().pop();
    }
    else if (field == "custom") {
      reader.context().push(field, "Types.CustomConnection | null", "type found, reading property");
      let object: Types.CustomConnection | null = null;
      if (!reader.isNextNil()) {
        object = Types.CustomConnection.read(reader);
      }
      _custom = object;
      reader.context().pop();
    }
    else if (field == "providerAddress") {
      reader.context().push(field, "string", "type found, reading property");
      _providerAddress = reader.readString();
      _providerAddressSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_networkSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'network: Network'"));
  }
  if (!_providerAddressSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'providerAddress: String'"));
  }

  return {
    network: _network,
    custom: _custom,
    providerAddress: _providerAddress
  };
}

export function serializelistAssetsResult(result: Types.listAssetsResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) query-type: listAssets");
  const sizer = new WriteSizer(sizerContext);
  writelistAssetsResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) query-type: listAssets");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writelistAssetsResult(encoder, result);
  return buffer;
}

export function writelistAssetsResult(writer: Write, result: Types.listAssetsResponse): void {
  writer.context().push("listAssets", "Types.listAssetsResponse", "writing property");
  Types.listAssetsResponse.write(writer, result);
  writer.context().pop();
}

export class Input_getCandle {
  network: Types.Network;
  custom: Types.CustomConnection | null;
  assetCode: string;
  providerAddress: string;
}

export function deserializegetCandleArgs(argsBuf: ArrayBuffer): Input_getCandle {
  const context: Context =  new Context("Deserializing query-type: getCandle");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _network: Types.Network = 0;
  let _networkSet: bool = false;
  let _custom: Types.CustomConnection | null = null;
  let _assetCode: string = "";
  let _assetCodeSet: bool = false;
  let _providerAddress: string = "";
  let _providerAddressSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "network") {
      reader.context().push(field, "Types.Network", "type found, reading property");
      let value: Types.Network;
      if (reader.isNextString()) {
        value = Types.getNetworkValue(reader.readString());
      } else {
        value = reader.readInt32();
        Types.sanitizeNetworkValue(value);
      }
      _network = value;
      _networkSet = true;
      reader.context().pop();
    }
    else if (field == "custom") {
      reader.context().push(field, "Types.CustomConnection | null", "type found, reading property");
      let object: Types.CustomConnection | null = null;
      if (!reader.isNextNil()) {
        object = Types.CustomConnection.read(reader);
      }
      _custom = object;
      reader.context().pop();
    }
    else if (field == "assetCode") {
      reader.context().push(field, "string", "type found, reading property");
      _assetCode = reader.readString();
      _assetCodeSet = true;
      reader.context().pop();
    }
    else if (field == "providerAddress") {
      reader.context().push(field, "string", "type found, reading property");
      _providerAddress = reader.readString();
      _providerAddressSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_networkSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'network: Network'"));
  }
  if (!_assetCodeSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'assetCode: String'"));
  }
  if (!_providerAddressSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'providerAddress: String'"));
  }

  return {
    network: _network,
    custom: _custom,
    assetCode: _assetCode,
    providerAddress: _providerAddress
  };
}

export function serializegetCandleResult(result: Types.GetCandleResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) query-type: getCandle");
  const sizer = new WriteSizer(sizerContext);
  writegetCandleResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) query-type: getCandle");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetCandleResult(encoder, result);
  return buffer;
}

export function writegetCandleResult(writer: Write, result: Types.GetCandleResponse): void {
  writer.context().push("getCandle", "Types.GetCandleResponse", "writing property");
  Types.GetCandleResponse.write(writer, result);
  writer.context().pop();
}

export class Input_listProviders {
}

export function deserializelistProvidersArgs(argsBuf: ArrayBuffer): Input_listProviders {
  const context: Context =  new Context("Deserializing query-type: listProviders");

  return {
  };
}

export function serializelistProvidersResult(result: Types.listProvidersResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) query-type: listProviders");
  const sizer = new WriteSizer(sizerContext);
  writelistProvidersResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) query-type: listProviders");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writelistProvidersResult(encoder, result);
  return buffer;
}

export function writelistProvidersResult(writer: Write, result: Types.listProvidersResponse): void {
  writer.context().push("listProviders", "Types.listProvidersResponse", "writing property");
  Types.listProvidersResponse.write(writer, result);
  writer.context().pop();
}

export class Input_getNormalizedPrice {
  network: Types.Network;
  custom: Types.CustomConnection | null;
  assetCode: string;
  providerAddress: string;
}

export function deserializegetNormalizedPriceArgs(argsBuf: ArrayBuffer): Input_getNormalizedPrice {
  const context: Context =  new Context("Deserializing query-type: getNormalizedPrice");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _network: Types.Network = 0;
  let _networkSet: bool = false;
  let _custom: Types.CustomConnection | null = null;
  let _assetCode: string = "";
  let _assetCodeSet: bool = false;
  let _providerAddress: string = "";
  let _providerAddressSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "network") {
      reader.context().push(field, "Types.Network", "type found, reading property");
      let value: Types.Network;
      if (reader.isNextString()) {
        value = Types.getNetworkValue(reader.readString());
      } else {
        value = reader.readInt32();
        Types.sanitizeNetworkValue(value);
      }
      _network = value;
      _networkSet = true;
      reader.context().pop();
    }
    else if (field == "custom") {
      reader.context().push(field, "Types.CustomConnection | null", "type found, reading property");
      let object: Types.CustomConnection | null = null;
      if (!reader.isNextNil()) {
        object = Types.CustomConnection.read(reader);
      }
      _custom = object;
      reader.context().pop();
    }
    else if (field == "assetCode") {
      reader.context().push(field, "string", "type found, reading property");
      _assetCode = reader.readString();
      _assetCodeSet = true;
      reader.context().pop();
    }
    else if (field == "providerAddress") {
      reader.context().push(field, "string", "type found, reading property");
      _providerAddress = reader.readString();
      _providerAddressSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_networkSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'network: Network'"));
  }
  if (!_assetCodeSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'assetCode: String'"));
  }
  if (!_providerAddressSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'providerAddress: String'"));
  }

  return {
    network: _network,
    custom: _custom,
    assetCode: _assetCode,
    providerAddress: _providerAddress
  };
}

export function serializegetNormalizedPriceResult(result: Types.GetNormalizedPriceResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) query-type: getNormalizedPrice");
  const sizer = new WriteSizer(sizerContext);
  writegetNormalizedPriceResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) query-type: getNormalizedPrice");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetNormalizedPriceResult(encoder, result);
  return buffer;
}

export function writegetNormalizedPriceResult(writer: Write, result: Types.GetNormalizedPriceResponse): void {
  writer.context().push("getNormalizedPrice", "Types.GetNormalizedPriceResponse", "writing property");
  Types.GetNormalizedPriceResponse.write(writer, result);
  writer.context().pop();
}
