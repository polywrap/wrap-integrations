import { TezosDomainPlugin } from ".";
import { Query, Mutation } from "./w3";
import * as Types from "./w3"

import { Client } from "@web3api/core-js";

// Query
export const query = (plugin: TezosDomainPlugin, client: Client): Query.Module => ({
  resolveDomain: async (
    input: Query.Input_resolveDomain
  ): Promise<string> => {
    return plugin.resolveDomain(input);
  },

  resolveAddressToDomain: async (
    input: Query.Input_resolveAddressToDomain
  ): Promise<string> => {
    return plugin.resolveAddressToDomain(input);
  },

  resolveDomainRecords: async (
    input: Query.Input_resolveDomainRecords
  ): Promise<Types.DomainRecords | null> => {
    return plugin.resolveDomainRecords(input);
  },

  getSupportedTlds: async (
    input: Query.Input_getSupportedTlds
  ): Promise<string[]> => {
    return plugin.getSupportedTlds(input);
  },

  getAcquisitionInfo: async (
    input: Query.Input_getAcquisitionInfo
  ): Promise<Types.AcquisitionInfo> => {
    return plugin.getAcquisitionInfo(input)
  }
});


// Mutation
export const mutation = (plugin: TezosDomainPlugin, client: Client): Mutation.Module => ({
  setSignerWithSecretKeyParams: async (
    input: Mutation.Input_setSignerWithSecretKeyParams
  ): Promise<Types.Result> => {
    return plugin.setSignerWithSecretKeyParams(input);
  },

  setSignerWithFundraiserParams: async (
    input: Mutation.Input_setSignerWithFundraiserParams
  ): Promise<Types.Result> => {
    return plugin.setSignerWithFundraiserParams(input);
  },

  updateDomainRecord: async (
    input: Mutation.Input_updateDomainRecord
  ): Promise<Types.Result> => {
    return plugin.updateDomainRecord(input);
  },

  buyDomain: async (
    input: Mutation.Input_buyDomain
  ): Promise<Types.Result> => {
    return plugin.buyDomain(input);
  },

  createSubDomain: async (
    input: Mutation.Input_createSubDomain
  ): Promise<Types.Result> => {
    return plugin.createSubDomain(input);
  }
})