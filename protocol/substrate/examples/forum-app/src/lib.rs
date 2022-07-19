use std::collections::BTreeMap;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

const URI: &str = "wrap://ipfs/QmUShkhii5JUM9t3RnZtS2kTUqReSjNVHQ9NaMzEMazqJ9";

#[wasm_bindgen]
extern "C" {

    #[derive(Debug)]
    type PolywrapClientWrapper;

    #[wasm_bindgen(constructor)]
    fn new() -> PolywrapClientWrapper;

    #[wasm_bindgen(method)]
    async fn invoke_method(this: &PolywrapClientWrapper, method: &str, args: JsValue) -> JsValue;

    #[wasm_bindgen(method)]
    async fn invoke(this: &PolywrapClientWrapper, args: JsValue) -> JsValue;
}

#[wasm_bindgen(start)]
pub async fn start_up() {
    console_log::init_with_level(log::Level::Trace).ok();
    console_error_panic_hook::set_once();
    log::info!("starting...");
    let client = PolywrapClientWrapper::new();
    log::info!("client: {:#?}", client);
    let arg = BTreeMap::from_iter([("url", "http://localhost:9933")]);

    let ret = client
        .invoke_method(
            "chainGetMetadata",
            JsValue::from_serde(&serde_json::to_value(arg).expect("must convert"))
                .expect("must convert"),
        )
        .await;
    log::info!("ret: {:#?}", ret);

    let arg2 = serde_json::json!(
        {
          "uri": URI,
          "method": "chainGetMetadata",
            "args": {
              "url": "http://localhost:9933",
            }
        }
    );

    let ret2 = client
        .invoke(JsValue::from_serde(&arg2).expect("must convert"))
        .await;
    log::info!("ret2: {:#?}", ret2);
    log::info!("Done..");
}
