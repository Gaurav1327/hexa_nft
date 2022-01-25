import React, { useState, useEffect } from 'react';
import Web3 from 'web3'
import DrawingCollectible from './abis/DrawingCollectible.json'
import CanvasComponent from './getTwitterDP'
import { Container } from "@mui/material";
import './App.css'

function App() {

  const [deployedContract, setDeployedContract] = useState();
  const [account, setAccount] = useState();

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3
    const networkId = await web3.eth.net.getId()
    if (networkId !== 3) {
      window.alert('Please switch network to the Ropsten and refresh the page')
    }
    const networkData = DrawingCollectible.networks[networkId];
    if (networkData) {
      const contract_address = networkData.address;
      const contract = new web3.eth.Contract(DrawingCollectible.abi, contract_address);
      setDeployedContract(contract);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0])
    } else {
      alert("Wrong NETWORK")
    }
  }

  useEffect(() => {
    const load = async () => {
      await loadWeb3()
      await loadBlockchainData()
    }
    load();
  }, []);

  return (
    <Container>
    <div className="App">
      <h1>HexagoniFy your Twitter DP</h1>
      <p>Address: <b>{deployedContract?._address}</b> </p>      <CanvasComponent
        deployedContract={deployedContract}
        account={account}
      />
    </div>
    </Container>
  );
}

export default App;
