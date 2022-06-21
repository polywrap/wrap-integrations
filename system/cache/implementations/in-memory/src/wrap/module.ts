/// NOTE: This is an auto-generated file.
///       All modifications will be overwritten.

import * as Types from "./types";

import {
  Client,
  PluginModule,
  MaybeAsync
} from "@polywrap/core-js";

export interface Input_get extends Record<string, unknown> {
  key: Types.String;
}

export interface Input_has extends Record<string, unknown> {
  key: Types.String;
}

export interface Input_set extends Record<string, unknown> {
  key: Types.String;
  value: Types.String;
  timeout?: Types.Int | null;
}

export interface Input_add extends Record<string, unknown> {
  key: Types.String;
  value: Types.String;
  timeout?: Types.Int | null;
}

export interface Input_delete extends Record<string, unknown> {
  key: Types.String;
}

export interface Input_clear extends Record<string, unknown> {
}

export abstract class Module<
  TConfig extends Record<string, unknown>
> extends PluginModule<
  TConfig
> {

  abstract get(
    input: Input_get,
    client: Client
  ): MaybeAsync<Types.String | null>;

  abstract has(
    input: Input_has,
    client: Client
  ): MaybeAsync<Types.Boolean>;

  abstract set(
    input: Input_set,
    client: Client
  ): MaybeAsync<Types.Boolean>;

  abstract add(
    input: Input_add,
    client: Client
  ): MaybeAsync<Types.Boolean>;

  abstract delete(
    input: Input_delete,
    client: Client
  ): MaybeAsync<Types.Boolean>;

  abstract clear(
    input: Input_clear,
    client: Client
  ): MaybeAsync<Types.Boolean>;
}
