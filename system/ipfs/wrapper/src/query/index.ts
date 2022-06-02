import {
  Http_Query,
  Http_Request,
  Http_ResponseType,
  Input_catFile,
  ExecutionResult,
  Input_resolve,
  ResolveResult,
  Input_catFileToString
} from "./w3";
import { decode } from "as-base64"

export namespace METHODS {
  export const cat = "/api/v0/cat"
  export const resolve = "/api/v0/resolve"
}

export function catFileToString(input: Input_catFileToString): string | null {
  const request: Http_Request = {
    responseType: Http_ResponseType.TEXT,
    headers: [],
    urlParams: [{ key: "arg", value: input.cid }],
    body: null
  }

  const result = executeOperation(
    input.options.provider,
    METHODS.cat,
    request
  )
  
  return result.data
}

export function catFile(input: Input_catFile): ArrayBuffer | null {
  const request: Http_Request = {
    responseType: Http_ResponseType.BINARY,
    headers: [],
    urlParams: [{ key: "arg", value: input.cid }],
    body: null
  }

  const result = executeOperation(
    input.options.provider,
    METHODS.cat,
    request
  )
  
  if (result.data) {
    return decode(result.data as string).buffer
  }
  return null
}

export function resolve(input: Input_resolve): ResolveResult {
  const request: Http_Request = {
    responseType: Http_ResponseType.TEXT,
    headers: [],
    urlParams: [{ key: "arg", value: input.cid }],
    body: null
  }

  const result = executeOperation(
    input.options.provider,
    METHODS.resolve,
    request
  )

  return {
    provider: input.options.provider,
    cid: result.data
  }
} 

function executeOperation(
  provider: string,
  endpoint: string,
  request: Http_Request
): ExecutionResult {
  let data: string = "";
  const response = Http_Query.post({
    url: provider.concat(endpoint),
    request
  })

  // if (response.isErr()) {
  //   return {
  //     provider,
  //     data: null,
  //     error: response.unwrapErr(),
  //   }
  // }

  const result = response.unwrap()

  if (result && result.body) {
    if (result.status != 200) {
      throw new Error("Error in method: ".concat(result.statusText))
    }

    return {
      provider: provider,
      error: null,
      data: result.body
    }
  }
  // throw new Error("Let's say this should not happen")
  return {
    provider: provider,
    error: null,
    data
  }}