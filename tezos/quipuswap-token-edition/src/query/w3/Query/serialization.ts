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

export class Input_listTokenPairs {
  network: Types.Network;
  custom: Types.CustomConnection | null;
}

export function deserializelistTokenPairsArgs(argsBuf: ArrayBuffer): Input_listTokenPairs {
  const context: Context =  new Context("Deserializing query-type: listTokenPairs");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _network: Types.Network = 0;
  let _networkSet: bool = false;
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

  return {
    network: _network,
    custom: _custom
  };
}

export function serializelistTokenPairsResult(result: Types.ListTokenPairsResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) query-type: listTokenPairs");
  const sizer = new WriteSizer(sizerContext);
  writelistTokenPairsResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) query-type: listTokenPairs");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writelistTokenPairsResult(encoder, result);
  return buffer;
}

export function writelistTokenPairsResult(writer: Write, result: Types.ListTokenPairsResponse): void {
  writer.context().push("listTokenPairs", "Types.ListTokenPairsResponse", "writing property");
  Types.ListTokenPairsResponse.write(writer, result);
  writer.context().pop();
}

export class Input_getTokenSupply {
  network: Types.Network;
  custom: Types.CustomConnection | null;
  pair_id: string;
}

export function deserializegetTokenSupplyArgs(argsBuf: ArrayBuffer): Input_getTokenSupply {
  const context: Context =  new Context("Deserializing query-type: getTokenSupply");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _network: Types.Network = 0;
  let _networkSet: bool = false;
  let _custom: Types.CustomConnection | null = null;
  let _pair_id: string = "";
  let _pair_idSet: bool = false;

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
    else if (field == "pair_id") {
      reader.context().push(field, "string", "type found, reading property");
      _pair_id = reader.readString();
      _pair_idSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_networkSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'network: Network'"));
  }
  if (!_pair_idSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'pair_id: String'"));
  }

  return {
    network: _network,
    custom: _custom,
    pair_id: _pair_id
  };
}

export function serializegetTokenSupplyResult(result: Types.GetTokenSupplyResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) query-type: getTokenSupply");
  const sizer = new WriteSizer(sizerContext);
  writegetTokenSupplyResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) query-type: getTokenSupply");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetTokenSupplyResult(encoder, result);
  return buffer;
}

export function writegetTokenSupplyResult(writer: Write, result: Types.GetTokenSupplyResponse): void {
  writer.context().push("getTokenSupply", "Types.GetTokenSupplyResponse", "writing property");
  Types.GetTokenSupplyResponse.write(writer, result);
  writer.context().pop();
}

export class Input_getLPTokenBalance {
  network: Types.Network;
  custom: Types.CustomConnection | null;
  owner: string;
  pair_id: string;
}

export function deserializegetLPTokenBalanceArgs(argsBuf: ArrayBuffer): Input_getLPTokenBalance {
  const context: Context =  new Context("Deserializing query-type: getLPTokenBalance");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _network: Types.Network = 0;
  let _networkSet: bool = false;
  let _custom: Types.CustomConnection | null = null;
  let _owner: string = "";
  let _ownerSet: bool = false;
  let _pair_id: string = "";
  let _pair_idSet: bool = false;

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
    else if (field == "owner") {
      reader.context().push(field, "string", "type found, reading property");
      _owner = reader.readString();
      _ownerSet = true;
      reader.context().pop();
    }
    else if (field == "pair_id") {
      reader.context().push(field, "string", "type found, reading property");
      _pair_id = reader.readString();
      _pair_idSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_networkSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'network: Network'"));
  }
  if (!_ownerSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'owner: String'"));
  }
  if (!_pair_idSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'pair_id: String'"));
  }

  return {
    network: _network,
    custom: _custom,
    owner: _owner,
    pair_id: _pair_id
  };
}

export function serializegetLPTokenBalanceResult(result: Types.GetLPTokenBalanceResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) query-type: getLPTokenBalance");
  const sizer = new WriteSizer(sizerContext);
  writegetLPTokenBalanceResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) query-type: getLPTokenBalance");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetLPTokenBalanceResult(encoder, result);
  return buffer;
}

export function writegetLPTokenBalanceResult(writer: Write, result: Types.GetLPTokenBalanceResponse): void {
  writer.context().push("getLPTokenBalance", "Types.GetLPTokenBalanceResponse", "writing property");
  Types.GetLPTokenBalanceResponse.write(writer, result);
  writer.context().pop();
}
