import { Module, Args_sleep, manifest } from "./wrap";

import { PluginFactory } from "@polywrap/core-js";

interface SleepPluginConfig extends Record<string, unknown> {
  onWake?: () => boolean;
}

export class SleepPlugin extends Module<SleepPluginConfig> {

  constructor(config: SleepPluginConfig) {
    super(config);
  }

  public async sleep(args: Args_sleep): Promise<boolean | null> {
    await new Promise((r) => setTimeout(r, args.ms));
    return this.config.onWake?.() ?? null;
  }
}

export const sleepPlugin: PluginFactory<SleepPluginConfig> = (
  config: SleepPluginConfig
) => {
  return {
    factory: () => new SleepPlugin(config),
    manifest,
  };
};

export const plugin = sleepPlugin;