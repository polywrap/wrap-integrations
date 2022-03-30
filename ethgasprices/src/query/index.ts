import { JSON, Result, BigInt } from "@web3api/wasm-as";

import {
  Http_Header,
  Http_Query,  
  Http_Request,
  Http_ResponseType,
  Http_UrlParam,
  HistoricalEthereumGasPrice,
  Input_getGasData
} from "./w3";


export function getGasData(input: Input_getGasData) : HistoricalEthereumGasPrice {
  const date = input.request.date; 

  const csvStr = fetchGasPricesFromEtherScan(date);

  return {
    date : csvStr,
    gasPriceInWei : BigInt.fromUInt64(100)
  };
}

function fetchGasPricesFromEtherScan(date: string) : string {
  const response = Http_Query.get({
    url: " https://etherscan.io/chart/gasprice",
    request: {
      responseType: Http_ResponseType.TEXT,
      headers: [{
        key: "user-agent",
        value: "EthGasPriceWrapper"
      }],
      urlParams: [{
        key: "output",
        value: "csv"
      }],
      body: ""
    }
  }).unwrap();
  
  if (!response) {
    return "ERROR_NO_RESPONSE: fetchGasPricesFromEtherScan";
  }

  return response.body!;

  // TODO Parse text content.
}

