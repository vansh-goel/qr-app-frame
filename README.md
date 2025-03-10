# Bounty Submission
This application is built as a submission [This Bounty](https://www.bountycaster.xyz/bounty/0x8bb057c9167573360476200aea029e568e6fda36)


### Payment Process

Our application allows users to register a physical address by making a payment in USDC. The payment is processed through the smart contract, and upon successful registration, a QR code will be delivered to the user's registered address.

### Tutorial

Here's a brief overview of how to use the app:

1. **Register Your Address**: Users can register their physical address by making a payment of 1 USDC.
2. **Receive Your QR Code**: After successful registration, a QR code will be generated and delivered to the registered address.

### Dependencies

We'll need the following dependencies for our application:

- [@farcaster/frame-sdk](https://github.com/farcasterxyz/frames/)
- [Wagmi](https://wagmi.sh/) for wallet interactions
- [Viem](https://viem.sh/) for Ethereum utilities
- [@tanstack/react-query](https://tanstack.com/query/latest)

### Smart Contract

The smart contract handles the registration of physical addresses and payment processing. It ensures that each wallet can only register once and manages the payment flow.

### Usage

To interact with the smart contract, ensure you have the necessary permissions and that your wallet is connected. The app will guide you through the registration process.

### Conclusion

Thank you for using our QR app! We hope it simplifies the process of registering physical addresses and delivering QR codes. Happy Framesgiving! 🖼️🦃