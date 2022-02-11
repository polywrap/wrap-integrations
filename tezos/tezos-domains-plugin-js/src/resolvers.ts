import { TezosDomainPlugin } from ".";
import { Query } from "./w3";
import * as Types from "./w3"

import { Client } from "@web3api/core-js";

// Query
export const query = (plugin: TezosDomainPlugin, client: Client): Query.Module => ({
  getAcquisitionInfo: async (
    input: Query.Input_getAcquisitionInfo
  ): Promise<Types.AcquisitionInfo> => {
    return plugin.getAcquisitionInfo(input)
  },

  bytesToHex: (
    input: Query.Input_bytesToHex
  ): string => {
    return plugin.bytesToHex(input);
  },

  char2Bytes: (
    input: Query.Input_char2Bytes
  ): string => {
    return plugin.encodeCharactersToBytes(input)
  }
});