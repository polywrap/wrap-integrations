import { EthersSolidity } from ".";
import { Query } from "./w3";

export const query = (plugin: EthersSolidity): Query.Module => ({
  pack: async (input: Query.Input_pack): Promise<string> => {
    return plugin.pack(input);
  },
  keccak256: async (input: Query.Input_keccak256): Promise<string> => {
    return plugin.keccak256(input);
  },
  sha256: async (input: Query.Input_sha256): Promise<string> => {
    return plugin.sha256(input);
  },
});
