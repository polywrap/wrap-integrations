import React, {  useEffect, useState } from 'react';
import { getAssetData } from './services/queries';

function App() {
  const [activeAsset, setActiveAsset] = useState('BTC-USD');
  const [network, setNetwork] = useState('mainnet');
  const [assetData, setAssetData] = useState(null);

  async function onLoad() {    
    const response = await getAssetData(activeAsset, network);
    if(response.data.getAssetData) {
      setAssetData(response.data.getAssetData);
    }
  }

  function handleOnAssetChange(e) {
    setActiveAsset(e.target.value);
  }
  
  function handleOnNetworkChange(e) {
    setNetwork(e.target.value);
  }

  useEffect(() => {
    onLoad();
  }, [network, activeAsset]);

  return (
    <>
      <section>
        <h4 className="title text-center mb-4">Harbinger Data Search</h4>  
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-1 bg-white rounded" >
                <div className="card-body">
                  <div className="row">
                      <div className="col-lg-3">
                        <p><i className="fas fa-network-wired"></i> Asset</p>
                        <select className="selects" name="asset" id="asset" value={activeAsset} onChange={handleOnAssetChange}>
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
                      <div className="col-lg-3">
                        <p><i className="fas fa-network-wired"></i> Network</p>
                        <select className="selects" name="network" id="network" onChange={handleOnNetworkChange}>
                          <option value="mainnet">Mainnet</option>
                          <option value="granadanet">Granadanet</option>
                        </select>
                      </div>
                  </div>
                </div>
              </div>
            </div> 
          </div> 
          {!assetData ? null : 
            <div className="row">
              <div className="col-lg-12">
                <div className="card shadow mb-1 bg-white rounded" >
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-3">
                        <p className="resph"><b>Asset</b></p>
                      </div>
                      <div className="col-lg-8">
                        <p>{assetData.asset || ""}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <p className="resph"><b>Period Start</b></p>
                      </div>
                      <div className="col-lg-8">
                        <p>{assetData.startPeriod || ""}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <p className="resph"><b>Period End</b></p>
                      </div>
                      <div className="col-lg-8">
                        <p>{assetData.endPeriod || ""}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <p className="resph"><b>Open</b></p>
                      </div>
                      <div className="col-lg-8">
                        <p>{assetData.open || ""}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <p className="resph"><b>High</b></p>
                      </div>
                      <div className="col-lg-8">
                        <p>{assetData.high || ""}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <p className="resph"><b>Low</b></p>
                      </div>
                      <div className="col-lg-8">
                        <p>{assetData.low || ""}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <p className="resph"><b>Close</b></p>
                      </div>
                      <div className="col-lg-8">
                        <p>{assetData.close || ""}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <p className="resph"><b>Volume</b></p>
                      </div>
                      <div className="col-lg-8">
                        <p>{assetData.volume || ""}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div> 
            </div>
          } 
        </div>
      </section>
    </>
  )
}

export default App;
