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
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSendTransaction,
} from "wagmi";
import { v4 as uuid } from "uuid";
import { ethers } from "ethers";
import { XRPayABI } from "@/abi/XRPay";
import { XRPAY_CONTRACT, tokens } from "@/utils";
import { zeroAddress } from "viem";
import { ERC20ABI } from "@/abi/ERC20";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState(10);
  const [secret, setSecret] = useState("");
  const [depositIndex, setDepositIndex] = useState<number>();

  const { address } = useAccount();
  const provider = usePublicClient();
  const { openConnectModal } = useConnectModal();
  const { sendTransactionAsync } = useSendTransaction();

  const { refetch } = useReadContract({
    abi: XRPayABI,
    address: XRPAY_CONTRACT,
    functionName: "getDepositIndex",
  });

  const { refetch: fetchAllowance } = useReadContract({
    abi: ERC20ABI,
    address: selectedToken.address,
    functionName: "allowance",
    args: [address, XRPAY_CONTRACT],
  });

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

    if (selectedToken.address !== zeroAddress) {
      const allowance = await fetchAllowance();

      if (Number(allowance) < scaledAmount) {
        const erc20 = new ethers.Contract(selectedToken.address, ERC20ABI);
        const data = erc20.interface.encodeFunctionData("increaseAllowance", [
          XRPAY_CONTRACT,
          scaledAmount,
        ]) as `0x${string}`;

        await sendTransactionAsync({
          to: selectedToken.address as `0x${string}`,
          data,
        });
      }
    }

    const contract = new ethers.Contract(XRPAY_CONTRACT, XRPayABI);
    const data = contract.interface.encodeFunctionData("deposit", [
      address,
      scaledAmount,
      selectedToken.address,
      selectedToken.address === zeroAddress ? 0 : 1,
    ]) as `0x${string}`;

    await sendTransactionAsync({
      to: XRPAY_CONTRACT,
      data,
      value: scaledAmount,
    });
    const { data: depositIndex } = await refetch();

    setDepositIndex((depositIndex as any).toString());
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
          {secret && depositIndex && (
            <div className="bg-green-200 text-sm w-full text-center p-1">
              http://localhost:3000/claim?i={depositIndex}&s={secret}
            </div>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
