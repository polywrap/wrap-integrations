import {
  Http_Module,
  Http_ResponseType,
  Http_Response,
  Http_Header,
  Http_UrlParam,
  Http_ResponseError,
  Http_Request,
  Args_catFile,
  Args_catFileToString,
  Args_resolve,
  Args_addFile,
  Args_addFolder,
  CatFileOptions,
  ResolveResult,
  IpfsOptions,
  AddResult,
  AddFileOptions,
  DirectoryBlob
} from "./wrap";
import {
  IpfsError,
  convertDirectoryBlobToFormData,
  parseAddDirectoryResponse,
  parseAddFileResponse
} from "./utils";

import { Option } from "@polywrap/wasm-as";
import { decode } from "as-base64"

export function catFileToString(args: Args_catFileToString): String {
  const result = executeOperation(
    args.ipfs,
    createRequest(args.catFileOptions, args.cid, Http_ResponseType.TEXT),
    "catFileToString",
    "/api/v0/cat"
  );
  return result.data;
}

export function catFile(args: Args_catFile): ArrayBuffer {
  const result = executeOperation(
    args.ipfs,
    createRequest(args.catFileOptions, args.cid, Http_ResponseType.BINARY),
    "catFile",
    "/api/v0/cat"
  );
  return decode(result.data).buffer;
}

export function resolve(args: Args_resolve): ResolveResult {
  const result = executeOperation(
    args.ipfs,
    createRequest(null, args.cid, Http_ResponseType.TEXT),
    "resolve",
    "/api/v0/resolve"
  );
  return {cid: result.data, provider: result.provider}
}

export function addFile(args: Args_addFile): AddResult {
  const addResponse = executeAddFileRequest(
    args.fileEntry.name,
    args.fileEntry.data,
    args.ipfsUrl,
    args.options
  );
  return parseAddFileResponse(addResponse.body);
}

export function addFolder(args: Args_addFolder): AddResult[] {
  const directoryEntry = args.directoryEntry;
  const ipfsUrl = args.ipfsUrl;
  const options = args.options;

  // form appropriate url
  let url = ipfsUrl.concat("/api/v0/add");
  if (options != null) {
    url = generateUrlWithOptions(url, options);
  }

  // invoke add method
  const addResponse = Http_Module.post({
    url: url,
    request: {
      headers: [],
      urlParams: [],
      responseType: Http_ResponseType.TEXT,
      body: {
        formDataBody: {
          data: convertDirectoryBlobToFormData(directoryEntry)
        },
        stringBody: null,
        rawBody: null
      },
      timeout: new Option<u32>()
    }
  }).unwrap();

  // return response
  if (addResponse == null || addResponse.status.value != 200) {
    throw new IpfsError("addFolder", addResponse.status.value, addResponse.statusText);
  }

  return parseAddDirectoryResponse(addResponse.body);
}

function executeAddFileRequest(name: string, data: ArrayBuffer, ipfsUrl: string, options: AddFileOptions | null): Http_Response {
  // form appropriate url
  let url = ipfsUrl.concat("/api/v0/add");
  if (options != null) {
    url = generateUrlWithOptions(url, options);
  }
  // invoke add method
  const addResponse = Http_Module.post({
    url: url,
    request: {
      headers: [],
      urlParams: [],
      responseType: Http_ResponseType.TEXT,
      body: {
        formDataBody: {
          data: [{ key: name, data: String.UTF8.decode(data), opts: null }]
        },
        rawBody: null,
        stringBody: null
      },
      timeout: new Option<u32>()
    }
  }).unwrap();

  // return response
  if (addResponse == null || addResponse.status.value != 200) {
    throw new IpfsError("addFile", addResponse.status.value, addResponse.statusText);
  }
  return addResponse;
}

class ExecutionResult {
  data: string;
  provider: string;
}

function executeOperation(
  ipfs: IpfsOptions,
  request: Http_Request,
  operation: string,
  operationUrl: string
): ExecutionResult {
  const provider = ipfs.provider;
  const fallbackProviders = ipfs.fallbackProviders != null ? ipfs.fallbackProviders as string[] : [];

  let complete = false;
  let fallbackIdx = -1;
  let result: string;

  while (!complete) {
    const url = provider + operationUrl;
    const response = Http_Module.get({
      url: url,
      request: request
    }).unwrap();

    // no response - shouldn't happen
    if (response == null) {
      throw new IpfsError(operation, response.status.value, response.statusText);
    }

    // error happend in http plugin
    if (response.error != null) {
      const err = response.error as Http_ResponseError;
      if (err.timeoutExcided) {
        fallbackIdx += 1;
        if (fallbackIdx >= fallbackProviders.length) {
          complete = true;
        }
        continue;
      } else {
        throw new IpfsError(operation, null, null, err.errorMessage);
      }
    }

    // not 200 response error
    if (response.status.value != 200) {
      throw new IpfsError(operation, response.status.value, response.statusText);
    }

    // succesfull request
    result = response.body as string;
    complete = true;
  }

  if (!result) {
    throw new IpfsError("Timeout has been exceeded, and all providers have been exhausted."); // TODO
  }

  return { data: result, provider }
}

function createRequest(catFileOptions: CatFileOptions | null, cid: string, responseType: Http_ResponseType): Http_Request {
  let headers: Http_Header[];
  let urlParams: Http_UrlParam[];
  let timeout: Option<u32>;

  urlParams = [{ key: "arg", value: cid }];

  if (catFileOptions) {
    const cfo = catFileOptions as CatFileOptions;
    if (cfo.headers) {
      headers = cfo.headers as Http_Header[];
    }
    if (cfo.queryString) {
      urlParams = urlParams.concat(cfo.queryString as Http_UrlParam[]);
    }
    if (cfo.length) {
      urlParams = urlParams.concat(
        [{ key: "length", value: cfo.length.value.toString() } as Http_UrlParam]
      );
    }
    if (cfo.offset) {
      urlParams = urlParams.concat(
        [{ key: "offset", value: cfo.offset.value.toString() } as Http_UrlParam]
      )
    }
    timeout = cfo.timeout;
  }

  return {
    headers,
    urlParams,
    // TODO - Add response type as parameter to CatFileOptions
    // so response can be returned as string or binary data
    // depends on https://github.com/Web3-API/monorepo/issues/246
    responseType: responseType,
    body: null,
    timeout: timeout
  }
}

function generateUrlWithOptions(baseUrl: string, options: AddFileOptions): string {
  let opts: string[] = [];
  if (!options.onlyHash.isNull) { opts.push("only-hash=" + options.onlyHash.value.toString()) }
  if (!options.pin.isNull) { opts.push("pin=" + options.pin.value.toString()) }
  if (!options.wrapWithDirectory.isNull) { opts.push("wrap-with-directory=" + options.wrapWithDirectory.value.toString()) }
  return baseUrl + "?" + opts.join("&");
}
