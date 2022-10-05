import { toPluginTransaction } from "../utils/typeMapping";
import { Args_requestSignTransactions, Near_Module, Near_Near_Transaction } from "../wrap";
import {
  Args_requestSignIn,
  Args_isSignedIn,
  Args_getAccountId,
  Args_signOut,
} from "../wrap/imported/Near_Module/serialization";

export function requestSignIn(args: Args_requestSignIn): boolean {
  return Near_Module.requestSignIn({
    contractId: args.contractId,
    methodNames: args.methodNames,
    successUrl: args.successUrl,
    failureUrl: args.failureUrl,
  }).unwrap();
}

export function signOut(args: Args_signOut): boolean {
  return Near_Module.signOut(args).unwrap();
}

export function isSignedIn(args: Args_isSignedIn): boolean {
  return Near_Module.isSignedIn(args).unwrap();
}

export function getAccountId(args: Args_getAccountId): string | null {
  return Near_Module.getAccountId(args).unwrap();
}


export function requestSignTransactions(
  args: Args_requestSignTransactions
): boolean {
  return Near_Module.requestSignTransactions({
    transactions: args.transactions.map<Near_Near_Transaction>((tx) =>
      toPluginTransaction(tx)
    ),
    callbackUrl: args.callbackUrl,
    meta: args.meta,
  }).unwrap();
}

