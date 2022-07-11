// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/** This contract inherits from the following contracts:
        ERC20,
        AccessControl,
        ERC20Permit,
        ERC20Votes
 */
contract MyToken is ERC20, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // this constructor creates the MyToken token and grants it privileges
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {
        // makes the caller of the contract the default admin
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        //gives the caller the ability to mint MyToken
        _grantRole(MINTER_ROLE, msg.sender);
    }

    // mints MTK of the given "amount" and assigns them to the said address
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}