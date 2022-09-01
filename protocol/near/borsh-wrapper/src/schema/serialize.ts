import { JSON } from "@polywrap/wasm-as";
import { BorshSerializer } from "@serial-as/borsh";
import { Entity } from "../wrap";

export function serialize(
  schema: Map<string, Entity>,
  obj: JSON.Value
): ArrayBuffer {
  const serializer = new BorshSerializer();
  serializeStruct(schema, obj, serializer);

  return serializer.get_encoded_object();
}

function serializeStruct(
  schema: Map<string, Entity>,
  obj: JSON.Value,
  serializer: BorshSerializer
): void {
  const objName = (<JSON.Obj>obj).getString("name")!.valueOf();

  const structSchema = schema.get(objName);

  if (!structSchema) {
    throw Error(`Class ${objName} is missing in schema`);
  }

  if (structSchema.kind == "struct") {
    for (let i = 0; i < structSchema.fields!.length; i++) {
      const field = structSchema.fields![i]!;
      const value = (<JSON.Obj>obj).getValue(field.name)!;
      serializeField(schema, field.name, value, field.m_type, serializer);
    }
  } else if (structSchema.kind == "enum") {
    const name = (<JSON.Obj>obj).getString(structSchema.field!)!.valueOf();

    for (let idx = 0; idx < structSchema.values!.length; ++idx) {
      const field = structSchema.values![idx]!;
      const fieldName = field.name;
      const fieldType = field.m_type;

      if (fieldName == name) {
        serializer.encode_number<u8>(<u8>idx);

        const value = (<JSON.Obj>obj).getValue(fieldName)!;
        serializeField(schema, fieldName, value, fieldType, serializer);
        break;
      }
    }
  } else {
    throw new Error(
      `Unexpected schema kind: ${structSchema.kind} for ${objName}`
    );
  }
}

function serializeField(
  schema: Map<string, Entity>,
  fieldName: string,
  value: JSON.Value,
  fieldType: string,
  serializer: BorshSerializer
): void {
  if (fieldType == "string") {
    serializer.encode_string((<JSON.Str>value).valueOf());
  } else if (fieldType.includes("[")) {
    // if array
    const isFixedArray = Number.parseInt(fieldType[1]); // if T of array<T> is number([32]) means it is arraybuffer with provided length

    if (isFixedArray) {
      const expectedLength = Number.parseInt(fieldType);

      const keys = (<JSON.Obj>value).keys; // Treat value as object here, because json stringifies arrayBuffer object-like

      if (keys.length == expectedLength) {
        throw new Error(
          `Expecting byte array of length ${expectedLength}, but got ${keys.length} bytes`
        );
      }

      const u8Array = jsonToUint8Array(value); // JSON stringifies buffers in another format
      //const buffer = u8Array.buffer;

      //writer.writeFixedArray(value) = serializer.encode_static_array();

      serializer.buffer.store_bytes(
        changetype<usize>(u8Array),
        u8Array.byteLength
      );
    } else if (fieldType.length === 2 && typeof fieldType[1] === "number") {
      /* 
      if (value.length !== fieldType[1]) {
        throw new Error(
          `Expecting byte array of length ${fieldType[1]}, but got ${value.length} bytes`
        );
      }
      for (let i = 0; i < fieldType[1]; i++) {
        serializeField(schema, null, value[i], fieldType[0], serializer);
      } 
      */
    } else {
      // array ?
      serializer.encode_array([]);

      /*  writer.writeArray(value, (item: any) => {
        serializeField(schema, fieldName, item, fieldType[0], serializer);
      }); */
    }
  } else if (fieldType) {
    if (fieldType == "option") {
      /*       if (value === null || value === undefined) {
        writer.writeU8(0);
      } else {
        writer.writeU8(1);
        serializeField(schema, fieldName, value, fieldType.type, writer);
      } */
    } else if (fieldType == "map") {
      //serializer.encode_map(new Map());
      /*
       writer.writeU32(value.size);
      value.forEach((val, key) => {
        serializeField(schema, fieldName, key, fieldType.key, writer);
        serializeField(schema, fieldName, val, fieldType.value, writer);
      });
      */
    }
  } else {
    serializeStruct(schema, value, serializer);
  }
}

function jsonToUint8Array(json: JSON.Value): Uint8Array {
  const object = <JSON.Obj>json;

  const keys = (<JSON.Obj>object).keys;

  let bytesArray: u8[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const integer = (<JSON.Integer>object.get(key)).valueOf();
    bytesArray.push(<u8>integer);
  }
  const uArr = new Uint8Array(bytesArray.length);
  uArr.set(bytesArray);
  return uArr;

}

