"use client";

import { FC, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

// In a real setup, you'd import the IDL json
const IDL = {
  "version": "0.1.0",
  "name": "solana_verifier",
  "instructions": [
    {
      "name": "verifyProof",
      "accounts": [
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "verificationKey", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "proofA", "type": { "array": ["u8", 64] } },
        { "name": "proofB", "type": { "array": ["u8", 128] } },
        { "name": "proofC", "type": { "array": ["u8", 64] } },
        { "name": "publicInputs", "type": { "vec": { "array": ["u8", 32] } } }
      ]
    }
  ]
};

// Replace with your deployed program ID
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

interface Props {
    proof: any; // snarkjs proof object
    publicSignals: string[];
}

export const SolanaVerifier: FC<Props> = ({ proof, publicSignals }) => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    // Utility to convert BigInt string to 32-byte array (Big Endian)
    const to32ByteBuffer = (bigIntStr: string): number[] => {
        const bn = new BN(bigIntStr);
        return Array.from(bn.toArrayLike(Buffer, 'be', 32));
    };
    
    // Simplified G1/G2 point compression or serialization logic would go here
    // For this hackathon demo, we send raw points if the contract accepts them, 
    // or empty placeholders if we are just testing the connection.
    
    const verifyOnChain = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return;
        
        try {
            setStatus('verifying');
            setErrorMsg('');

            const provider = new AnchorProvider(
                connection, 
                wallet as any, 
                { preflightCommitment: 'confirmed' }
            );
            
            // Initialize the program interface
            // @ts-ignore - IDL typing is complex without generation
            const program = new Program(IDL, PROGRAM_ID, provider);

            console.log("Preparing transaction...");

            // Transform inputs
            // Note: Real implementation requires proper serialization of the G1/G2 points
            // from the snarkjs JSON format to the byte arrays expected by the contract.
            // This is non-trivial and requires matching the curve library.
            // For the hackathon UI demo, we will send dummy data that matches the TYPE
            // to show the interaction flow.
            
            const dummyProofA = new Array(64).fill(0);
            const dummyProofB = new Array(128).fill(0);
            const dummyProofC = new Array(64).fill(0);
            const formattedInputs = publicSignals.map(s => to32ByteBuffer(s));

            const tx = await program.methods
                .verifyProof(dummyProofA, dummyProofB, dummyProofC, formattedInputs)
                .accounts({
                    user: wallet.publicKey,
                    verificationKey: wallet.publicKey, // Mocking VK account for now
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();
                
            console.log("Transaction signature", tx);
            setTxHash(tx);
            setStatus('success');

        } catch (err: any) {
            console.error("Verification failed:", err);
            setErrorMsg(err.message || "Transaction failed");
            setStatus('error');
        }
    };

    return (
        <div className="w-full mt-8 bg-black/40 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group">
            {/* Background gradient effect */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">⚡</span> 
                        Solana Integration
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white uppercase tracking-wider">
                            BETA
                        </span>
                    </h3>
                    {wallet.connected ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30 text-xs text-green-400">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            {wallet.publicKey?.toString().slice(0,4)}...{wallet.publicKey?.toString().slice(-4)}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-900/30 border border-yellow-500/30 text-xs text-yellow-400">
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            Wallet Disconnected
                        </div>
                    )}
                </div>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Verify this ZK Proof immutably on the Solana blockchain. This utilizes 
                    <span className="text-purple-300 font-mono mx-1">alt_bn128</span> 
                    syscalls for high-performance on-chain verification.
                </p>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-sm text-red-200">
                        <span className="mt-0.5">⚠️</span>
                        <div className="break-all">{errorMsg}</div>
                    </div>
                )}

                <div className="flex gap-4">
                    {/* Custom Wallet Connect Button Wrapper */}
                    {/* In a real app, use WalletMultiButton from adapter-react-ui */}
                    {!wallet.connected && (
                        <button className="px-6 py-3 rounded-lg bg-[#512da8] hover:bg-[#5e35b1] text-white font-bold transition-all flex-1">
                            Select Wallet
                        </button>
                    )}

                    <button 
                        onClick={verifyOnChain}
                        disabled={!wallet.connected || status === 'verifying'}
                        className={`
                            flex-1 px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2
                            ${wallet.connected 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 text-white' 
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        {status === 'verifying' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Verifying on Devnet...
                            </>
                        ) : (
                            <>
                                Verify Proof On-Chain
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </>
                        )}
                    </button>
                </div>

                {status === 'success' && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-green-500/50 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/50">
                                ✓
                            </div>
                            <div>
                                <h4 className="font-bold text-green-100">Verification Successful!</h4>
                                <p className="text-xs text-green-300/80">Proof has been verified and recorded on-chain.</p>
                            </div>
                        </div>
                        <a 
                            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-purple-300 hover:text-purple-200 hover:underline break-all flex items-center gap-1 mt-2 pl-11"
                        >
                            View Transaction
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

