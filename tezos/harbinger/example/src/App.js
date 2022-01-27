import React, {  useEffect, useState } from 'react';
import { getAssetData } from './services/queries';

function App() {
  const [activeAsset, setActiveAsset] = useState('BTC-USD');
  const [network, setNetwork] = useState('mainnet');
  const [assetData, setAssetData] = useState(null);

  async function onLoad() {    
    const response = await getAssetData();
    setAssetData(response);
  }

  useEffect(() => {
    onLoad();
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
                      <div class="col-lg-5 ">
                          <p class=""><i class="fas fa-network-wired"></i> Asset</p>
                          <select class="selects" name="asset" id="asset">
                            <option value="BTC-USD">BTC-USD</option>
                            <option value="ETH-USD">ETH-USD</option>
                            <option value="COMP-USD">COMP-USD</option>
                            <option value="LINK-USD">LINK-USD</option>
                            <option value="REP-USD">REP-USD</option>
                            <option value="XTZ-USD">XTZ-USD</option>
                            <option value="KNC-USD">KNC-USD</option>
                            <option value="DAI-USDC">DAI-USDC</option>
                            <option value="BAT-USDC">BAT-USDC</option>
                            <option value="ZRX-USD">ZRX-USD</option>
                          </select>
                      </div>
                      <div class="col-lg-5">
                          <p class=""><i class="fas fa-network-wired"></i> Network</p>
                          <select class="selects" name="network" id="network">
                            <option value="mainnet">Mainnet</option>
                            <option value="granadanet">Granadanet</option>
                          </select>
                      </div>
                      <div class="col-lg-2">
                        <button class="searchbtn" type="button"> <i class="fas fa-search"></i>Search</button>
                      </div>
                  </div>
                </div>
              </div>
            </div> 
          </div> 
          {}
          <div class="row">
            <div class="col-lg-12">
              <div class="card shadow mb-1 bg-white rounded" >
                <div class="card-body">
                  <div class="row">
                      <div class="col-lg-3">
                        <p class="resph"><b>Asset</b></p>
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
