import React, {  useEffect } from 'react';
import { harbinger_lib, helloworld, bw_harbinger } from './services/queries';
// import { mockdata } from './data/data';


function App() {

  async function init() {
    
    let harbinger = await harbinger_lib();
    console.log(harbinger);


    let response = await helloworld();
    console.log("response");
    console.log(response);


    let harbinger_response = await bw_harbinger();
    console.log("harbinger_response");
    console.log(harbinger_response);
    
  }

  useEffect(() => {
    init();
  }, []);



  return (
    <>
      
      <section>
        <h4 class="title">Harbinger Data Search</h4> <br></br>
        
        <div class="container">

          <div class="row">
            <div class="col-lg-12">
              <div class="card shadow mb-1 bg-white rounded" >
                <div class="card-body">
                  <div class="row">
                      <div class="col-lg-3">
                          <p class=""><i class="fas fa-code"></i> Engine</p>
                          <select class="selects" name="cars" id="cars">
                            <option value="plugin">Plugin</option>
                            <option value="polywraper">Polywraper</option>
                          </select>
                      </div>
                      <div class="col-lg-3">
                          <p class=""><i class="fas fa-network-wired"></i> Network</p>
                          <select class="selects" name="cars" id="cars">
                            <option value="mainNet">MainNet</option>
                            <option value="florencenet">Florencenet</option>
                            <option value="granadanet">Granadanet</option>
                          </select>
                      </div>
                      <div class="col-lg-3">
                          <p class=""><i class="fas fa-exchange-alt"></i> Exchange</p>
                          <select class="selects" name="cars" id="cars">
                            <option value="coinbase">Coinbase</option>
                            <option value="binance">Binance</option>
                            <option value="gemini">Gemini</option>
                            <option value="okex">OKEx</option>
                          </select>
                      </div>
                      <div class="col-lg-3">
                        <button class="searchbtn" type="button"> <i class="fas fa-search"></i> Search </button>
                      </div>
                  </div>
                </div>
              </div>
            </div> 
          </div> 

          <div class="row">
            <div class="col-lg-12">
              <div class="card shadow mb-1 bg-white rounded" >
                <div class="card-body">
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>Oracle Data for Asset</b></p>
                      </div>
                      <div class="col-lg-8">
                        <p class="">: BAT-USDC</p>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>Period Start</b></p>
                      </div>
                      <div class="col-lg-8">
                        <p class="">: 2022-01-16T16:36:00.000Z</p>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>Period End</b></p>
                      </div>
                      <div class="col-lg-8">
                        <p class="">: 2022-01-16T16:37:00.000Z</p>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>Open</b></p>
                      </div>
                      <div class="col-lg-8">
                        <p class="">: 1.07148</p>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>High</b></p>
                      </div>
                      <div class="col-lg-8">
                        <p class="">: 1.07148</p>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>Low</b></p>
                      </div>
                      <div class="col-lg-8">
                        <p class="">: 1.070723</p>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>Close</b></p>
                      </div>
                      <div class="col-lg-8">
                        <p class="">: 1.070896</p>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>Volume</b></p>
                      </div>
                      <div class="col-lg-8">
                        <p class="">: 612</p>
                      </div>
                  </div>

                </div>
              </div>
            </div> 
          </div> 

        </div>
        
      </section>

    </>
  )
}

export default App;
