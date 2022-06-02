pub mod w3;
pub use w3::*;

pub fn chain_get_block_hash(input: InputChainGetBlockHash) -> CustomType {

  // How do I get the block hash from here?
  // A: Make an RPC call using HTTP (plugin)

  let url = "https://jsonplaceholder.typicode.com/photos/1";

  let response = HttpQuery.get(http_query::InputGet {
    url: url,
    request: {
      response_type: HttpResponseType::TEXT,
      headers: [{
        key: "user-agent",
        value: "HttpDemo"
      }],
      url_params: [{
        key: "dummyQueryParam",
        value: "20"
      }],
      body: ""
    }
  }).unwrap();

  CustomType {
    prop: input.argument
  }
}

/*
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
*/
