import { BorshDeserializer } from "@serial-as/borsh";
import { Entity, EntityField } from "../wrap";
import { Variant } from "as-variant";
import { JSON, JSONEncoder } from "@polywrap/wasm-as";

/* class Obj {}

/// Deserializes object from bytes using schema.
export function deserialize<T>(
  schema: Map<string, Entity>,
  objType: string,
  buffer: ArrayBuffer
): T {
  const deserializer = new BorshDeserializer(buffer);
  const result = deserializeStruct(schema, objType, deserializer);
  /*   if (deserializer.offset < buffer.length) {
    throw new Error(
      `Unexpected ${
        buffer.length - reader.offset
      } bytes after deserialized data`
    );
  } 
  return result;
}*/

/// Deserializes object from bytes using schema, without checking the length read
/* export function deserializeUnchecked<T>(
  schema: Schema,
  classType: { new (args: any): T },
  buffer: Buffer,
  Reader = BinaryReader
): T {
  const reader = new Reader(buffer);
  return deserializeStruct(schema, classType, reader);
} */

function deserializeField(
  schema: Map<string, Entity>,
  fieldName: string,
  fieldType: string,
  deserializer: BorshDeserializer
): Variant {
    if (fieldType === "string") {
      return deserializer.decode_string()
    }

    if (fieldType instanceof Array) {
      if (typeof fieldType[0] === "number") {
        return reader.readFixedArray(fieldType[0]);
      } else if (typeof fieldType[1] === "number") {
        const arr = [];
        for (let i = 0; i < fieldType[1]; i++) {
          arr.push(deserializeField(schema, null, fieldType[0], reader));
        }
        return Variant.from(arr);
      } else {
        return reader.readArray(() =>
          deserializeField(schema, fieldName, fieldType[0], reader)
        );
      }
    }

    if (fieldType.kind === "option") {
      const option = reader.readU8();
      if (option) {
        return deserializeField(schema, fieldName, fieldType.type, reader);
      }

      return undefined;
    }
    if (fieldType.kind === "map") {
      const map = new Map();
      const length = reader.readU32();
      for (let i = 0; i < length; i++) {
        const key = deserializeField(schema, fieldName, fieldType.key, reader);
        const val = deserializeField(
          schema,
          fieldName,
          fieldType.value,
          reader
        );
        map.set(key, val);
      }
      return map;
    }

    return deserializeStruct(schema, fieldType, reader);

}

function deserializeStruct(
  schema: Map<string, Entity>,
  objType: string,
  deserializer: BorshDeserializer
): any {
  const structSchema = schema.get(objType);

  if (!structSchema) {
    throw new Error(`Object ${objType} is missing in schema`);
  }

  if (structSchema.kind === "struct") {
    if (structSchema.fields == null) {
      return;
    }
    //const result = {}
    const jsonEncoder = new JSONEncoder();

    for (let i = 0; i < structSchema.fields.length; i++) {
      //@ts-ignore
      const field: EntityField = structSchema.fields[i];
      const fieldName = field.name;
      const fieldType = field.m_type;

      const deserialized = deserializeField(
        schema,
        fieldName,
        fieldType,
        deserializer
      );

      //---------encode json
      if (deserialized.is<Obj>()) {
        deserialized.get<Obj>();
      }
      if (deserialized.is<u64>()) {
        const uint = deserialized.get<u64>();
        jsonEncoder.setInteger(null, <i64>uint);
      }

      // add to json
      JSON.from(deserialized);
    }
    //return new classType(result);
    return new JSON.Obj();
  }

  if (structSchema.kind === "enum") {
    const idx = reader.readU8();
    if (idx >= structSchema.values.length) {
      throw new BorshError(`Enum index: ${idx} is out of range`);
    }
    const [fieldName, fieldType] = structSchema.values[idx];
    const fieldValue = deserializeField(schema, fieldName, fieldType, reader);
    return new classType({ [fieldName]: fieldValue });
  }

  throw new Error(
    `Unexpected schema kind: ${structSchema.kind} for ${classType.constructor.name}`
  );
}
 */