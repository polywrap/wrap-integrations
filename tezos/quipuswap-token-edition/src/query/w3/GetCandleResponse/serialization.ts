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
import { GetCandleResponse } from "./";
import * as Types from "..";

export function serializeGetCandleResponse(type: GetCandleResponse): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) object-type: GetCandleResponse");
  const sizer = new WriteSizer(sizerContext);
  writeGetCandleResponse(sizer, type);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) object-type: GetCandleResponse");
  const encoder = new WriteEncoder(buffer, encoderContext);
  writeGetCandleResponse(encoder, type);
  return buffer;
}

export function writeGetCandleResponse(writer: Write, type: GetCandleResponse): void {
  writer.writeMapLength(8);
  writer.context().push("low", "string", "writing property");
  writer.writeString("low");
  writer.writeString(type.low);
  writer.context().pop();
  writer.context().push("open", "string", "writing property");
  writer.writeString("open");
  writer.writeString(type.open);
  writer.context().pop();
  writer.context().push("high", "string", "writing property");
  writer.writeString("high");
  writer.writeString(type.high);
  writer.context().pop();
  writer.context().push("asset", "string", "writing property");
  writer.writeString("asset");
  writer.writeString(type.asset);
  writer.context().pop();
  writer.context().push("close", "string", "writing property");
  writer.writeString("close");
  writer.writeString(type.close);
  writer.context().pop();
  writer.context().push("volume", "string", "writing property");
  writer.writeString("volume");
  writer.writeString(type.volume);
  writer.context().pop();
  writer.context().push("endPeriod", "string", "writing property");
  writer.writeString("endPeriod");
  writer.writeString(type.endPeriod);
  writer.context().pop();
  writer.context().push("startPeriod", "string", "writing property");
  writer.writeString("startPeriod");
  writer.writeString(type.startPeriod);
  writer.context().pop();
}

export function deserializeGetCandleResponse(buffer: ArrayBuffer): GetCandleResponse {
  const context: Context = new Context("Deserializing object-type GetCandleResponse");
  const reader = new ReadDecoder(buffer, context);
  return readGetCandleResponse(reader);
}

export function readGetCandleResponse(reader: Read): GetCandleResponse {
  let numFields = reader.readMapLength();

  let _low: string = "";
  let _lowSet: bool = false;
  let _open: string = "";
  let _openSet: bool = false;
  let _high: string = "";
  let _highSet: bool = false;
  let _asset: string = "";
  let _assetSet: bool = false;
  let _close: string = "";
  let _closeSet: bool = false;
  let _volume: string = "";
  let _volumeSet: bool = false;
  let _endPeriod: string = "";
  let _endPeriodSet: bool = false;
  let _startPeriod: string = "";
  let _startPeriodSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "low") {
      reader.context().push(field, "string", "type found, reading property");
      _low = reader.readString();
      _lowSet = true;
      reader.context().pop();
    }
    else if (field == "open") {
      reader.context().push(field, "string", "type found, reading property");
      _open = reader.readString();
      _openSet = true;
      reader.context().pop();
    }
    else if (field == "high") {
      reader.context().push(field, "string", "type found, reading property");
      _high = reader.readString();
      _highSet = true;
      reader.context().pop();
    }
    else if (field == "asset") {
      reader.context().push(field, "string", "type found, reading property");
      _asset = reader.readString();
      _assetSet = true;
      reader.context().pop();
    }
    else if (field == "close") {
      reader.context().push(field, "string", "type found, reading property");
      _close = reader.readString();
      _closeSet = true;
      reader.context().pop();
    }
    else if (field == "volume") {
      reader.context().push(field, "string", "type found, reading property");
      _volume = reader.readString();
      _volumeSet = true;
      reader.context().pop();
    }
    else if (field == "endPeriod") {
      reader.context().push(field, "string", "type found, reading property");
      _endPeriod = reader.readString();
      _endPeriodSet = true;
      reader.context().pop();
    }
    else if (field == "startPeriod") {
      reader.context().push(field, "string", "type found, reading property");
      _startPeriod = reader.readString();
      _startPeriodSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_lowSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'low: String'"));
  }
  if (!_openSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'open: String'"));
  }
  if (!_highSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'high: String'"));
  }
  if (!_assetSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'asset: String'"));
  }
  if (!_closeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'close: String'"));
  }
  if (!_volumeSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'volume: String'"));
  }
  if (!_endPeriodSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'endPeriod: String'"));
  }
  if (!_startPeriodSet) {
    throw new Error(reader.context().printWithContext("Missing required property: 'startPeriod: String'"));
  }

  return {
    low: _low,
    open: _open,
    high: _high,
    asset: _asset,
    close: _close,
    volume: _volume,
    endPeriod: _endPeriod,
    startPeriod: _startPeriod
  };
}
