import {
  AddOptions,
  AddResult,
  Args_add,
  Args_addDir,
  Args_cat,
  Args_resolve,
  CatOptions,
  Http_FormDataEntry,
  Http_Module,
  Http_Request,
  Http_Response,
  Http_ResponseType,
  IpfsOptions
} from "./wrap";
import { convertDirectoryBlobToFormData, IpfsError, parseAddDirectoryResponse, parseAddResponse } from "./utils";

import { decode } from "as-base64";
import { Result } from "@polywrap/wasm-as";

export function cat(args: Args_cat): ArrayBuffer {
  const result = executeOperation(
    args.options,
    createRequest(args.cid, Http_ResponseType.BINARY, args.catOptions),
    "catFile",
    "/api/v0/cat"
  );
  return decode(result).buffer;
}

export function resolve(args: Args_resolve): string {
  return executeOperation(
    args.options,
    createRequest(args.cid, Http_ResponseType.TEXT),
    "resolve",
    "/api/v0/resolve"
  );
}

export function add(args: Args_add): AddResult {
  const key = args.data.name;
  const data = String.UTF8.decode(args.data.data);
  const addResponse = executeAdd(
    [{ key, data }],
    args.options,
    args.addOptions
  );
  return parseAddResponse(addResponse);
}

export function addDir(args: Args_addDir): AddResult[] {
  const addDirectoryResponse = executeAdd(
    convertDirectoryBlobToFormData(args.data),
    args.options,
    args.addOptions
  );
  return parseAddDirectoryResponse(addDirectoryResponse);
}

function executeOperation(
  ipfs: IpfsOptions,
  request: Http_Request,
  operation: string,
  operationUrl: string
): string {
  const url = ipfs.provider + operationUrl;
  const httpResult = Http_Module.get({ url, request });
  return unwrapHttpResult(operation, httpResult);
}

function executeAdd(data: Http_FormDataEntry[], options: IpfsOptions, addOptions: AddOptions | null = null): string {
  let url = options.provider + "/api/v0/add";
  const urlParams: Map<string, string> | null = getAddUrlParameters(addOptions);

  const httpResult = Http_Module.post({
    url: url,
    request: {
      urlParams,
      responseType: Http_ResponseType.TEXT,
      data
    }
  });

  return unwrapHttpResult("add", httpResult);
}

function createRequest(cid: string, responseType: Http_ResponseType, catOptions: CatOptions | null = null): Http_Request {
  const urlParams: Map<string, string> = new Map<string, string>();
  let headers: Map<string, string> | null = null;

  urlParams.set("arg", cid);

  if (catOptions !== null) {
    if (catOptions.headers !== null) {
      headers = catOptions.headers;
    }
    if (catOptions.queryString !== null) {
      const keys = catOptions.queryString!.keys();
      for (let i = 0; i < keys.length; i++) {
        urlParams.set(keys[i], catOptions.queryString!.get(keys[i]));
      }
    }
    if (catOptions.length !== null) {
      urlParams.set("length", catOptions.length!.unwrap().toString());
    }
    if (catOptions.offset !== null) {
      urlParams.set("offset", catOptions.offset!.unwrap().toString());
    }
  }

  return { headers, urlParams, responseType };
}

function getAddUrlParameters(options: AddOptions | null): Map<string, string> | null {
  if (options === null) return null;
  const urlParams = new Map<string, string>();
  if (options.onlyHash) {
    urlParams.set("only-hash", options.onlyHash!.unwrap().toString())
  }
  if (options.pin) {
    urlParams.set("pin", options.pin!.unwrap().toString())
  }
  if (options.wrapWithDirectory) {
    urlParams.set("wrap-with-directory", options.wrapWithDirectory!.unwrap().toString())
  }
  if (urlParams.size == 0) return null;
  return urlParams;
}

function unwrapHttpResult(operation: string, httpResult: Result<Http_Response | null, string>): string {
  if (httpResult.isErr) {
    throw new IpfsError(operation, null, null, httpResult.unwrapErr());
  }

  const response: Http_Response | null = httpResult.unwrap();

  if (response === null) {
    throw new IpfsError(operation);
  }

  if (response.status !== 200) {
    throw new IpfsError(operation, response.status, response.statusText);
  }

  if (response.body === null) {
    throw new IpfsError(operation);
  }

  return response.body!;
}
