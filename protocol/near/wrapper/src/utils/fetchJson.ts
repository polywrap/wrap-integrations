import { JSON } from "@polywrap/wasm-as";
import { HTTP_Module, HTTP_ResponseType } from "../wrap";


export function fetchJson(url: string, json: string): JSON.Obj {
  const response = HTTP_Module.post({
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

  if (!response || response.status !== 200 || !response.body) {
    const errorMsg =
      response && response.statusText
        ? (response.statusText as string)
        : "An error occurred while fetching data from Avalanche API";
    throw new Error(errorMsg);
  }

  const data = <JSON.Obj>JSON.parse(response.body);

  return data;
}

export default fetchJson;
