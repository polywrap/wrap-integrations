import {
  Concurrent_Module,
  Concurrent_ReturnWhen,
  Concurrent_TaskResult,
  FetchResult,
  HTTP_ResponseType,
} from "./wrap";
import {
  serializegetArgs,
  deserializegetResult,
} from "./wrap/imported/HTTP_Module/serialization";

export function asyncBatchFetch(): FetchResult[] {
  const posts = serializegetArgs({
    url: "https://jsonplaceholder.typicode.com/posts",
    request: {
      headers: [],
      urlParams: [],
      body: "",
      responseType: HTTP_ResponseType.TEXT,
    },
  });

  const users = serializegetArgs({
    url: "https://jsonplaceholder.typicode.com/users",
    request: {
      headers: [],
      urlParams: [],
      body: "",
      responseType: HTTP_ResponseType.TEXT,
    },
  });

  const comments = serializegetArgs({
    url: "https://jsonplaceholder.typicode.com/comments",
    request: {
      headers: [],
      urlParams: [],
      body: "",
      responseType: HTTP_ResponseType.TEXT,
    },
  });

  const taskIds: Array<i32> = Concurrent_Module.schedule({
    tasks: [
      {
        uri: "wrap://ens/http.polywrap.eth",
        method: "get",
        input: posts,
      },
      {
        uri: "wrap://ens/http.polywrap.eth",
        method: "get",
        input: users,
      },
      {
        uri: "wrap://ens/http.polywrap.eth",
        method: "get",
        input: comments,
      },
    ],
  }).unwrap();

  const results = Concurrent_Module.result({
    taskIds: taskIds,
    returnWhen: Concurrent_ReturnWhen.ALL_COMPLETED,
  }).unwrap();

  const parsedResults: Array<FetchResult> = [];

  for (let i = 0; i < results.length; i++) {
    if (results[i].result) {
      const parsed = deserializegetResult(results[i].result as ArrayBuffer);
      parsedResults.push({
        taskId: results[i].taskId,
        result: results[i].result,
        error: results[i].error,
        status: results[i].status,
        parsed: parsed,
      });
    } else {
      parsedResults.push({
        taskId: results[i].taskId,
        result: results[i].result,
        error: results[i].error,
        status: results[i].status,
        parsed: null,
      });
    }
  }

  return parsedResults;
}

export function batchFetch(): Concurrent_TaskResult[] {
  const posts = serializegetArgs({
    url: "https://jsonplaceholder.typicode.com/posts",
    request: {
      headers: [],
      urlParams: [],
      body: "",
      responseType: HTTP_ResponseType.TEXT,
    },
  });

  const users = serializegetArgs({
    url: "https://jsonplaceholder.typicode.com/users",
    request: {
      headers: [],
      urlParams: [],
      body: "",
      responseType: HTTP_ResponseType.TEXT,
    },
  });

  const comments = serializegetArgs({
    url: "https://jsonplaceholder.typicode.com/comments",
    request: {
      headers: [],
      urlParams: [],
      body: "",
      responseType: HTTP_ResponseType.TEXT,
    },
  });

  const taskIds: Array<i32> = Concurrent_Module.schedule({
    tasks: [
      {
        uri: "w3://ens/http.web3api.eth",
        method: "get",
        input: posts,
      },
      {
        uri: "w3://ens/http.web3api.eth",
        method: "get",
        input: users,
      },
      {
        uri: "w3://ens/http.web3api.eth",
        method: "get",
        input: comments,
      },
    ],
  }).unwrap();

  const results = Concurrent_Module.result({
    taskIds: taskIds,
    returnWhen: Concurrent_ReturnWhen.ALL_COMPLETED,
  }).unwrap();

  return results;
}
