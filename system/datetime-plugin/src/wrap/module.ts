/// NOTE: This is an auto-generated file.
///       All modifications will be overwritten.

import * as Types from "./types";

import {
  Client,
  PluginModule,
  MaybeAsync
} from "@polywrap/core-js";

export interface Input_currentTimestamp extends Record<string, unknown> {
}

export abstract class Module<
  TConfig extends Record<string, unknown>
> extends PluginModule<
  TConfig
> {

  abstract currentTimestamp(
    input: Input_currentTimestamp,
    client: Client
  ): MaybeAsync<Types.BigInt>;
}
