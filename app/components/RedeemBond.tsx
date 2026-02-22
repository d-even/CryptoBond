"use client";
import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { contractAddress, contractABI } from "../../lib/contract";
import { ethers } from "ethers";

export function RedeemBond() {
  const { signer } = useWeb3();
  const [keyId, setKeyId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRedeemBond = async () => {
    if (!signer) {
      setMessage("Please connect your wallet first.");
      return;
    }
    if (!keyId || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const keyIdBytes = ethers.id(keyId);

      const tx = await contract.redeemBond(keyIdBytes, password);
      await tx.wait();

      setMessage("Bond redeemed successfully!");
      setKeyId("");
      setPassword("");
    } catch (error: any) {
      console.error("Failed to redeem bond:", error);
      setMessage(error.reason || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-800">
      <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
        Redeem Bond
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
        <button
          onClick={handleRedeemBond}
          disabled={loading}
          className="w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-black"
        >
          {loading ? "Redeeming..." : "Redeem Bond"}
        </button>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
      </div>
    </div>
  );
}
