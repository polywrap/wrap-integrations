import { JSON } from "@polywrap/wasm-as";
import { HTTP_Module, HTTP_Response, HTTP_ResponseType } from "../wrap";

export function fetchJson(url: string, json: string | null): JSON.Value {
  let response: HTTP_Response | null;

  if (json != null) {
    response = HTTP_Module.post({
      url: url,
      request: {
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
        responseType: HTTP_ResponseType.TEXT,
        urlParams: null,
        body: json,
      },
    }).unwrap();
  } else {
    response = HTTP_Module.get({
      url: url,
      request: {
        headers: null,
        urlParams: null,
        body: null,
        responseType: HTTP_ResponseType.TEXT,
      },
    }).unwrap();
  }

  if (!response || response.status !== 200 || !response.body) {
    const errorMsg =
      response && response.statusText
        ? (response.statusText as string)
        : "An error occurred while fetching data";
    throw new Error(errorMsg);
  }

  const data = JSON.parse(response.body);

  return data;
}

export default fetchJson;
