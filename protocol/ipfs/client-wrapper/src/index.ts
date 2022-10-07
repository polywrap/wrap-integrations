import {
  AddOptions,
  AddResult,
  Args_addFile,
  Args_addDir,
  Args_cat,
  Args_resolve,
  CatOptions,
  ResolveOptions,
  Http_FormDataEntry,
  Http_Module,
  Http_Request,
  Http_Response,
  Http_ResponseType,
} from "./wrap";
import {
  convertDirectoryBlobToFormData,
  IpfsError,
  parseAddDirectoryResponse,
  parseAddResponse
} from "./utils";

import { decode } from "as-base64";
import { Result } from "@polywrap/wasm-as";

export function cat(args: Args_cat): ArrayBuffer {
  const result = executeGetOperation(
    args.ipfsProvider,
    createCatRequest(args.cid, Http_ResponseType.BINARY, args.catOptions),
    "catFile",
    "/api/v0/cat"
  );
  return decode(result).buffer;
}

export function resolve(args: Args_resolve): string {
  return executeGetOperation(
    args.ipfsProvider,
    createResolveRequest(args.cid, Http_ResponseType.TEXT, args.resolveOptions),
    "resolve",
    "/api/v0/resolve"
  );
}

export function addFile(args: Args_addFile): AddResult {
  const request = createAddRequest([{
      name: args.data.name,
      value: String.UTF8.decode(args.data.data),
      fileName: args.data.name,
      _type: "application/octet-stream"
    }],
    Http_ResponseType.TEXT,
    args.addOptions
  );
  const addResponse = executePostOperation(
    args.ipfsProvider,
    request,
    "add",
    "/api/v0/add"
  );
  return parseAddResponse(addResponse);
}

export function addDir(args: Args_addDir): AddResult[] {
  const request = createAddRequest(
    convertDirectoryBlobToFormData(args.data),
    Http_ResponseType.TEXT,
    args.addOptions
  );
  const addDirectoryResponse = executePostOperation(
    args.ipfsProvider,
    request,
    "addDir",
    "/api/v0/add"
  );
  return parseAddDirectoryResponse(addDirectoryResponse);
}

function createCatRequest(cid: string, responseType: Http_ResponseType, options: CatOptions | null = null): Http_Request {
  const urlParams: Map<string, string> = new Map<string, string>();

  urlParams.set("arg", cid);

  if (options !== null) {
    if (options.length !== null) {
      urlParams.set("length", options.length!.unwrap().toString());
    }
    if (options.offset !== null) {
      urlParams.set("offset", options.offset!.unwrap().toString());
    }
  }

  return { urlParams, responseType };
}

function createResolveRequest(cid: string, responseType: Http_ResponseType, options: ResolveOptions | null = null): Http_Request {
  const urlParams: Map<string, string> = new Map<string, string>();

  urlParams.set("arg", cid);

  if (options !== null) {
    if (options.recursive !== null) {
      urlParams.set("recursive", options.recursive!.unwrap().toString());
    }
    if (options.dhtRecordCount !== null) {
      urlParams.set("dht-record-count", options.dhtRecordCount!.unwrap().toString());
    }
    if (options.dhtTimeout !== null) {
      urlParams.set("dht-timeout", options.dhtTimeout!);
    }
  }

  return { urlParams, responseType };
}

function createAddRequest(data: Http_FormDataEntry[], responseType: Http_ResponseType, options: AddOptions | null = null): Http_Request {
  const headers: Map<string, string> = new Map<string, string>();
  headers.set("Content-Type", "multipart/form-data");

  let urlParams: Map<string, string> | null = null;

  if (options !== null) {
    urlParams = new Map<string, string>();
    if (options.onlyHash) {
      urlParams.set("only-hash", options.onlyHash!.unwrap().toString())
    }
    if (options.pin) {
      urlParams.set("pin", options.pin!.unwrap().toString())
    }
    if (options.wrapWithDirectory) {
      urlParams.set("wrap-with-directory", options.wrapWithDirectory!.unwrap().toString())
    }
  }

  return { headers, urlParams, responseType, data };
}

function executeGetOperation(
  provider: string,
  request: Http_Request,
  operation: string,
  operationUrl: string
): string {
  const url = provider + operationUrl;
  const httpResult = Http_Module.get({ url, request });
  return unwrapHttpResult(operation, httpResult);
}

function executePostOperation(
  provider: string,
  request: Http_Request,
  operation: string,
  operationUrl: string
): string {
  const url = provider + operationUrl;
  const httpResult = Http_Module.post({ url, request });
  return unwrapHttpResult(operation, httpResult);
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
