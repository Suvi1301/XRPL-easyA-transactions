// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract XRPayToken is ERC20 {
    uint8 private _decimals = 6;

    constructor() ERC20("XRPayCoin", "XRPC") {
    }

    function mint(uint256 _amount) public {
        _mint(msg.sender, _amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}