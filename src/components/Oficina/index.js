import React, { Component } from "react";

export default class Oficina extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direccion: "loading Wallet",
      link: "Make an investment to get the referral LINK",
      registered: false,
      balanceRef: 0,
      balanceSal: 0,
      totalRef: 0,
      invested: 0,
      paidAt: 0,
      my: 0,
      almacen: 0,
      withdrawn: 0,
      precioSITE: 1,
      valueSITE: 0,
      valueUSDT: 0,
      personasIzquierda: 0,
      puntosIzquierda: 0,
      personasDerecha: 0,
      puntosDerecha: 0,
      bonusBinario: 0,
      puntosEfectivosIzquierda: 0,
      puntosEfectivosDerecha: 0,
      puntosReclamadosIzquierda: 0,
      puntosReclamadosDerecha: 0,
      puntosLostIzquierda: 0,
      puntosLostDerecha: 0,
      directos: 0,

    };

    this.Investors = this.Investors.bind(this);
    this.Investors2 = this.Investors2.bind(this);
    this.Investors3 = this.Investors3.bind(this);
    this.Link = this.Link.bind(this);
    this.withdraw = this.withdraw.bind(this);

    this.rateSITE = this.rateSITE.bind(this);
    this.handleChangeSITE = this.handleChangeSITE.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);

    this.claim = this.claim.bind(this);
    this.rango = this.rango.bind(this);
  }

  handleChangeSITE(event) {
    this.setState({valueSITE: event.target.value});
  }

  handleChangeUSDT(event) {
    this.setState({valueUSDT: event.target.value});
  }

  async componentDidMount() {
    if (typeof window.ethereum !== 'undefined') {           
      var resultado = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log(resultado[0]);
        this.setState({
          currentAccount: resultado[0]
        })

    }
    setInterval(async() => {
      if (typeof window.ethereum !== 'undefined') {           
        var resultado = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log(resultado[0]);
          this.setState({
            currentAccount: resultado[0]
          })
  
      }

    },7*1000);
    
    setInterval(() => this.Investors2(),3*1000);
    setInterval(() => this.Investors3(),3*1000);
    setInterval(() => this.Investors(),3*1000);
    setInterval(() => this.rango(),3*1000);
    setInterval(() => this.Link(),3*1000);

    
  };

  async rateSITE(){
    /*var proxyUrl = cons.proxy;
    var apiUrl = cons.PRE;
    var response;

    try {
      response = await fetch(proxyUrl+apiUrl);
    } catch (err) {
      console.log(err);
      return this.state.precioSITE;
    }

    var json = await response.json();

    this.setState({
      precioSITE: json.Data.precio
    });

    return json.Data.precio;*/

    return 1;

  };

  async Link() {
    const {registered} = this.state;
    if(registered){

      let loc = document.location.href;
      if(loc.indexOf('?')>0){
        loc = loc.split('?')[0];
      }

      if(loc.indexOf('#')>0){
        loc = loc.split('#')[0];
      }
      let mydireccion = this.state.currentAccount;
      mydireccion = await this.props.wallet.contractBinary.methods.addressToId(this.state.currentAccount).call({from:this.state.currentAccount});
      var ver = "";
      if (this.props.version > 1) {
        ver = "?v"+this.props.version;
      }
      mydireccion = loc+ver+'?ref='+mydireccion;
      var link = mydireccion+"&hand=left";
      var link2 = mydireccion+"&hand=right";
      this.setState({
        link: link,
        link2: link2,
      });
    }else{
      this.setState({
        link: "Make an investment to get the referral LINK",
        link2: "Make an investment to get the referral LINK",
      });
    }
  }


  async Investors() {

    let usuario = await this.props.wallet.contractBinary.methods.investors(this.state.currentAccount).call({from:this.state.currentAccount});
    usuario.withdrawable = await this.props.wallet.contractBinary.methods.withdrawable(this.state.currentAccount).call({from:this.state.currentAccount});
    
    var decimales = await this.props.wallet.contractToken.methods.decimals().call({from:this.state.currentAccount});

    var despositos = await this.props.wallet.contractBinary.methods.depositos(this.state.currentAccount).call({from:this.state.currentAccount});
    
    var valores = despositos[0];
    var valorPlan = 0;

    usuario.withdrawable = usuario.withdrawable/10**decimales;
    usuario.withdrawn = usuario.withdrawn/10**decimales;

    for (let index = 0; index < valores.length; index++) {
      valorPlan += valores[index]/10**decimales;
    }

    //valorPlan = (valorPlan*porcent);//(usuario.invested*porcent);// decimales visuales

    var progresoUsdt = ((valorPlan-(valorPlan-(usuario.withdrawn+usuario.withdrawable)))*100)/valorPlan;

    progresoUsdt = progresoUsdt.toFixed(2);

    var progresoRetiro = ((valorPlan-(valorPlan-usuario.withdrawn))*100)/valorPlan;

    progresoRetiro = progresoRetiro.toFixed(2);

    //console.log(usuario)

    this.setState({
      registered: usuario.registered,
      balanceRef: usuario.balanceRef/10**decimales,
      balanceSal: usuario.balanceSal/10**decimales,
      totalRef: usuario.totalRef/10**decimales,
      invested: usuario.invested/10**decimales,
      paidAt: usuario.paidAt/10**decimales,
      my: usuario.withdrawable,
      withdrawn: usuario.withdrawn,
      almacen: usuario.almacen/10**decimales,
      progresoUsdt: progresoUsdt,
      progresoRetiro: progresoRetiro,
      valorPlan: valorPlan,
      directos: usuario.directos
    });

  };

  async Investors2() {

    //var precioSITE = await this.rateSITE();

    /*this.setState({
      precioSITE: precioSITE
    });*/

  };

  async Investors3() {

    var {directos, valorPlan } = this.state;

    //Personas y puntos totales
    let puntos = await this.props.wallet.contractBinary.methods.personasBinary(this.state.currentAccount).call({from:this.state.currentAccount});

    // monto de bonus y puntos efectivos
    let bonusBinario = await this.props.wallet.contractBinary.methods.withdrawableBinary(this.state.currentAccount).call({from:this.state.currentAccount});
  
    var available = await this.props.wallet.contractBinary.methods.withdrawable(this.state.currentAccount).call({from:this.state.currentAccount});

    available = available/10**18;

    if(directos >= 2 && available < valorPlan ){
      bonusBinario.amount = bonusBinario.amount/10**18;
    }else{
      bonusBinario.amount = 0;
    }

    let brazoIzquierdo = await this.props.wallet.contractBinary.methods.handLeft(this.state.currentAccount).call({from:this.state.currentAccount});

    let brazoDerecho = await this.props.wallet.contractBinary.methods.handRigth(this.state.currentAccount).call({from:this.state.currentAccount});

    //console.log(brazoDerecho);

    var MIN_RETIRO = await this.props.wallet.contractBinary.methods.MIN_RETIRO().call({from:this.state.currentAccount});

    MIN_RETIRO = MIN_RETIRO/10**18;


    this.setState({
      personasIzquierda: puntos.pLeft,
      personasDerecha: puntos.pRigth,

      bonusBinario: bonusBinario.amount,

      puntosEfectivosIzquierda: bonusBinario.left/10**18,
      puntosEfectivosDerecha: bonusBinario.rigth/10**18,

      puntosReclamadosIzquierda: brazoIzquierdo.reclamados/10**18,
      puntosReclamadosDerecha: brazoDerecho.reclamados/10**18,

      puntosIzquierda: (bonusBinario.left/10**18)+(brazoIzquierdo.reclamados/10**18),
      puntosDerecha: (bonusBinario.rigth/10**18)+(brazoDerecho.reclamados/10**18),

      available:available,
      MIN_RETIRO: MIN_RETIRO

    });

  };

  async withdraw(){
    var {available} = this.state;

    available = (available*1).toFixed(6);
    available = parseFloat(available);

    var decimales = await this.props.wallet.contractToken.methods.decimals().call({from:this.state.currentAccount});

    var MIN_RETIRO = await this.props.wallet.contractBinary.methods.MIN_RETIRO().call({from:this.state.currentAccount});
    MIN_RETIRO = MIN_RETIRO/10**decimales;

    if ( available > MIN_RETIRO ){
      await this.props.wallet.contractBinary.methods.withdraw().send({from:this.state.currentAccount});

    }else{
      if (available < MIN_RETIRO) {
        window.alert("The minimum to withdraw are: "+(MIN_RETIRO)+" USDT");
      }
    }
  };

  async claim(){
    await this.props.wallet.contractBinary.methods.newRecompensa().send({from:this.state.currentAccount});
  }

  async rango(){
    var rango = await this.props.wallet.contractBinary.methods.withdrawableRange(this.state.currentAccount).call({from:this.state.currentAccount});
    rango = rango/10**18;
    var rangoArray = [];
    var rangoEstilo = "btn-secondary";
    var gananciasRango = "Claimed";
    var funcionRango = () => {};
    var cantidad = "";

    for (let index = 0; index < 7; index++) {
      rangoArray[index] = await this.props.wallet.contractBinary.methods.rangoReclamado(this.state.currentAccount, index).call({from:this.state.currentAccount});
      
    }
    
    if (rango === 0) {
      rango = "N/A"
    }
    if (rango >= 5000 && rango < 20000) {
      rango = "Sapphire"
      if(!rangoArray[0]){
        rangoEstilo = "btn-success";
        cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(0).call({from:this.state.currentAccount});
        cantidad = cantidad / 10 ** 18;
        gananciasRango = `Claim ${cantidad} USDT`;
        funcionRango = () => {
          return this.claim();
        } ;
      }
    }
    if (rango >= 20000 && rango < 50000) {
      rango = "Ruby"
      if(!rangoArray[1]){
        rangoEstilo = "btn-success";
        cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(1).call({from:this.state.currentAccount});
        cantidad = cantidad / 10 ** 18;
        gananciasRango = `Claim ${cantidad} USDT`;
        funcionRango = () => {
          return this.claim();
        } ;
      }
    }
    if (rango >= 50000 && rango < 120000) {
      rango = "Emerauld"
      if(!rangoArray[2]){
        rangoEstilo = "btn-success";
        cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(2).call({from:this.state.currentAccount});
        cantidad = cantidad / 10 ** 18;
        gananciasRango = `Claim ${cantidad} USDT`;
        funcionRango = () => {
          return this.claim();
        } ;
      }
    }
    if (rango >= 120000 && rango < 600000) {
      rango = "Diamond"
      if(!rangoArray[2]){
        rangoEstilo = "btn-success";
        cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(3).call({from:this.state.currentAccount});
        cantidad = cantidad / 10 ** 18;
        gananciasRango = `Claim ${cantidad} USDT`;
        funcionRango = () => {
          return this.claim();
        } ;
      }
    }
    if (rango >= 600000 && rango < 1500000) {
      rango = "Blue Diamond"
      if(!rangoArray[2]){
        rangoEstilo = "btn-success";
        cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(4).call({from:this.state.currentAccount});
        cantidad = cantidad / 10 ** 18;
        gananciasRango = `Claim ${cantidad} USDT`;
        funcionRango = () => {
          return this.claim();
        } ;
      }
    }
    if (rango >= 1500000 && rango < 5000000) {
      rango = "Black Diamond"
      if(!rangoArray[2]){
        rangoEstilo = "btn-success";
        cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(5).call({from:this.state.currentAccount});
        cantidad = cantidad / 10 ** 18;
        gananciasRango = `Claim ${cantidad} USDT`;
        funcionRango = () => {
          return this.claim();
        } ;
      }
    }
    if (rango >= 5000000) {
      rango = "Crown Diamond"
      if(!rangoArray[2]){
        rangoEstilo = "btn-success";
        cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(6).call({from:this.state.currentAccount});
        cantidad = cantidad / 10 ** 18;
        gananciasRango = `Claim ${cantidad} USDT`;
        funcionRango = () => {
          return this.claim();
        } ;
      }
    }

    this.setState({
      rango: rango,
      rangoEstilo: rangoEstilo,
      gananciasRango: gananciasRango,
      funcionRango: funcionRango
    })
  }
  

  render() {
    var { available, invested,  direccion, link, link2, rango} = this.state;

    available = (available*1).toFixed(2);
    available = parseFloat(available);

    invested = invested.toFixed(2);
    invested = parseFloat(invested);


    if(available >= this.state.MIN_RETIRO){
      var ret = (available).toFixed(2);
    }else{
      ret = 0;
    }

    return (

      <div className="container">

        <header style={{'textAlign': 'center'}} className="section-header">
          <h3 className="white">
            <i className="fa fa-user mr-2" aria-hidden="true"></i>
            <span style={{'fontWeight': 'bold'}}>
              My Office:
            </span>
          </h3>
          <div className="row text-center">
            <div className="col-md-12 col-lg-10 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
              <div className="box">
                <h4 className="title"><a href={"https://tronscan.io/#/address/"+direccion} style={{"wordWrap": "break-word"}}>{direccion}</a></h4>
                <h3><b>Range:</b> {rango} <button className={"btn "+this.state.rangoEstilo} onClick={this.state.funcionRango}>{this.state.gananciasRango}</button></h3>
                <br></br>
                <b>{(this.state.withdrawn+available).toFixed(2)} USDT</b> Earning up to <b>{this.state.valorPlan} USDT</b>
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar bg-info " role="progressbar" style={{"width": this.state.progresoUsdt+"%"}} aria-valuenow={this.state.progresoUsdt} aria-valuemin="0" aria-valuemax="100">{this.state.progresoUsdt+"%"}</div>
                </div>
    
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar bg-warning " role="progressbar" style={{"width": this.state.progresoRetiro+"%"}} aria-valuenow={this.state.progresoRetiro} aria-valuemin="0" aria-valuemax="100">{this.state.progresoRetiro+"%"}</div>
                </div>
                Claimed <b>{(this.state.withdrawn).toFixed(2)} USDT</b>

                <br></br>
                <button type="button" className="btn btn-success d-block text-center mx-auto mt-1" onClick={() => document.getElementById("why-us").scrollIntoView({block: "end", behavior: "smooth"}) }>Upgrade Plan</button>


              </div>
            </div>

            <div className="col-md-5 offset-lg-1" >
              <h3 className="white" style={{'fontWeight': 'bold'}}><i className="fa fa-arrow-left mr-2" aria-hidden="true"></i>Left leg</h3>
              <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link}>{link}</a> <br /><br />

              <button type="button" className="btn btn-info">COPY</button>
              </h6>
              <hr></hr>
            </div>

            <div className="col-md-5 " >
              <h3 className="white" style={{'fontWeight': 'bold'}}>Right leg <i className="fa fa-arrow-right mr-2" aria-hidden="true"></i></h3>
              <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link2}>{link2}</a> <br /><br />
              
                <button type="button" className="btn btn-info">COPY</button>
              </h6>
              <hr></hr>
            </div>
          </div>

        </header>

        <div className="row text-center">
          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Left team ({this.state.personasIzquierda})</p>
              <h4 className="title"><a href="#services">Available {this.state.puntosEfectivosIzquierda} pts</a></h4>
              <p className="description">Used {this.state.puntosReclamadosIzquierda} pts</p>
              <hr />
              <p className="description">Total {this.state.puntosIzquierda} pts</p>


            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Right team ({this.state.personasDerecha})</p>
              <h4 className="title"><a href="#services">Available {this.state.puntosEfectivosDerecha} pts</a></h4>
              <p className="description">Used {this.state.puntosReclamadosDerecha} pts</p>
              <hr />
              <p className="description">Total {this.state.puntosDerecha} pts</p>

            </div>
          </div>

          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-speedometer-outline" style={{color: '#ff689b'}}></i></div>
              
              <h4 className="title"><a href="#services">Available {available} USDT</a></h4>
                
              <button type="button" className="btn btn-info d-block text-center mx-auto mt-1" onClick={() => this.withdraw()}>Withdrawable ~ {ret} USDT</button>
                 
              
              <hr></hr>
              <p className="description">earned <b>{(this.state.withdrawn).toFixed(2)} USDT</b> </p>
              <p className="description">Total invested <b>{invested} USDT</b> </p>
            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
              <p className="description">Bonus </p>
              <h4 className="title"><a href="#services">{(this.state.balanceRef+this.state.bonusBinario+this.state.balanceSal).toFixed(2)} USDT</a></h4>
              <hr></hr>
              <p className="description">({this.state.directos}) Referral direct <b>{(this.state.balanceRef).toFixed(2)} USDT</b> </p>
              <p className="description">({this.state.personasDerecha+this.state.personasIzquierda}) Binary earn <b>{(this.state.bonusBinario).toFixed(2)} USDT</b> </p>
              <p className="description">Earn over interest <b>{(this.state.balanceSal).toFixed(2)} USDT</b> </p>

              
            </div>
          </div>

        </div>

      </div>

    );
  }
}
