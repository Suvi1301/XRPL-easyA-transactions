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
  useReadContract,
  useSendTransaction,
} from "wagmi";

import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

import { ethers } from "ethers";
import { XRPayABI } from "@/abi/XRPay";
import { XRPAY_CONTRACT, tokens } from "@/utils";

import { useSearchParams } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function ClaimPage() {
  const [isMounted, setIsMounted] = useState(false);

  const [tx, setTx] = useState("");
  const params = useSearchParams();
  const depositIndex = params.get("i");
  const secret = params.get("s");

  const { address } = useAccount();
  const provider = usePublicClient();
  const { openConnectModal } = useConnectModal();
  const { sendTransactionAsync } = useSendTransaction();

  const { data, refetch } = useReadContract({
    abi: XRPayABI,
    address: XRPAY_CONTRACT,
    functionName: "getDeposit",
    args: [Number(depositIndex)],
  });

  const onHandleClaim = async () => {
    if (!provider || !depositIndex || !secret) {
      return;
    }
    const privateKey = ethers.keccak256(ethers.toUtf8Bytes(secret));
    const wallet = new ethers.Wallet(privateKey);
    const messageHash = ethers.solidityPackedKeccak256(["address"], [address]);

    const signedMessageHash = ethers.getBytes(
      ethers.solidityPackedKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      )
    );

    const contract = new ethers.Contract(XRPAY_CONTRACT, XRPayABI);
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const f = async () => {
      const data = await refetch();
      console.log(data);
    };

    f();
  }, [depositIndex, refetch]);

  if (!isMounted || !data) {
    return null;
  }

  const t = tokens.find((t) => t.address === data.tokenAddress);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-4 bg-black ${inter.className}`}
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Claim Payment</CardTitle>
          <CardDescription>You have been blessed with</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="token">Token</Label>
            <span>{t?.name}</span>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <span>{Number(data.amount) / Math.pow(10, t?.decimals)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="w-full flex justify-end">
            <Button
              onClick={address ? onHandleClaim : openConnectModal}
              disabled={Number(data.amount) === 0}
            >
              {Number(data.amount) === 0
                ? "Claimed"
                : address
                ? "Claim"
                : "Connect Wallet"}
            </Button>
          </div>
          {tx && (
            <div className="bg-green-200 text-xs w-full text-center p-1">
              {tx}
            </div>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
