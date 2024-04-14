export const XRPayABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "_tokenType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_senderAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_receiverAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
    ],
    name: "ClaimEvent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "_tokenType",
        type: "uint8",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_senderAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
    ],
    name: "DepositEvent",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_recipientAddress",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_recipientAddressHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_publicKey",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "_tokenType",
        type: "uint8",
      },
    ],
    name: "deposit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "deposits",
    outputs: [
      {
        internalType: "address",
        name: "publicKey",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "tokenType",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "senderAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "messageHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "getSigner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];
