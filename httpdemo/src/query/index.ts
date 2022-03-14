
import {
  Http_Query,  
  Input_doOperation,
  Http_Request,
  Http_ResponseType
} from "./w3";

export function doOperation(input: Input_doOperation): String {
  const response = Http_Query.get({
    url: input.url,
    request: {
      responseType: Http_ResponseType.TEXT,
      urlParams: [],
      headers: []
    }
  });
  
  if (response.isOk)
  {
    return "Ok:";
  }
  if (response.isErr)
  {
    return "Err:";
  }

  return "Dummy";
}

