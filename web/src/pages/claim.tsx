import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
    useAccount,
    usePublicClient,
    useSendTransaction,
} from "wagmi";

import { Inter } from "next/font/google";
import { useState } from "react";

import { ethers } from "ethers";
import { XRPayABI } from "@/abi/XRPay";
import { XRPAY_CONTRACT, tokens } from "@/utils";

import { useSearchParams } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function ClaimPage() {
    const [tx, setTx] = useState("")
    const params = useSearchParams();
    const depositIndex = params.get('i');
    const secret = params.get('s');

    const { address } = useAccount();
    const provider = usePublicClient();
    const { openConnectModal } = useConnectModal();
    const { sendTransactionAsync } = useSendTransaction();


    const onHandleClaim = async () => {
        if (!provider || !depositIndex || !secret) {
            return;
        }
        const privateKey = ethers.keccak256(ethers.toUtf8Bytes(secret));
        const wallet = new ethers.Wallet(privateKey);
        const messageHash = ethers.solidityPackedKeccak256(
            ["address"],
            [address]
        );

        const signedMessageHash = ethers.getBytes(
            ethers.solidityPackedKeccak256(
                ["string", "bytes32"],
                ["\x19Ethereum Signed Message:\n32", messageHash]
            )
        );

        const contract = new ethers.Contract(XRPAY_CONTRACT, XRPayABI);
        const signature = await wallet.signMessage(ethers.getBytes(messageHash))
        const data = contract.interface.encodeFunctionData("claim", [
            Number(depositIndex),
            address,
            signedMessageHash,
            signature,
        ]) as `0x${string}`;

        const tx = await sendTransactionAsync({
            to: XRPAY_CONTRACT,
            data,
        });
        setTx(tx);

    };

    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-center p-4 bg-black ${inter.className}`}
        >
            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Claim Payment</CardTitle>
                    <CardDescription>
                        Claim tokens
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="chain">Chain</Label>

                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="token">Token</Label>

                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="amount">Amount</Label>

                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="w-full flex justify-end">
                        <Button onClick={address ? onHandleClaim : openConnectModal}>
                            {address ? "Confirm" : "Connect Wallet"}
                        </Button>
                    </div>
                    {secret && depositIndex && (
                        <div className="bg-green-200 text-sm w-full text-center p-1">
                            {tx}
                        </div>
                    )}
                </CardFooter>
            </Card>
        </main>
    );
}
