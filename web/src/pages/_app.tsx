import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { defineChain } from "viem";
import type { AppProps } from "next/app";

const queryClient = new QueryClient();

const sidechain = defineChain({
  id: 1440002,
  name: "XRPL EVM Sidechain Devnet",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-evm-sidechain.xrpl.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "XRPL EVM Sidechain Explorer",
      url: "https://evm-sidechain.xrpl.org",
    },
  },
});

const config = getDefaultConfig({
  appName: "XRPay dApp",
  projectId: "YOUR_PROJECT_ID",
  chains: [sidechain],
  ssr: true,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Component {...pageProps} />{" "}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
