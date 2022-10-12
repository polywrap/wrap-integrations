import {
  Args_cat,
  Http_Module,
  Http_Request,
  Http_Response,
  Http_ResponseType,
} from "./wrap";

import { decode } from "as-base64";
import { Result } from "@polywrap/wasm-as";

export function cat(args: Args_cat): ArrayBuffer {
  const url = args.ipfsProvider + "/api/v0/cat";
  const request: Http_Request = {
    urlParams: new Map<string, string>().set("arg", args.cid),
    responseType: Http_ResponseType.BINARY,
    timeout: args.timeout
  };
  const httpResult = Http_Module.get({ url, request });
  const result = unwrapHttpResult(httpResult);
  return decode(result).buffer;
}

function unwrapHttpResult(httpResult: Result<Http_Response | null, string>): string {
  if (httpResult.isErr) {
    const message = parseHttpError(httpResult.unwrapErr());
    throw new Error(`IPFS method 'cat' failed. ${message}`);
  }

  const response: Http_Response | null = httpResult.unwrap();

  if (response === null) {
    throw new Error("IPFS method 'cat' failed. Http Response is null");
  }

  if (response.status !== 200) {
    throw new Error(`IPFS method 'cat' failed. Http error. Status code: ${response.status}. Status: ${response.statusText}`);
  }

  if (response.body === null) {
    throw new Error("IPFS method 'cat' failed. Http Response body is null");
  }

  return response.body!;
}

function parseHttpError(message: string): string {
  if (message.startsWith("Error: ")) {
    message = message.substring(7);
    message = message.charAt(0).toUpperCase() + message.substring(1);
  }
  return message;
}

