pub mod w3;
pub use w3::*;
use w3::imported::*;

pub fn chain_get_block_hash(input: InputChainGetBlockHash) -> CustomType {

  let url = String::from("https://jsonplaceholder.typicode.com/photos/1");

  let response = HttpQuery::get(&http_query::InputGet {
    url: url,
    request: Some(HttpRequest {
      response_type: HttpResponseType::TEXT,
      headers: Some(vec!(HttpHeader {
        key: String::from("user-agent"),
        value: String::from("HttpDemo")
      })),
      url_params: Some(vec!(HttpUrlParam {
        key: String::from("dummyQueryParam"),
        value: String::from("20")
      })),
      body: Some(String::from(""))
    })
  }).unwrap().unwrap();

  CustomType {
    prop: response.body.unwrap()
  }
}
