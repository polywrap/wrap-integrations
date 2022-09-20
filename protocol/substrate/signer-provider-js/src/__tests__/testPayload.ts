import { SignerPayloadJSON } from '../wrap';

/**
 * Produces a minimal valid extrinsic payload in JSON form that can be used in testing
 */
export const testPayload = (address: string): SignerPayloadJSON => ({
  address,
  blockHash: "0x91820de8e05dc861baa91d75c34b23ac778f5fb4a88bd9e8480dbe3850d19a26",
  blockNumber: "0",
  era: "0x0703",
  genesisHash: "0x91820de8e05dc861baa91d75c34b23ac778f5fb4a88bd9e8480dbe3850d19a26",
  method: "0x0900142248692122",
  nonce: "0",
  specVersion: "1",
  tip: "0",
  transactionVersion: "",
  signedExtensions: [],
  version: 4,
});
