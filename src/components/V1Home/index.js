import React, { Component } from "react";
import cons from "../../cons"
const BigNumber = require('bignumber.js');
const Cryptr = require('cryptr');

const cryptr = new Cryptr(cons.SCK);

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inventario: [],
      itemsYoutube: [],
      balance: "Loading...",
      balanceGAME: "Loading...",
      email: "Loading...",
    }

    this.balance = this.balance.bind(this);
    this.balanceInMarket = this.balanceInMarket.bind(this);
    this.balanceInGame = this.balanceInGame.bind(this);
    this.inventario = this.inventario.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.update = this.update.bind(this);
  }

  async componentDidMount() {

    await this.update();
    
  }

  async update() {
    await this.balance();
    await this.balanceInMarket();
    await this.inventario();
    await this.balanceInGame();

  }

  async balance() {
    var balance =
      await this.props.wallet.contractToken.methods
        .balanceOf(this.props.currentAccount)
        .call({ from: this.props.currentAccount });

    balance = new BigNumber(balance);
    balance = balance.shiftedBy(-18);
    balance = balance.decimalPlaces(6)
    balance = balance.toString();

    //console.log(balance)

    this.setState({
      balance: balance
    });
  }

  async updateEmail() {
    var email = "example@gmail.com";
    email = await window.prompt("enter your email", "example@gmail.com");
    

    var investor =
      await this.props.wallet.contractMarket.methods
        .investors(this.props.currentAccount)
        .call({ from: this.props.currentAccount });

    

    if(window.confirm("is correct?: "+email)){
      const encryptedString = cryptr.encrypt(email);
      if (investor.registered) {
        await this.props.wallet.contractMarket.methods
          .updateRegistro(encryptedString)
          .send({ from: this.props.currentAccount });
      }else{
        await this.props.wallet.contractMarket.methods
          .registro(encryptedString)
          .send({ from: this.props.currentAccount });
      }

      alert("email Updated");

    }
    this.update();
    
  }

  async balanceInMarket() {
    var investor =
      await this.props.wallet.contractMarket.methods
        .investors(this.props.currentAccount)
        .call({ from: this.props.currentAccount });

        //console.log(investor)

    var balance = investor.balance;
    var gastado = investor.gastado;
    var email = investor.correo;

    console.log(email.length);


    if (email === "" || email.length < 100) {
      email = "Please update your email";
    }else{
      email = cryptr.decrypt(investor.correo)
      
    }

    balance = new BigNumber(balance);
    gastado = new BigNumber(gastado);
    balance = balance.minus(gastado);
    balance = balance.shiftedBy(-18);
    balance = balance.decimalPlaces(6)
    balance = balance.toString();

    //console.log(balance)

    this.setState({
      balanceMarket: balance,
      email: email
    });
  }

  async balanceInGame() {
    var balance = await fetch(cons.API+"api/v1/coins/"+this.props.currentAccount)

    balance = await balance.text();

    this.setState({
      balanceGAME: balance
    });
  }

  async buyCoins(amount){

    var aprovado = await this.props.wallet.contractToken.methods
      .allowance(this.props.currentAccount, this.props.wallet.contractMarket._address)
      .call({ from: this.props.currentAccount });

    aprovado = new BigNumber(aprovado);
    aprovado = aprovado.shiftedBy(-18);
    aprovado = aprovado.decimalPlaces(2).toNumber();

    var balance = await this.props.wallet.contractToken.methods
    .balanceOf(this.props.currentAccount)
    .call({ from: this.props.currentAccount });

    balance = new BigNumber(balance);
    balance = balance.shiftedBy(-18);
    balance = balance.decimalPlaces(2).toNumber();

    var compra;
    compra = amount+"000000000000000000";
    amount = new BigNumber(amount);

    amount = amount.decimalPlaces(2).toNumber();

    if(aprovado > 0){

      if (balance>=amount) {

        var result = await this.props.wallet.contractMarket.methods
        .buyCoins(compra)
        .send({ from: this.props.currentAccount });
  
        if(result){
          alert("coins buyed");
        }
        
      }else{
        alert("insuficient founds")
      }

    }else{
      alert("insuficient aproved balance")
      await this.props.wallet.contractToken.methods
      .approve(this.props.wallet.contractMarket._address, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
      .send({ from: this.props.currentAccount });

    }

    this.update();

    
  }

 

  async inventario() {

    var result = await this.props.wallet.contractMarket.methods
      .largoInventario(this.props.currentAccount)
      .call({ from: this.props.currentAccount });

      var inventario = []

    for (let index = 0; index < result; index++) {
      var item = await this.props.wallet.contractMarket.methods
        .inventario(this.props.currentAccount, index)
        .call({ from: this.props.currentAccount });

        inventario[index] = (

          <div className="col-lg-3 col-md-6 p-1" key={`itemsTeam-${index}`}>
            <img className="pb-4" src={"assets/img/" + item.nombre + ".png"} width="100%" alt={"team "+item.nombre} />
          </div>

        )
    }

    this.setState({
      inventario: inventario
    })
  }

  render() {
    return (
      <>
        <header className="masthead text-center text-white">
          <div className="masthead-content">
            <div className="container px-5">
              
              <div className="row">
                <div className="col-lg-12 col-md-12 p-4 text-center">
                  <h2 className=" pb-4">Coin Packs</h2>
                </div>

                <div className="col-lg-4 col-md-12 p-4 text-center monedas">
                  <h2 className=" pb-4">100 WCSC</h2>
                  <img
                    className=" pb-4"
                    src="assets/img/01.png"
                    width="100%"
                    alt=""
                  />
                  <div
                    className="position-relative btn-monedas"
                    onClick={() => this.buyCoins(100)}
                  >
                    <span className="position-absolute top-50 end-0 translate-middle-y p-5">
                      BUY
                    </span>
                  </div>
                </div>

                <div 
                  className="col-lg-4 col-md-12 p-4 monedas"
                  onClick={() => this.buyCoins(500)}
                
                >
                  
                  <h2 className=" pb-4">500 WCSC</h2>
                  <img
                    className=" pb-4"
                    src="assets/img/02.png"
                    width="100%"
                    alt=""
                  />
                  <div
                    className="position-relative btn-monedas"
                  >
                    <span className="position-absolute top-50 end-0 translate-middle-y p-5">
                      BUY
                    </span>
                  </div>
                </div>

                <div 
                  className="col-lg-4 col-md-12 p-4 monedas"
                  onClick={() => this.buyCoins(1000)}
                >
                  <h2 className=" pb-4">1000 WCSC</h2>
                  <img
                    className=" pb-4"
                    src="assets/img/03.png"
                    width="100%"
                    alt=""
                  />
                  <div
                    className="position-relative btn-monedas"
                  >
                    <span className="position-absolute top-50 end-0 translate-middle-y p-5">
                      BUY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mt-3 mb-3">
          <div className="row text-center">
            <div className="col-lg-4 col-md-4 ">
              <h2>Wallet conected</h2>
              <p>{this.props.currentAccount}</p>
            </div>

            <div className="col-lg-4 col-md-4 ">
              <button
                className="btn btn-success"
                onClick={() => this.update()}
              >
               <i class="fas fa-sync"></i> Refresh Info
              </button>
            </div>

            <div className="col-lg-4 col-md-4">
              <h2>Email registred</h2>
              {this.state.email}
              <br />
              <button
                className="btn btn-secondary"
                onClick={() => this.updateEmail()}
              >
                <i class="fas fa-envelope-open-text"></i> Update Email
              </button>
            </div>

          </div>
          <hr></hr>
          <div className="row text-center">
          
            <div className="col-lg-4 col-md-12 mt-2">
            <img
                src="assets/favicon.ico"
                className="meta-gray"
                width="100"
                height="100" 
                alt="markert info"/>

            <h3>MARKET</h3>
              <span>
                CSC: {this.state.balance}
              </span>
              <br/><br/>
              
              <button
                className="btn btn-primary"
                onClick={async() => 
                { 
                  
                  var cantidad = await prompt("Enter the amount of coins to send to EXCHANGE");

                  if(parseInt(cantidad) >= 100 ){
                    await this.buyCoins(cantidad);
                  }else{
                    alert("please enter valid amount");
                  }

                  this.update();

                }}
              >
                {" "}
                Buy WCSC {" -> "}
              </button>

            </div>

            <div className="col-lg-4 col-md-12  mt-2">
            <img
                src="assets/favicon.ico"
                className="meta-gray"
                width="100"
                height="100" 
                alt="markert info"/>

            <h3>EXCHANGE</h3>
              <span>
                WCSC: {this.state.balanceMarket}
              </span>
              <br/><br/>
              <button
                className="btn btn-primary"
                onClick={async() => 
                { 
                  var cantidad = await prompt("Enter the amount of coins to withdraw to your wallet");

                  var result = await this.props.wallet.contractMarket.methods
                  .sellCoins(cantidad+"000000000000000000")
                  .send({ from: this.props.currentAccount });

                  alert("your hash transaction: "+result.transactionHash)

                  this.update();

                }}
              >
                {"<- "}
                Sell WCSC
              </button>
              <br/><br/>
              <button
                className="btn btn-primary"
                onClick={async() => {

                  var cantidad = await prompt("Enter the amount of coins to withdraw to GAME");

                  var gasLimit = await this.props.wallet.contractMarket.methods.gastarCoinsfrom(cantidad+"000000000000000000",  this.props.currentAccount).estimateGas({from: cons.WALLETPAY});
                  
                  gasLimit = gasLimit*cons.FACTOR_GAS;

                  console.log(gasLimit)

                  var usuario = await this.props.wallet.contractMarket.methods.investors(this.props.currentAccount).call({from: this.props.currentAccount});
                  var balance = new BigNumber(usuario.balance);
                  balance = balance.minus(usuario.gastado);
                  balance = balance.shiftedBy(-18);
                  balance = balance.decimalPlaces(0).toNumber();
                  console.log(balance)
                  console.log(parseInt(cantidad))

                  if(balance-parseInt(cantidad) >= 0){
                    var tx = await this.props.wallet.web3.eth.sendTransaction({
                      from: this.props.currentAccount,
                      to: cons.WALLETPAY,
                      value: gasLimit+"0000000000"
                    })

                    if(tx.status)

                    var resultado = await fetch(cons.API+"api/v1/coinsaljuego/"+this.props.currentAccount,
                    {
                      method: 'POST', // *GET, POST, PUT, DELETE, etc.
                      headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: JSON.stringify({token: cons.SCKDTT, coins: cantidad}) // body data type must match "Content-Type" header
                    })
                    
                    if(await resultado.text() === "true"){
                      alert("Coins send to GAME")
                    }else{
                      alert("send failed")
                    }
                  }else{
                    alert("insuficient founds")
                  }
                  this.update()
                }}
              >
                {" "}
                Send WCSC To Game {" ->"}
              </button>
            </div>

            <div className="col-lg-4 col-md-12  mt-2">
            <img
                src="assets/favicon.ico"
                className="meta-gray"
                width="100"
                height="100" 
                alt="markert info"/>

            <h3>IN GAME</h3>
              <span>
                WCSC: {this.state.balanceGAME}
              </span>
             
              <br/><br/>
              <button
                className="btn btn-primary"
                onClick={async() => {

                  var cantidad = await prompt("Enter the amount of coins to withdraw to EXCHANGE");

                  if(cantidad >= 500 && cantidad <= 10000){
                  
                    var gasLimit = await this.props.wallet.contractMarket.methods.asignarCoinsTo(cantidad+"000000000000000000",  this.props.currentAccount).estimateGas({from: cons.WALLETPAY});
                    
                    gasLimit = gasLimit*cons.FACTOR_GAS;

                    console.log(gasLimit)

                    var tx = await this.props.wallet.web3.eth.sendTransaction({
                      from: this.props.currentAccount,
                      to: cons.WALLETPAY,
                      value: gasLimit+"0000000000"
                    })

                    console.log(tx);

                    if(tx.status){

                      var resultado = await fetch(cons.API+"api/v1/coinsalmarket/"+this.props.currentAccount,
                      {
                        method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        headers: {
                          'Content-Type': 'application/json'
                          // 'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify({token: cons.SCKDTT, coins: cantidad}) // body data type must match "Content-Type" header
                      })
                      if(await resultado.text() === "true"){
                        alert("Coins send to EXCHANGE")
                      }else{
                        alert("send failed")
                      }
                    }else{
                      alert("insuficient founds")
                    }
                    this.update()
                  }else{
                    alert("worng amount")
                  }
                }}
              >
                
                {" <-"} Withdraw To Exchange {" "}
              </button>

            </div>

            <div className="col-lg-12 col-md-12 text-center">
              <hr></hr>
            </div>

          </div>
          
          <div style={{ marginTop: "30px" }} className="row text-center">
            <div className="col-md-12">
              <h3>IN GAME inventory</h3>{" "}
              
            </div>
          </div>

          <div className="row text-center" id="inventory">
            {this.state.inventario}
          </div>

          <div className="col-lg-12 col-md-12 text-center">
              <hr></hr>
            </div>

          <div style={{ marginTop: "30px" }} className="row text-center">
            <div className="col-md-12">
              <h3>Account inventory</h3>{" "}
              
            </div>
          </div>

          <div className="row text-center" id="inventory">
            {this.state.inventario}
          </div>

        </div>
      </>
    );
  }
}
