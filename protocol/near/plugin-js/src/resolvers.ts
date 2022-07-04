import { NearPlugin } from ".";
import {
  Args_createKey,
  Args_createTransactionWithWallet,
  Args_getAccountId,
  Args_getPublicKey,
  Args_isSignedIn,
  Args_requestSignIn,
  Args_requestSignTransactions,
  Args_sendJsonRpc,
  Args_sendTransaction,
  Args_sendTransactionAsync,
  Args_signMessage,
  Args_signOut,
  Args_signTransaction,
} from "./wrap";

export const module = (plugin: NearPlugin) => ({
  requestSignIn: async (input: Args_requestSignIn) => {
    return await plugin.requestSignIn(input);
  },
  signOut: async (input: Args_signOut) => {
    return await plugin.signOut(input);
  },
  isSignedIn: async (input: Args_isSignedIn) => {
    return await plugin.isSignedIn(input);
  },
  getAccountId: async (input: Args_getAccountId) => {
    return await plugin.getAccountId(input);
  },
  getPublicKey: async (input: Args_getPublicKey) => {
    return await plugin.getPublicKey(input);
  },
  signMessage: async (input: Args_signMessage) => {
    return await plugin.signMessage(input);
  },
  createTransactionWithWallet: async (
    input: Args_createTransactionWithWallet
  ) => {
    return await plugin.createTransactionWithWallet(input);
  },
  signTransaction: async (input: Args_signTransaction) => {
    return await plugin.signTransaction(input);
  },
  sendJsonRpc: (input: Args_sendJsonRpc) => {
    return plugin.sendJsonRpc(input);
  },
  requestSignTransactions: (input: Args_requestSignTransactions) => {
    return plugin.requestSignTransactions(input);
  },
  sendTransaction: (input: Args_sendTransaction) => {
    return plugin.sendTransaction(input);
  },
  sendTransactionAsync: (input: Args_sendTransactionAsync) => {
    return plugin.sendTransactionAsync(input);
  },
  createKey: (input: Args_createKey) => {
    return plugin.createKey(input);
  },
});
