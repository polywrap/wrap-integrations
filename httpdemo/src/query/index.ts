import { JSON, Result } from "@web3api/wasm-as";
import {
  Http_Header,
  Http_Query,  
  Http_Request,
  Http_ResponseType,
  Http_UrlParam
} from "./w3";

export function doOperation(): string {
  const photoUrl:string =  fetchPhotoUrl();
  const photoContent:string = fetchPhotoContent(photoUrl);
  const newPostResponse:string = createNewPost();
  return newPostResponse;

}

/**
 * Helper method to create new post.
 * 
 * This method performs http post operation using http plugin and verifies 
 * the response content.
 */
function createNewPost() : string {
  const newPostTitle = "NewPostTitle";
  const newPostBody = "NewPostBody  line1 line2";
  const newPostUserId = 1;

  /*
  TODO JSON.from does not support JSON.Obj. Use it once support is added in wasm-as core module. 
  const postPayload = JSON.from<JSON.Obj>({
    title: newPostTitle,
    body: newPostBody,
    userId: newPostUserId,
  }).toString();
 */ 
  const postPayload:string = `{ title: "${newPostTitle}",    body: "${newPostBody}",   userId: 1    }` 

  const response = Http_Query.post({
    url: "https://jsonplaceholder.typicode.com/posts",
    request: {
      responseType: Http_ResponseType.TEXT,
      headers:[{
        key: "user-agent",
        value: "HttpDemo"
      }],
      urlParams: [{
        key: "dummyQueryParam",
        value: "20"
      }],
      body: postPayload
    }
  }).unwrap();

  // Extract values from response json body.
  // We expect id, title, body, userId 
  const jsonResponse = JSON.parse(response!.body!) as JSON.Obj;
  const id = jsonResponse.getInteger("id")!.valueOf();
  // const responseUserId = jsonResponse.getInteger("userId")!.valueOf();
  // const responseBody = jsonResponse.getString("body")!.valueOf();
  // const responseTitle = jsonResponse.getString("title")!.valueOf();
  return jsonResponse.toString();
}

/**
 * Helper method to fetch binary content using http plugin.
 * 
 * @param photoUrl photo url.
 */
function fetchPhotoContent(photoUrl: string) : string {
  const response = Http_Query.get({
    url: photoUrl,
    request: {
      responseType: Http_ResponseType.BINARY,
      headers: [{
        key: "user-agent",
        value: "HttpDemo"
      }],
      urlParams: [{
        key: "dummyQueryParam",
        value: "20"
      }],
      body: ""
    }
  }).unwrap();

  // Binary response is base64 encoded and represented in this string. 
  const photoContent = response!.body!;
  // const photoBuffer:Buffer = Buffer.from(photoContent, 'base64');

  return photoContent.toString();
}

/**
 * Helper method to fetch text content using http plugin.
 *
 * @returns photo url.  
 */
function fetchPhotoUrl() : string {
  const photosFeedUrl = "https://jsonplaceholder.typicode.com/photos/1";
  const response = Http_Query.get({
    url: photosFeedUrl,
    request: {
      responseType: Http_ResponseType.TEXT,
      headers: [{
        key: "user-agent",
        value: "HttpDemo"
      }],
      urlParams: [{
        key: "dummyQueryParam",
        value: "20"
      }],
      body: ""
    }
  }).unwrap();

  const jsonResponse = JSON.parse(response!.body) as JSON.Obj;
  return jsonResponse.getString("url")!.toString();
}
