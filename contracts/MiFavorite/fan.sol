pragma solidity >=0.7.0;
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

contract Context {

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

contract Fan is Context, Admin{
  using SafeMath for uint256;

  address token = 0x55d398326f99059fF775485246999027B3197955;
  uint256[] fase = [1613062800, 1623438000, 1626030000, 1626047940];
  uint256[] precios = [50*10**18, 75*10**18, 100*10**18]; 
  TRC20_Interface CSC_Contract = TRC20_Interface(token);

  mapping (address => bool[]) public fans;

  bool[] public items = [false, false, false, false, false];
  uint256[] public votos = [0,0,0,0,0];

  bool[] private base = items;

  uint256 public pool;

  constructor() {

    fans[_msgSender()] = base;

  }

  function setGanador(uint256 _item) public onlyOwner returns(uint256){  
    
    items[_item] = true;

    return _item;

  }

  function valor() public view returns(uint256) {
      uint256 precio = 0;

      if(block.timestamp >= fase[0] && block.timestamp < fase[1]){
        precio = precios[0];

      }

      if(block.timestamp >= fase[1] && block.timestamp < fase[2]){
        precio = precios[1];

      }

      if(block.timestamp >= fase[2] && block.timestamp < fase[3]){
        precio = precios[2];

      }

      return (precio);

  }

  function ganador() public view returns(uint256) {

      uint256 puntos;
      for (uint256 index = 0; index < items.length; index++) {
          if(items[index] && fans[_msgSender()][index]){
            puntos = pool.div(votos[index]);
          }
          
      }

      return puntos;
      
  }

  function votar(uint256 _item) public returns(uint256){  

    if(fans[_msgSender()].length == 0){
        fans[_msgSender()] = base;
    }
    if(fans[_msgSender()][_item] == true || valor() == 0)revert();

    if( CSC_Contract.allowance(_msgSender(), address(this)) < valor() )revert();
    if( CSC_Contract.balanceOf(_msgSender()) < valor() )revert();
    if(!CSC_Contract.transferFrom(_msgSender(), address(this), valor() ))revert();
    votos[_item]++;
    fans[_msgSender()][_item] = true;
    pool += valor();
    
    return _item;

  }

  function reclamar() public returns(uint256){  

    if(block.timestamp < fase[3])revert();
    if(CSC_Contract.balanceOf(address(this)) < ganador() )revert();
    if(!CSC_Contract.transfer(_msgSender(), ganador() ) )revert();

    fans[_msgSender()] = base;
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

    if ( CSC_Contract.balanceOf(address(this)) < _value)revert();

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