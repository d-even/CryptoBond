"use client";
import { useWeb3 } from "../context/Web3Context";

export default function WalletConnect() {
  const { account, balance, network, connectWallet, disconnectWallet } = useWeb3();

  return (
    <div>
      {account ? (
        <div className="flex items-center space-x-4">
          {network && (
            <p className="text-zinc-800 dark:text-white">
              {network}
            </p>
          )}
          {balance && (
            <p className="text-zinc-800 dark:text-white">
              | {parseFloat(balance).toFixed(3)} MON
            </p>
          )}
          <p className="text-zinc-800 dark:text-white">
            | {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </p>
          <button
            onClick={disconnectWallet}
            className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}