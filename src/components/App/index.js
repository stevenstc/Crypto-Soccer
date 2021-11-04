import React, { Component } from "react";

import Web3 from "web3";

import Home from "../V1Home";
import Fan from "../HomeFan";
import TronLinkGuide from "../TronLinkGuide";
import cons from "../../cons"

import abiToken from "../../token";
import abiMarket from "../../market";
import abiFan from "../../fan"

var addressToken = cons.TOKEN;
var addressMarket = cons.SC;
var addressFan = cons.SC2;
if(cons.WS){
  addressToken = cons.TokenTest;
  addressMarket = cons.SCtest;
  addressFan = cons.SC2test;
}


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      admin: false,
      metamask: false,
      conectado: false,
      currentAccount: null,
      binanceM:{
        web3: null,
        contractToken: null,
        contractMarket: null
      }
      
    };
  }

  async componentDidMount() {

      if (typeof window.ethereum !== 'undefined') {           
        var resultado = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log(resultado[0]);
          this.setState({
            currentAccount: resultado[0],
            metamask: true,
            conectado: true
          })

      } else {          
        this.setState({
          metamask: false,
          conectado: false
        })      
      }

      setInterval(async() => {
        if (typeof window.ethereum !== 'undefined') {           
          var resultado = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log(resultado[0]);
            this.setState({
              currentAccount: resultado[0],
              metamask: true,
              conectado: true
            })
  
        } else {          
          this.setState({
            metamask: false,
            conectado: false
          })      
        }

      },7*1000);


    try {         
      var web3 = new Web3(window.web3.currentProvider);// mainet... metamask
      var contractToken = new web3.eth.Contract(
        abiToken,
        addressToken
      );
      var contractMarket = new web3.eth.Contract(
        abiMarket,
        addressMarket
      );
      var contractFan = new web3.eth.Contract(
        abiFan,
        addressFan
      );

      this.setState({
        binanceM:{
          web3: web3,
          contractToken: contractToken,
          contractMarket: contractMarket,
          contractFan: contractFan
        }
      })
      //web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"));
    } catch (error) {
        alert(error);
    }  

  }


  render() {

    var getString = "";
    var loc = document.location.href;
    //console.log(loc);
    if(loc.indexOf('?')>0){
              
      getString = loc.split('?')[1];
      getString = getString.split('#')[0];

    }

    if (!this.state.metamask) return (<TronLinkGuide />);

    if (!this.state.conectado) return (<TronLinkGuide installed />);

    switch (getString) {
      case "v0":
      case "fan": 
        return(<Fan wallet={this.state.binanceM} currentAccount={this.state.currentAccount}/>);
      default:
        return(<Home wallet={this.state.binanceM} currentAccount={this.state.currentAccount}/>);
    }


  }
}
export default App;

// {tWeb()}
