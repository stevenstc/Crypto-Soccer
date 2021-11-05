pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache 2.0

interface TRC20_Interface {

    function allowance(address _owner, address _spender) external view returns (uint remaining);
    function transferFrom(address _from, address _to, uint _value) external returns (bool);
    function transfer(address direccion, uint cantidad) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function decimals() external view returns(uint);
}

library SafeMath {

    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) {
            return 0;
        }

        uint c = a * b;
        require(c / a == b);

        return c;
    }

    function div(uint a, uint b) internal pure returns (uint) {
        require(b > 0);
        uint c = a / b;

        return c;
    }

    function sub(uint a, uint b) internal pure returns (uint) {
        require(b <= a);
        uint c = a - b;

        return c;
    }

    function add(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        require(c >= a);

        return c;
    }

}

abstract contract Context {

  constructor () { }

  function _msgSender() internal view returns (address payable) {
    return payable(msg.sender);
  }

  function _msgData() internal view returns (bytes memory) {
    this; 
    return msg.data;
  }
}

contract Ownable is Context {
  address payable public owner;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  constructor(){
    owner = payable(_msgSender());
  }
  modifier onlyOwner() {
    if(_msgSender() != owner)revert();
    _;
  }
  function transferOwnership(address payable newOwner) public onlyOwner {
    if(newOwner == address(0))revert();
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

contract Admin is Context, Ownable{
  mapping (address => bool) public admin;

  event NewAdmin(address indexed admin);
  event AdminRemoved(address indexed admin);

  constructor(){
    admin[_msgSender()] = true;
  }

  modifier onlyAdmin() {
    if(!admin[_msgSender()])revert();
    _;
  }

  function makeNewAdmin(address payable _newadmin) public onlyOwner {
    if(_newadmin == address(0))revert();
    emit NewAdmin(_newadmin);
    admin[_newadmin] = true;
  }

  function makeRemoveAdmin(address payable _oldadmin) public onlyOwner {
    if(_oldadmin == address(0))revert();
    emit AdminRemoved(_oldadmin);
    admin[_oldadmin] = false;
  }

}

contract Voter is Context, Admin{
  using SafeMath for uint256;

  address token = 0x55d398326f99059fF775485246999027B3197955;
  uint256[] fase = [1635872400, 1636225200, 1636311600, 1636329540];
  uint256[] precios = [50*10**18, 75*10**18, 100*10**18]; 
  TRC20_Interface CSC_Contract = TRC20_Interface(token);
  
  struct Fan {
      bool registrado;
      bool[] items;
  }

  mapping (address => Fan) public fans;

  bool[] public items = [false, false, false, false, false];
  uint256[] public votos = [0,0,0,0,0];

  bool[] private base = items;

  uint256 public pool;

  constructor() {
      
      Fan memory fan;
      fan=Fan({
        registrado:true,
        items: base
          
      });
      
    fans[_msgSender()] = fan;

  }
  
  function largoItems() public view returns(uint256){
      return items.length;
  }
  
  function largoFanItems(address _fan) public view returns(uint256){
      Fan memory fan = fans[_fan];
      return fan.items.length;
  }
  
  function verFanItems(address _fan, uint256 _i) public view returns(bool){
      Fan memory fan = fans[_fan];
      return fan.items[_i];
  }

  function setGanador(uint256 _item) public onlyOwner returns(uint256){  
    
    items[_item] = true;

    return _item;

  }
  
  function setToken(address _tokebp20) public onlyOwner returns(address){  
    
    CSC_Contract = TRC20_Interface(_tokebp20);
    token = _tokebp20;

    return _tokebp20;

  }
  
  function tiempo() public view returns(uint256){
      return block.timestamp;
  }

  function valor() public view returns(uint256) {
      
      if(block.timestamp >= fase[0] && block.timestamp < fase[1]){
        return precios[0];

      }

      if(block.timestamp >= fase[1] && block.timestamp < fase[2]){
        return precios[1];

      }

      if(block.timestamp >= fase[2] && block.timestamp < fase[3]){
        return precios[2];

      }
      
      return 0;

      

  }

  function ganador() public view returns(uint256) {
      
      Fan memory fan = fans[_msgSender()];

      uint256 puntos;
      for (uint256 index = 0; index < items.length; index++) {
          if(items[index] && fan.items[index]){
            puntos = pool.div(votos[index]);
          }
          
      }

      return puntos;
      
  }

  function votar(uint256 _item) public returns(bool){  
      
      Fan storage fan = fans[_msgSender()];

    if(fan.items.length != base.length){
        fan.registrado=true;
        fan.items= base;
          
    }
    
    if(valor() > 0 &&  ganador() == 0){
        if(fan.items[_item] == true )revert("item ya adquirido");
    
        if( CSC_Contract.allowance(_msgSender(), address(this)) < valor() )revert("aprovacion insuficiente");
        if( CSC_Contract.balanceOf(_msgSender()) < valor() )revert("saldo insuficiente");
        if(!CSC_Contract.transferFrom(_msgSender(), address(this), valor() ))revert("transferencia fallida");
        votos[_item]++;
        fan.items[_item] = true;
        pool += valor();
        return true;
    }else{
        return false;
    }
    
    

  }

  function reclamar() public returns(uint256){  

    if(block.timestamp < fase[3])revert("no ha finalizado el tiempo del torneo");
    if(CSC_Contract.balanceOf(address(this)) < ganador() )revert("saldo insuficiente en el contrato");
    if(!CSC_Contract.transfer(_msgSender(), ganador() ) )revert("transaccion fallida");

    Fan memory fan = fans[_msgSender()];
    fan.items = base;
    return ganador();

  }

  function ReIniciar() public onlyOwner returns(bool){  
    
    items = base;

    return true;

  }

   function updateFases(uint256[] memory _fases) public onlyOwner returns(bool){  
    
    fase = _fases;

    return true;

  }

  function updatePrecios(uint256[] memory _precios) public onlyOwner returns(bool){  
    
    precios = _precios;

    return true;

  }

  function redimToken(uint256 _value) public onlyOwner returns (uint256) {

    if ( CSC_Contract.balanceOf(address(this)) < _value)revert("saldo insuficiente");

    CSC_Contract.transfer(owner, _value);

    return _value;

  }

  function redimBNB() public onlyOwner returns (uint256){

    owner.transfer(address(this).balance);

    return address(this).balance;

  }

  fallback() external payable {}

  receive() external payable {}

}