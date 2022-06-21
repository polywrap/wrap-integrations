/// NOTE: This is an auto-generated file.
///       All modifications will be overwritten.

// @ts-ignore
import * as Types from "./";

// @ts-ignore
import {
  Client,
  InvokeResult
} from "@polywrap/core-js";

export type UInt = number;
export type UInt8 = number;
export type UInt16 = number;
export type UInt32 = number;
export type Int = number;
export type Int8 = number;
export type Int16 = number;
export type Int32 = number;
export type Bytes = ArrayBuffer;
export type BigInt = string;
export type BigNumber = string;
export type Json = string;
export type String = string;
export type Boolean = boolean;

/// Envs START ///
/// Envs END ///

/// Objects START ///
/// Objects END ///

/// Enums START ///
/// Enums END ///

/// Imported Objects START ///

/// Imported Objects END ///

/// Imported Modules START ///

/* URI: "ens/interface.cache.polywrap.eth" */
interface Cache_Module_Input_get extends Record<string, unknown> {
  key: Types.String;
}

/* URI: "ens/interface.cache.polywrap.eth" */
interface Cache_Module_Input_has extends Record<string, unknown> {
  key: Types.String;
}

/* URI: "ens/interface.cache.polywrap.eth" */
interface Cache_Module_Input_set extends Record<string, unknown> {
  key: Types.String;
  value: Types.String;
  timeout?: Types.Int | null;
}

/* URI: "ens/interface.cache.polywrap.eth" */
interface Cache_Module_Input_add extends Record<string, unknown> {
  key: Types.String;
  value: Types.String;
  timeout?: Types.Int | null;
}

/* URI: "ens/interface.cache.polywrap.eth" */
interface Cache_Module_Input_delete extends Record<string, unknown> {
  key: Types.String;
}

/* URI: "ens/interface.cache.polywrap.eth" */
interface Cache_Module_Input_clear extends Record<string, unknown> {
}

/* URI: "ens/interface.cache.polywrap.eth" */
export const Cache_Module = {
  get: async (
    input: Cache_Module_Input_get,
    client: Client
  ): Promise<InvokeResult<Types.String | null>> => {
    return client.invoke<Types.String | null>({
      uri: "ens/interface.cache.polywrap.eth",
      method: "get",
      input
    });
  },

  has: async (
    input: Cache_Module_Input_has,
    client: Client
  ): Promise<InvokeResult<Types.Boolean>> => {
    return client.invoke<Types.Boolean>({
      uri: "ens/interface.cache.polywrap.eth",
      method: "has",
      input
    });
  },

  set: async (
    input: Cache_Module_Input_set,
    client: Client
  ): Promise<InvokeResult<Types.Boolean>> => {
    return client.invoke<Types.Boolean>({
      uri: "ens/interface.cache.polywrap.eth",
      method: "set",
      input
    });
  },

  add: async (
    input: Cache_Module_Input_add,
    client: Client
  ): Promise<InvokeResult<Types.Boolean>> => {
    return client.invoke<Types.Boolean>({
      uri: "ens/interface.cache.polywrap.eth",
      method: "add",
      input
    });
  },

  delete: async (
    input: Cache_Module_Input_delete,
    client: Client
  ): Promise<InvokeResult<Types.Boolean>> => {
    return client.invoke<Types.Boolean>({
      uri: "ens/interface.cache.polywrap.eth",
      method: "delete",
      input
    });
  },

  clear: async (
    input: Cache_Module_Input_clear,
    client: Client
  ): Promise<InvokeResult<Types.Boolean>> => {
    return client.invoke<Types.Boolean>({
      uri: "ens/interface.cache.polywrap.eth",
      method: "clear",
      input
    });
  }
}

/// Imported Modules END ///
