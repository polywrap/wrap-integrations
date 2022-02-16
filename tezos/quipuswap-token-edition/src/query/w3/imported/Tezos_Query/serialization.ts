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
import * as Types from "../..";

export class Input_getPublicKey {
  connection: Types.Tezos_Connection | null;
}

export function serializegetPublicKeyArgs(input: Input_getPublicKey): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getPublicKey");
  const sizer = new WriteSizer(sizerContext);
  writegetPublicKeyArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getPublicKey");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetPublicKeyArgs(encoder, input);
  return buffer;
}

export function writegetPublicKeyArgs(
  writer: Write,
  input: Input_getPublicKey
): void {
  writer.writeMapLength(1);
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
}

export function deserializegetPublicKeyResult(buffer: ArrayBuffer): string {
  const context: Context =  new Context("Deserializing imported query-type: getPublicKey");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getPublicKey", "string", "reading function output");
  const res: string = reader.readString();
  reader.context().pop();

  return res;
}

export class Input_getPublicKeyHash {
  connection: Types.Tezos_Connection | null;
}

export function serializegetPublicKeyHashArgs(input: Input_getPublicKeyHash): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getPublicKeyHash");
  const sizer = new WriteSizer(sizerContext);
  writegetPublicKeyHashArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getPublicKeyHash");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetPublicKeyHashArgs(encoder, input);
  return buffer;
}

export function writegetPublicKeyHashArgs(
  writer: Write,
  input: Input_getPublicKeyHash
): void {
  writer.writeMapLength(1);
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
}

export function deserializegetPublicKeyHashResult(buffer: ArrayBuffer): string {
  const context: Context =  new Context("Deserializing imported query-type: getPublicKeyHash");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getPublicKeyHash", "string", "reading function output");
  const res: string = reader.readString();
  reader.context().pop();

  return res;
}

export class Input_getRevealEstimate {
  connection: Types.Tezos_Connection | null;
  params: Types.Tezos_RevealParams;
}

export function serializegetRevealEstimateArgs(input: Input_getRevealEstimate): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getRevealEstimate");
  const sizer = new WriteSizer(sizerContext);
  writegetRevealEstimateArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getRevealEstimate");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetRevealEstimateArgs(encoder, input);
  return buffer;
}

export function writegetRevealEstimateArgs(
  writer: Write,
  input: Input_getRevealEstimate
): void {
  writer.writeMapLength(2);
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
  writer.context().push("params", "Types.Tezos_RevealParams", "writing property");
  writer.writeString("params");
  Types.Tezos_RevealParams.write(writer, input.params);
  writer.context().pop();
}

export function deserializegetRevealEstimateResult(buffer: ArrayBuffer): Types.Tezos_EstimateResult {
  const context: Context =  new Context("Deserializing imported query-type: getRevealEstimate");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getRevealEstimate", "Types.Tezos_EstimateResult", "reading function output");
  const object = Types.Tezos_EstimateResult.read(reader);
  const res: Types.Tezos_EstimateResult =  object;
  reader.context().pop();

  return res;
}

export class Input_getTransferEstimate {
  connection: Types.Tezos_Connection | null;
  params: Types.Tezos_TransferParams;
}

export function serializegetTransferEstimateArgs(input: Input_getTransferEstimate): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getTransferEstimate");
  const sizer = new WriteSizer(sizerContext);
  writegetTransferEstimateArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getTransferEstimate");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetTransferEstimateArgs(encoder, input);
  return buffer;
}

export function writegetTransferEstimateArgs(
  writer: Write,
  input: Input_getTransferEstimate
): void {
  writer.writeMapLength(2);
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
  writer.context().push("params", "Types.Tezos_TransferParams", "writing property");
  writer.writeString("params");
  Types.Tezos_TransferParams.write(writer, input.params);
  writer.context().pop();
}

export function deserializegetTransferEstimateResult(buffer: ArrayBuffer): Types.Tezos_EstimateResult {
  const context: Context =  new Context("Deserializing imported query-type: getTransferEstimate");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getTransferEstimate", "Types.Tezos_EstimateResult", "reading function output");
  const object = Types.Tezos_EstimateResult.read(reader);
  const res: Types.Tezos_EstimateResult =  object;
  reader.context().pop();

  return res;
}

export class Input_getOriginateEstimate {
  connection: Types.Tezos_Connection | null;
  params: Types.Tezos_OriginateParams;
}

export function serializegetOriginateEstimateArgs(input: Input_getOriginateEstimate): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getOriginateEstimate");
  const sizer = new WriteSizer(sizerContext);
  writegetOriginateEstimateArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getOriginateEstimate");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetOriginateEstimateArgs(encoder, input);
  return buffer;
}

export function writegetOriginateEstimateArgs(
  writer: Write,
  input: Input_getOriginateEstimate
): void {
  writer.writeMapLength(2);
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
  writer.context().push("params", "Types.Tezos_OriginateParams", "writing property");
  writer.writeString("params");
  Types.Tezos_OriginateParams.write(writer, input.params);
  writer.context().pop();
}

export function deserializegetOriginateEstimateResult(buffer: ArrayBuffer): Types.Tezos_EstimateResult {
  const context: Context =  new Context("Deserializing imported query-type: getOriginateEstimate");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getOriginateEstimate", "Types.Tezos_EstimateResult", "reading function output");
  const object = Types.Tezos_EstimateResult.read(reader);
  const res: Types.Tezos_EstimateResult =  object;
  reader.context().pop();

  return res;
}

export class Input_checkAddress {
  connection: Types.Tezos_Connection | null;
  address: string;
}

export function serializecheckAddressArgs(input: Input_checkAddress): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: checkAddress");
  const sizer = new WriteSizer(sizerContext);
  writecheckAddressArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: checkAddress");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writecheckAddressArgs(encoder, input);
  return buffer;
}

export function writecheckAddressArgs(
  writer: Write,
  input: Input_checkAddress
): void {
  writer.writeMapLength(2);
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
  writer.context().push("address", "string", "writing property");
  writer.writeString("address");
  writer.writeString(input.address);
  writer.context().pop();
}

export function deserializecheckAddressResult(buffer: ArrayBuffer): bool {
  const context: Context =  new Context("Deserializing imported query-type: checkAddress");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("checkAddress", "bool", "reading function output");
  const res: bool = reader.readBool();
  reader.context().pop();

  return res;
}

export class Input_getBalance {
  connection: Types.Tezos_Connection | null;
  address: string;
}

export function serializegetBalanceArgs(input: Input_getBalance): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getBalance");
  const sizer = new WriteSizer(sizerContext);
  writegetBalanceArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getBalance");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetBalanceArgs(encoder, input);
  return buffer;
}

export function writegetBalanceArgs(
  writer: Write,
  input: Input_getBalance
): void {
  writer.writeMapLength(2);
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
  writer.context().push("address", "string", "writing property");
  writer.writeString("address");
  writer.writeString(input.address);
  writer.context().pop();
}

export function deserializegetBalanceResult(buffer: ArrayBuffer): string {
  const context: Context =  new Context("Deserializing imported query-type: getBalance");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getBalance", "string", "reading function output");
  const res: string = reader.readString();
  reader.context().pop();

  return res;
}

export class Input_getContractStorage {
  address: string;
  key: string;
  field: string | null;
  connection: Types.Tezos_Connection | null;
}

export function serializegetContractStorageArgs(input: Input_getContractStorage): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getContractStorage");
  const sizer = new WriteSizer(sizerContext);
  writegetContractStorageArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getContractStorage");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetContractStorageArgs(encoder, input);
  return buffer;
}

export function writegetContractStorageArgs(
  writer: Write,
  input: Input_getContractStorage
): void {
  writer.writeMapLength(4);
  writer.context().push("address", "string", "writing property");
  writer.writeString("address");
  writer.writeString(input.address);
  writer.context().pop();
  writer.context().push("key", "string", "writing property");
  writer.writeString("key");
  writer.writeString(input.key);
  writer.context().pop();
  writer.context().push("field", "string | null", "writing property");
  writer.writeString("field");
  writer.writeNullableString(input.field);
  writer.context().pop();
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
}

export function deserializegetContractStorageResult(buffer: ArrayBuffer): string {
  const context: Context =  new Context("Deserializing imported query-type: getContractStorage");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getContractStorage", "string", "reading function output");
  const res: string = reader.readString();
  reader.context().pop();

  return res;
}

export class Input_executeTzip16View {
  address: string;
  viewName: string;
  args: string;
  connection: Types.Tezos_Connection | null;
}

export function serializeexecuteTzip16ViewArgs(input: Input_executeTzip16View): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: executeTzip16View");
  const sizer = new WriteSizer(sizerContext);
  writeexecuteTzip16ViewArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: executeTzip16View");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeexecuteTzip16ViewArgs(encoder, input);
  return buffer;
}

export function writeexecuteTzip16ViewArgs(
  writer: Write,
  input: Input_executeTzip16View
): void {
  writer.writeMapLength(4);
  writer.context().push("address", "string", "writing property");
  writer.writeString("address");
  writer.writeString(input.address);
  writer.context().pop();
  writer.context().push("viewName", "string", "writing property");
  writer.writeString("viewName");
  writer.writeString(input.viewName);
  writer.context().pop();
  writer.context().push("args", "string", "writing property");
  writer.writeString("args");
  writer.writeString(input.args);
  writer.context().pop();
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
}

export function deserializeexecuteTzip16ViewResult(buffer: ArrayBuffer): string {
  const context: Context =  new Context("Deserializing imported query-type: executeTzip16View");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("executeTzip16View", "string", "reading function output");
  const res: string = reader.readString();
  reader.context().pop();

  return res;
}

export class Input_getWalletPKH {
  connection: Types.Tezos_Connection | null;
}

export function serializegetWalletPKHArgs(input: Input_getWalletPKH): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getWalletPKH");
  const sizer = new WriteSizer(sizerContext);
  writegetWalletPKHArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getWalletPKH");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetWalletPKHArgs(encoder, input);
  return buffer;
}

export function writegetWalletPKHArgs(
  writer: Write,
  input: Input_getWalletPKH
): void {
  writer.writeMapLength(1);
  writer.context().push("connection", "Types.Tezos_Connection | null", "writing property");
  writer.writeString("connection");
  if (input.connection) {
    Types.Tezos_Connection.write(writer, input.connection as Types.Tezos_Connection);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
}

export function deserializegetWalletPKHResult(buffer: ArrayBuffer): string {
  const context: Context =  new Context("Deserializing imported query-type: getWalletPKH");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getWalletPKH", "string", "reading function output");
  const res: string = reader.readString();
  reader.context().pop();

  return res;
}

export class Input_getOperationStatus {
  hash: string;
  network: Types.Tezos_GetOperationStatusSupportedNetworks;
}

export function serializegetOperationStatusArgs(input: Input_getOperationStatus): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) imported query-type: getOperationStatus");
  const sizer = new WriteSizer(sizerContext);
  writegetOperationStatusArgs(sizer, input);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) imported query-type: getOperationStatus");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writegetOperationStatusArgs(encoder, input);
  return buffer;
}

export function writegetOperationStatusArgs(
  writer: Write,
  input: Input_getOperationStatus
): void {
  writer.writeMapLength(2);
  writer.context().push("hash", "string", "writing property");
  writer.writeString("hash");
  writer.writeString(input.hash);
  writer.context().pop();
  writer.context().push("network", "Types.Tezos_GetOperationStatusSupportedNetworks", "writing property");
  writer.writeString("network");
  writer.writeInt32(input.network);
  writer.context().pop();
}

export function deserializegetOperationStatusResult(buffer: ArrayBuffer): Types.Tezos_OperationStatus {
  const context: Context =  new Context("Deserializing imported query-type: getOperationStatus");
  const reader = new ReadDecoder(buffer, context);

  reader.context().push("getOperationStatus", "Types.Tezos_OperationStatus", "reading function output");
  const object = Types.Tezos_OperationStatus.read(reader);
  const res: Types.Tezos_OperationStatus =  object;
  reader.context().pop();

  return res;
}
