# XRPL-easyA-transactions

XRPay offers a hassle-free crypto transaction solution, simplifying transfers just using a secret link.

Sending and receiving crypto can be scary for new users, and tedious even for experienced web3 users. Before you even send anything, you need to know the recipient's wallet address, and what chain and tokens they want. XRPay solves this problem by using one secure and secret link that allows you to claim crypto tokens deposited by the sender to your own unique URL. A sender deposits an amount of a given token, and a unique url is generated client-side which can be sent to the receiver. A simple click to the URL will allow the receiver to claim the tokens into their wallet. XRPay is built at the contract layer, meaning anyone can deposit and claim directly from the smart contract themselves, or build their own dApps around it.

Smart Contract written in Solidity built on XRP Ledger EVM, uses some OpenZeppelin libraries, mostly for signature verification. As the goal of the hack was to make a buttery smooth payments UX, XRPL EVM Sidechains low transaction confirmation times and one block finality makes it a suitable chain. Front-end is written in React and Next.js, using RainbowKit / Wagmi / Ethers.
