"use client";
import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { contractAddress, contractABI } from "../../lib/contract";
import { ethers } from "ethers";

export function CreateBond() {
  const { signer, provider, account } = useWeb3();
  const [keyId, setKeyId] = useState("");
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateBond = async () => {
    if (!signer) {
      setMessage("Please connect your wallet first.");
      return;
    }
    if (!keyId || !password || !amount) {
      setMessage("Please fill in all fields.");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0.01 || amountNum > 8) {
      setMessage("Amount must be between 0.01 and 8 MON.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (!provider || !account) {
        setMessage("Web3 provider not initialized.");
        setLoading(false);
        return;
      }

      const balance = await provider.getBalance(account);
      const value = ethers.parseEther(amount);

      if (balance < value) {
        setMessage(`Insufficient funds. Your balance: ${ethers.formatEther(balance)} MON. Amount required: ${amount} MON.`);
        setLoading(false);
        return;
      }

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const keyIdBytes = ethers.id(keyId);
      const passwordBytes = ethers.id(password);

      const tx = await contract.createBond(keyIdBytes, passwordBytes, { value });
      await tx.wait();

      setMessage("Bond created successfully!");
      alert("Bond created successfully!");
      setKeyId("");
      setPassword("");
      setAmount("");
    } catch (error: any) {
      console.error("Failed to create bond:", error);
      if (error.code === "INSUFFICIENT_FUNDS" || error.message?.includes("insufficient funds")) {
        setMessage("Insufficient funds for gas + value. Please add more MON to your wallet.");
      } else {
        setMessage(error.reason || error.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
      <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
        Create Bond
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Key ID"
          value={keyId}
          onChange={(e) => setKeyId(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
        />
        <input
          type="text"
          placeholder="Amount (0.01-8 MON)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
        />
        <button
          onClick={handleCreateBond}
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-black"
        >
          {loading ? "Creating..." : "Create Bond"}
        </button>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
      </div>
    </div>
  );
}
