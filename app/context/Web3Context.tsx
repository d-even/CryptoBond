"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ethers, BrowserProvider, Signer, Contract } from "ethers";
import { contractAddress, contractABI } from "@/lib/contract";

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: Signer | null;
  account: string | null;
  balance: string | null;
  contract: Contract | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  createBond: (keyId: string, password: string, amount: string) => Promise<any>;
  redeemBond: (keyId: string, password: string) => Promise<any>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Monad Testnet configuration
const MONAD_CHAIN_ID = 10143;
const MONAD_TESTNET_CONFIG = {
  chainId: '0x279f', // 10143 in hex
  chainName: 'Monad Testnet',
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  blockExplorerUrls: ['https://testnet.monadscan.com'],
};

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);

      // Check current network
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (currentChainId !== MONAD_TESTNET_CONFIG.chainId) {
        try {
          // Try to switch to Monad Testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          // If network not added, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [MONAD_TESTNET_CONFIG],
              });
            } catch (addError) {
              console.error('Failed to add Monad Testnet:', addError);
              setError('Failed to add Monad Testnet to MetaMask');
              return;
            }
          } else {
            console.error('Failed to switch network:', switchError);
            setError('Please switch to Monad Testnet manually');
            return;
          }
        }
      }

      await browserProvider.send("eth_requestAccounts", []);

      const signer = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      if (Number(network.chainId) !== MONAD_CHAIN_ID) {
        setError("Please switch MetaMask to Monad Testnet (Chain ID 10143)");
        return;
      }

      const address = await signer.getAddress();
      const balance = await browserProvider.getBalance(address);

      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(address);
      setBalance(ethers.formatEther(balance));
      setContract(contractInstance);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect wallet");
    }
  };

  const createBond = async (keyId: string, password: string, amount: string) => {
    if (!contract || !signer) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const passwordHash = ethers.keccak256(
        ethers.toUtf8Bytes(password)
      );

      const keyIdBytes = ethers.keccak256(
        ethers.toUtf8Bytes(keyId)
      );

      const valueInWei = ethers.parseEther(amount);

      // Use populateTransaction to avoid eth_sendTransaction issues
      const txRequest = await contract.createBond.populateTransaction(
        keyIdBytes,
        passwordHash,
        { value: valueInWei }
      );
      
      // Send transaction directly through signer
      const tx = await signer.sendTransaction(txRequest);
      const receipt = await tx.wait();
      
      return receipt;
    } catch (error: any) {
      console.error('Create bond error:', error);
      setError(error.message || 'Failed to create bond');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const redeemBond = async (keyId: string, password: string) => {
    if (!contract || !signer) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const keyIdBytes = ethers.keccak256(
        ethers.toUtf8Bytes(keyId)
      );

      // Use populateTransaction to avoid eth_sendTransaction issues
      const txRequest = await contract.redeemBond.populateTransaction(
        keyIdBytes, 
        password
      );
      
      // Send transaction directly through signer
      const tx = await signer.sendTransaction(txRequest);
      const receipt = await tx.wait();
      
      return receipt;
    } catch (error: any) {
      console.error('Redeem bond error:', error);
      setError(error.message || 'Failed to redeem bond');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        balance,
        contract,
        isLoading,
        error,
        connectWallet,
        createBond,
        redeemBond,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 must be used within Web3Provider");
  return context;
};