import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

export default class Oficina extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deposito: "Cargando...",
      wallet: "Cargando...",
      balanceBRUT: 0,
      precioBRUT: 0,
      tokenCompra: 0,
      usdCompra: 0,

    };

    this.estado = this.estado.bind(this);
    this.consultarPrecio = this.consultarPrecio.bind(this);
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.estado();
    setInterval(() => this.estado(),3*1000);
  };

  async consultarPrecio(){

    var proxyUrl = cons.proxy;
    var apiUrl = cons.PRICE;

    var response = {};
    try {
      response = await fetch(proxyUrl+apiUrl);
    } catch (err) {
      console.log(err);
      return this.state.precioBRUT;
    }

    console.log(this.state.precioBRUT);

    const json = await response.json();
    console.log(json);
    return json.Data.precio;

  };

  async estado(){

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var tronBRUT = await window.tronWeb;
    var contractBRUT = await tronBRUT.contract().at(cons.BRUT);

    var balanceBRUT = await contractBRUT.balanceOf(accountAddress).call();
    balanceBRUT = parseInt(balanceBRUT._hex)/10**6;

    var precioBRUT =  await this.consultarPrecio();

    var investor = await Utils.contract.investors(accountAddress).call();

    this.setState({
      wallet: accountAddress,
      precioBRUT: precioBRUT,
      balanceBRUT: balanceBRUT,
      tokenCompra: parseInt(investor.tokenCompra._hex)/10**6,
      usdCompra: parseInt(investor.usdCompra._hex)/10**6,
      tokenVenta: parseInt(investor.tokenVenta._hex)/10**6,
      usdVenta: parseInt(investor.usdVenta._hex)/10**6
    });

  }


  render() {


    return (


      <div className=" container text-center">
        <div className="row">
          
          <div className="col-lg-12 p-2">
            <div className="card">
            <br /><br />
              
              <h5 >
              wallet:<br />
                <strong>{this.state.wallet}</strong><br /><br />
              </h5>

              <h6 className="p-3">
                Brutus Token: <strong>{this.state.balanceBRUT}</strong> (BRUT) <br />
              
                Valor: <strong>{(this.state.balanceBRUT*this.state.precioBRUT)}</strong> (USDT)
              </h6>

              
            </div>
            
          </div>

          
        </div>

        <div className="row">

        <div className="col-lg-3 p-3">
            <div className="card">
            <br /><br />
            
              
              <h6 >
                <strong>Precio actual Brutus (BRUT)</strong><br />
              </h6>


              <h2>
                <strong>{this.state.precioBRUT}</strong> <br />
                (USDT)
              </h2>

            </div>
              
          </div>


          <div className="col-lg-3 p-3">
            <div className="card">
            <br /><br />
              
              
              <h6 >
                <strong>Promedio de Compra</strong><br />
              </h6>
              <p>
                Cantidad: <strong>{this.state.tokenCompra}</strong> (BRUT)<br /><br />
                Precio: <strong>{(this.state.usdCompra/this.state.tokenCompra)}</strong> (USDT)
              </p>
              <hr />
              <p>
                Total: <strong>{(this.state.usdCompra*1).toFixed(2)}</strong> (USDT)
              </p>

            </div>
              
          </div>

          <div className="col-lg-3 p-3">
            <div className="card">
            <br /><br />
              
              <h6 >
                <strong>Promedio de venta</strong><br />
              </h6>
              <p>
                Cantidad: <strong>{this.state.tokenVenta}</strong> (BRUT)<br /><br />
                Precio: <strong>{this.state.usdVenta/this.state.tokenVenta}</strong> (USDT)
              </p>
              <hr />
              <p>
                Total: <strong>{(this.state.usdVenta*1).toFixed(2)}</strong> (USDT)
              </p>

            </div>
              
          </div>

          <div className="col-lg-3 p-3">
            <div className="card">
            
            <br /><br />
        
              <h6 >
                <strong>Rentabilidad Obtenida</strong><br />
              </h6>
              <h5>
                <strong>{((this.state.balanceBRUT*this.state.precioBRUT*100)/(this.state.balanceBRUT*(this.state.usdCompra/this.state.tokenCompra))-100).toFixed(2)}</strong> %
              </h5>
              <h5>
                <strong>{((this.state.balanceBRUT*this.state.precioBRUT)-this.state.balanceBRUT*(this.state.usdCompra/this.state.tokenCompra)).toFixed(2)}</strong> (USDT)
              </h5>


            </div>
              
          </div>


        </div>
      </div>


    );
  }
}
