"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useAccount, useWalletClient } from "wagmi";
// import abi from "../abi.json";
import sdk from "@farcaster/frame-sdk";

// Contract addresses (on Base Sepolia)
const contractAddress = "0xcCC30130d9C33111692e25B896790DBF9f00B9FB";
const usdcAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";

export function SendTransaction() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isApproving, setIsApproving] = useState(false);
  const [status, setStatus] = useState("");
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const {
    data: hash,
    error,
    isPending,
    sendTransaction,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("processing");

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const physicalAddress = formData.get("address") as string;

      if (!address || !walletClient) {
        setStatus("error");
        return;
      }

      // For USDC approval
      setIsApproving(true);

      // First transaction: USDC approval
      await sendTransaction({
        to: usdcAddress,
        data: `0x095ea7b3${contractAddress
          .slice(2)
          .padStart(64, "0")}${parseEther("1").toString(16).padStart(64, "0")}`,
        chainId: 8453,
      });

      // Wait for approval to be confirmed
      if (hash) {
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (isConfirmed) {
              clearInterval(interval);
              resolve(true);
            }
          }, 1000);
        });
      }

      setIsApproving(false);

      // Second transaction: Register address
      await sendTransaction({
        to: contractAddress,
        data: `0x09fdb5e5${physicalAddress}`,
        chainId: 8453,
      });

      setStatus("success");
    } catch (err) {
      console.error("Transaction failed:", err);
      setStatus("error");
      setIsApproving(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 to-indigo-100 w-full p-4">
      {/* Splash screen */}
      {!isSDKLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-purple-900 bg-opacity-80">
          <div className="w-24 h-24 border-t-4 border-purple-200 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Glass Card */}
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-sm bg-purple-900 bg-opacity-10 border border-purple-400 border-opacity-50">
        <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-purple-500 blur-2xl opacity-30"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-indigo-600 blur-2xl opacity-30"></div>

        <h1 className="text-3xl font-bold text-center mb-2 text-purple-900">
          Send a Dollar
        </h1>
        <h2 className="text-xl font-medium text-center mb-6 text-black0">
          Get Your Custom QR
        </h2>

        <form onSubmit={submit} className="space-y-6 relative z-10">
          <div className="group">
            <textarea
              name="address"
              placeholder="Enter your physical address"
              required
              className="w-full p-4 bg-purple-300 bg-opacity-30 border border-purple-300 border-opacity-30 rounded-xl text-black placeholder-purple-300 placeholder-opacity-70 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none backdrop-blur-sm transition-all"
              rows={3}
            />
          </div>

          <button
            disabled={isPending || isApproving || status === "processing"}
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
          >
            {isApproving
              ? "Approving USDC..."
              : isPending
              ? "Processing..."
              : "Send $1 for Your QR"}
          </button>

          {/* Status messages */}
          {status === "approving" && (
            <div className="mt-4 p-4 bg-purple-700 bg-opacity-40 text-purple-100 rounded-xl text-center backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-purple-200 rounded-full animate-spin"></div>
                <span>Approving USDC transaction...</span>
              </div>
            </div>
          )}

          {hash && (
            <div className="mt-4 p-4 bg-purple-700 bg-opacity-40 text-purple-100 rounded-xl overflow-hidden backdrop-blur-sm">
              <p className="font-semibold">Transaction Hash:</p>
              <p className="text-xs truncate">{hash}</p>
            </div>
          )}

          {isConfirming && (
            <div className="mt-4 p-4 bg-indigo-700 bg-opacity-40 text-indigo-100 rounded-xl text-center backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-indigo-200 rounded-full animate-spin"></div>
                <span>Confirming transaction...</span>
              </div>
            </div>
          )}

          {isConfirmed && (
            <div className="mt-4 p-4 bg-green-700 bg-opacity-40 text-green-100 rounded-xl text-center backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <svg
                  className="w-6 h-6 mr-2 text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span>
                  Success! Your QR code will be delivered to your address.
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-700 bg-opacity-40 text-red-100 rounded-xl backdrop-blur-sm">
              <p className="font-semibold flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Error:
              </p>
              <p>{(error as Error).message}</p>
            </div>
          )}
        </form>
      </div>

      {/* Base Sepolia badge */}
      <div className="mt-6 text-black flex items-center text-sm">
        <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
        Running on Base Sepolia Network
      </div>
    </div>
  );
}

export default SendTransaction;
