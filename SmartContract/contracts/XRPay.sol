// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "hardhat/console.sol";

contract XRPay {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    struct Deposit {
        address publicKey;
        uint256 amount;
        address tokenAddress;
        uint8 tokenType; // 0 = Native, 1 = ERC20
        address senderAddress;
        uint256 timestamp;
    }

    Deposit[] public deposits;

    event DepositEvent(
        uint256 indexed _index,
        uint256 _amount,
        uint8 _tokenType,
        address indexed _senderAddress,
        address indexed _tokenAddress
    );

    event ClaimEvent(
        uint256 indexed _index,
        uint256 _amount,
        uint8 _tokenType,
        address _senderAddress,
        address indexed _receiverAddress,
        address indexed _tokenAddress
    );

    function deposit(
        address _publicKey,
        uint256 _amount,
        address _tokenAddress,
        uint8 _tokenType
    ) public payable returns (uint256) {
        require(_amount > 0, "Invalid Amount");

        if (_tokenType == 0) {
            require(msg.value == _amount, "Invalid Amount");
            require(_tokenAddress == address(0), "Invalid Token Address");

            deposits.push(
                Deposit({
                    publicKey: _publicKey,
                    amount: _amount,
                    tokenAddress: _tokenAddress,
                    tokenType: _tokenType,
                    senderAddress: msg.sender,
                    timestamp: block.timestamp
                })
            );
        } else if (_tokenType == 1) {
            IERC20 token = IERC20(_tokenAddress);
            token.safeTransferFrom(msg.sender, address(this), _amount);

            deposits.push(
                Deposit({
                    publicKey: _publicKey,
                    amount: _amount,
                    tokenAddress: _tokenAddress,
                    tokenType: _tokenType,
                    senderAddress: msg.sender,
                    timestamp: block.timestamp
                })
            );
        } else {
            revert("Invalid Token Type");
        }

        emit DepositEvent(
            deposits.length - 1,
            _amount,
            _tokenType,
            msg.sender,
            _tokenAddress
        );

        return deposits.length - 1;
    }

    function claim(
        uint256 _index,
        address _recipientAddress,
        bytes32 _recipientAddressHash,
        bytes memory _signature
    ) public {
        require(_index < deposits.length, "Invalid Index");
        Deposit memory d = deposits[_index];
        require(d.amount > 0, "Invalid Amount");

        require(
            _recipientAddressHash ==
                ECDSA.toEthSignedMessageHash(
                    keccak256(abi.encodePacked(_recipientAddress))
                ),
            "Hashes Do Not Match"
        );

        address signer = getSigner(_recipientAddressHash, _signature);
        require(signer == d.publicKey, "Invalid Signature");

        if (d.tokenType == 0) {
            (bool success, ) = _recipientAddress.call{value: d.amount}("");
            require(success, "Transfer Failed");
        } else if (d.tokenType == 1) {
            IERC20 token = IERC20(d.tokenAddress);
            token.safeTransfer(_recipientAddress, d.amount);
        }

        emit ClaimEvent(
            _index,
            d.amount,
            d.tokenType,
            d.senderAddress,
            _recipientAddress,
            d.tokenAddress
        );

        delete deposits[_index];
    }

    function getSigner(
        bytes32 messageHash,
        bytes memory signature
    ) public pure returns (address) {
        address signer = ECDSA.recover(messageHash, signature);
        return signer;
    }

    function getDepositIndex() public view returns (uint256) {
        return deposits.length;
    }

    function getDeposit(uint256 _index) public view returns (Deposit memory) {
        return deposits[_index];
    }
}
