"use client";
import { useState } from "react";
import { CreateBond } from "./components/CreateBond";
import { RedeemBond } from "./components/RedeemBond";
import WalletConnect from "./components/WalletConnect";
import { useWeb3 } from "./context/Web3Context";

export default function Home() {
  const [showCreate, setShowCreate] = useState(true);
  const { account } = useWeb3();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <header className="w-full max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">BlitzzBond</h1>
          <WalletConnect />
        </div>
      </header>
      <main className="flex w-full max-w-5xl flex-1 flex-col items-center px-4 py-8">
        {account ? (
          <>
            <div className="mb-8 flex space-x-4">
              <button
                onClick={() => setShowCreate(true)}
                className={`rounded-md px-4 py-2 font-semibold ${
                  showCreate
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white"
                }`}
              >
                Create Bond
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className={`rounded-md px-4 py-2 font-semibold ${
                  !showCreate
                    ? "bg-green-600 text-white"
                    : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white"
                }`}
              >
                Redeem Bond
              </button>
            </div>
            {showCreate ? <CreateBond /> : <RedeemBond />}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
              Welcome to BlitzzBond
            </h2>
            <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-300">
              Connect your wallet to start creating and redeeming bonds
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
