import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Inter } from "next/font/google";
import { useState } from "react";
import { useAccount, usePublicClient, useSendTransaction } from "wagmi";
import { v4 as uuid } from "uuid";
import { ethers } from "ethers";
import { XRPayABI } from "@/abi/XRPay";

const inter = Inter({ subsets: ["latin"] });

const tokens = [
  {
    name: "XRP",
    symbol: "XRP",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
  },
  {
    name: "XRPayCoin",
    symbol: "XRPC",
    address: "0xaEF0B30Ac473035F20F82C23f5Fe5a939b950B43",
    decimals: 6,
  },
];

const XRPAY_CONTRACT = "0x8C223eD2a2930C8a4547E0f2ef8f89eE6a251642";

export default function Home() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState(10);
  const [secret, setSecret] = useState("");

  const { address } = useAccount();
  const provider = usePublicClient();
  const { openConnectModal } = useConnectModal();
  const { data: hash, sendTransaction } = useSendTransaction();

  const onHandleDeposit = async () => {
    if (!provider) {
      return;
    }

    const secret = uuid();
    const privateKey = ethers.keccak256(ethers.toUtf8Bytes(secret));
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;

    const scaledAmount = ethers.parseUnits(
      amount.toString(),
      selectedToken.decimals
    );

    const contract = new ethers.Contract(XRPAY_CONTRACT, XRPayABI);
    const data = contract.interface.encodeFunctionData("deposit", [
      address,
      scaledAmount,
      selectedToken.address,
      0,
    ]) as `0x${string}`;

    await sendTransaction({ to: XRPAY_CONTRACT, data, value: scaledAmount });
    setSecret(secret);
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-4 bg-black ${inter.className}`}
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Create Payment Link</CardTitle>
          <CardDescription>
            Deposit a token of your choice into the smart contract and recieve a
            link which you can share with the recipient to allow them to claim
            the funds.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="chain">Chain</Label>
            <Select value="xrpl-sidechain">
              <SelectTrigger id="chain">
                <SelectValue placeholder="Select Chain" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="xrpl-sidechain">XRPL Sidechain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="token">Token</Label>
            <Select
              value={selectedToken.address}
              onValueChange={(v) => {
                const token = tokens.find((t) => t.address === v);
                if (token) {
                  setSelectedToken(token);
                }
              }}
            >
              <SelectTrigger id="token">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent position="popper">
                {tokens.map((t) => {
                  return (
                    <SelectItem value={t.address} key={t.address}>
                      {t.name} ({t.symbol})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              className="numeric-input-no-stepper"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="w-full flex justify-end">
            <Button onClick={address ? onHandleDeposit : openConnectModal}>
              {address ? "Confirm" : "Connect Wallet"}
            </Button>
          </div>
          {secret && hash && (
            <div className="bg-green-200 text-sm w-full text-center p-1">
              https://localhost:3000/claim/{secret}
            </div>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
