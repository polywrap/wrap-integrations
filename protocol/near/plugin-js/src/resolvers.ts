import { NearPlugin } from ".";
import {
  Input_createKey, Input_createTransactionWithWallet, Input_getAccountId,
  Input_getPublicKey, Input_isSignedIn, Input_requestSignIn, Input_requestSignTransactions, Input_sendJsonRpc,
  Input_sendTransaction,
  Input_sendTransactionAsync, Input_signMessage,
  Input_signOut, Input_signTransaction
} from "./wrap";

export const module = (plugin: NearPlugin) => ({
  requestSignIn: async (input: Input_requestSignIn) => {
    return await plugin.requestSignIn(input);
  },
  signOut: async (input: Input_signOut) => {
    return await plugin.signOut(input);
  },
  isSignedIn: async (input: Input_isSignedIn) => {
    return await plugin.isSignedIn(input);
  },
  getAccountId: async (input: Input_getAccountId) => {
    return await plugin.getAccountId(input);
  },
  getPublicKey: async (input: Input_getPublicKey) => {
    return await plugin.getPublicKey(input);
  },
  signMessage: async (input: Input_signMessage) => {
    return await plugin.signMessage(input);
  },
  createTransactionWithWallet: async (
    input: Input_createTransactionWithWallet
  ) => {
    return await plugin.createTransactionWithWallet(input);
  },
  signTransaction: async (input: Input_signTransaction) => {
    return await plugin.signTransaction(input);
  },
  sendJsonRpc: (input: Input_sendJsonRpc) => {
    return plugin.sendJsonRpc(input);
  },
  requestSignTransactions: (input: Input_requestSignTransactions) => {
    return plugin.requestSignTransactions(input);
  },
  sendTransaction: (input: Input_sendTransaction) => {
    return plugin.sendTransaction(input);
  },
  sendTransactionAsync: (input: Input_sendTransactionAsync) => {
    return plugin.sendTransactionAsync(input);
  },
  createKey: (input: Input_createKey) => {
    return plugin.createKey(input);
  },
});
