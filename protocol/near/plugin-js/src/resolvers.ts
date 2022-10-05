import { NearPlugin } from ".";
import {
  Args_createKey,
  Args_createTransactionWithWallet,
  Args_getAccountId,
  Args_getPublicKey,
  Args_isSignedIn,
  Args_requestSignIn,
  Args_requestSignTransactions,
  Args_signMessage,
  Args_signOut,
} from "./wrap";

export const module = (plugin: NearPlugin) => ({
  requestSignIn: async (args: Args_requestSignIn) => {
    return await plugin.requestSignIn(args);
  },
  signOut: async (args: Args_signOut) => {
    return await plugin.signOut(args);
  },
  isSignedIn: async (args: Args_isSignedIn) => {
    return await plugin.isSignedIn(args);
  },
  getAccountId: async (args: Args_getAccountId) => {
    return await plugin.getAccountId(args);
  },
  getPublicKey: async (args: Args_getPublicKey) => {
    return await plugin.getPublicKey(args);
  },
  signMessage: async (args: Args_signMessage) => {
    return await plugin.signMessage(args);
  },
  createTransactionWithWallet: async (
    args: Args_createTransactionWithWallet
  ) => {
    return await plugin.createTransactionWithWallet(args);
  },
  /* signTransaction: async (args: Args_signTransaction) => {
    return await plugin.signTransaction(args);
  }, */
  /* sendJsonRpc: (args: Args_sendJsonRpc) => {
    return plugin.sendJsonRpc(args);
  }, */
  requestSignTransactions: (args: Args_requestSignTransactions) => {
    return plugin.requestSignTransactions(args);
  },
  /* sendTransaction: (args: Args_sendTransaction) => {
    return plugin.sendTransaction(args);
  }, */
  /* sendTransactionAsync: (args: Args_sendTransactionAsync) => {
    return plugin.sendTransactionAsync(args);
  }, */
  createKey: (args: Args_createKey) => {
    return plugin.createKey(args);
  },
});
