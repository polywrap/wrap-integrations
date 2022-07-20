import { PluginFactory } from "@polywrap/core-js";
import {
  Args_add,
  Args_delete,
  Args_get,
  Args_has,
  Args_set,
  manifest,
  Module,
} from "./wrap";

export interface InMemoryCachePluginConfig extends Record<string, unknown> {
  cache?: Map<string, string>;
}

export class InMemoryCachePlugin extends Module<InMemoryCachePluginConfig> {
  private _cache: Map<string, string> = new Map();
  constructor(config: InMemoryCachePluginConfig) {
    super(config);

    if (config.cache) {
      config.cache.forEach((value, key) => {
        this._cache.set(key, value);
      });
    }
  }

  public set(input: Args_set): boolean {
    if (input.timeout) return false; // Timeout not implemented!
    this._cache.set(input.key, input.value);
    return true;
  }

  public add(input: Args_add): boolean {
    if (input.timeout) return false; // Timeout not implemented!
    if (this._cache.has(input.key)) return false;

    this._cache.set(input.key, input.value);
    return true;
  }

  public delete(input: Args_delete): boolean {
    return this._cache.delete(input.key);
  }

  public clear(): boolean {
    this._cache.clear();
    return true;
  }

  public get(input: Args_get): string | null {
    return this._cache.get(input.key) ?? null;
  }

  public has(input: Args_has): boolean {
    return this._cache.has(input.key);
  }
}

export const inMemoryCachePlugin: PluginFactory<InMemoryCachePluginConfig> = (
  config: InMemoryCachePluginConfig
) => {
  return {
    factory: () => new InMemoryCachePlugin(config),
    manifest: manifest,
  };
};

export const plugin = inMemoryCachePlugin;
