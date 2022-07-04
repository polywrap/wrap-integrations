import {
  wrap_getImplementations
} from "@polywrap/wasm-as";

export class Interface {
  static uri: string = "wrap://ens/logger.core.polywrap.eth"

  public static getImplementations(): string[] {
    return wrap_getImplementations(this.uri);
  }
}