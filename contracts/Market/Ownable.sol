pragma solidity >=0.7.0;
// SPDX-License-Identifier: Apache 2.0


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address payable public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor(){
    owner = payable(msg.sender);
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    if(msg.sender != owner)revert();
    _;
  }


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address payable newOwner) public onlyOwner {
    if(newOwner == address(0))revert();
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}