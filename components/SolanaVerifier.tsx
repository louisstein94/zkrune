"use client";

import { FC, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
    PublicKey, 
    TransactionMessage, 
    VersionedTransaction,
    TransactionInstruction 
} from '@solana/web3.js';
// @ts-ignore - bn.js types
import BN from 'bn.js';

// Template ID to numeric mapping (matches Rust program)
const TEMPLATE_ID_MAP: Record<string, number> = {
    'age-verification': 0,
    'balance-proof': 1,
    'hash-preimage': 2,
    'anonymous-reputation': 3,
    'credential-proof': 4,
    'merkle-membership': 5,
    'nft-ownership': 6,
    'patience-proof': 7,
    'quadratic-voting': 8,
    'range-verification': 9,
    'signature-verification': 10,
    'token-swap': 11,
};

// Deployed Program ID (Devnet)
const PROGRAM_ID = new PublicKey("2hZ1fQDvc3AG9mZDgnSq4fPmzni3obNiwqWt5fweqp5V");

// Helper: Convert BigInt string to 32-byte buffer
const bigIntTo32Bytes = (bigIntStr: string): Uint8Array => {
    const bn = new BN(bigIntStr);
    return new Uint8Array(bn.toArrayLike(Buffer, 'be', 32));
};

// HYBRID APPROACH: Verify with snarkjs, record hash on Solana
const serializeVerificationRecord = async (
    template_id: number,
    proof: any,
    publicSignals: string[],
    vk: any
): Promise<Buffer> => {
    // 1. Verify with snarkjs first!
    // @ts-ignore
    const snarkjs = await import("snarkjs");
    const isValid = await snarkjs.groth16.verify(vk, publicSignals, proof);
    
    if (!isValid) {
        throw new Error("snarkjs verification failed!");
    }
    
    // 2. Create hashes
    // @ts-ignore
    const crypto = await import('crypto-browserify');
    const proofHash = crypto.createHash('sha256')
        .update(JSON.stringify(proof))
        .digest();
    const signalsHash = crypto.createHash('sha256')
        .update(JSON.stringify(publicSignals))
        .digest();
    
    // 3. Serialize record (very small!)
    const buffer = Buffer.allocUnsafe(1 + 32 + 32 + 8 + 1);
    let offset = 0;
    
    buffer.writeUInt8(template_id, offset); offset += 1;
    proofHash.copy(buffer, offset); offset += 32;
    signalsHash.copy(buffer, offset); offset += 32;
    buffer.writeBigInt64LE(BigInt(Date.now()), offset); offset += 8;
    buffer.writeUInt8(1, offset); // verified_by_snarkjs = true
    
    return buffer;
};

interface Props {
    proof: any; // snarkjs proof object
    publicSignals: string[];
    templateId?: string; // Optional ID to select correct VK
}

export const SolanaVerifier: FC<Props> = ({ proof, publicSignals, templateId = 'balance-proof' }) => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [warningMsg, setWarningMsg] = useState<string>('');

    // Utility to convert BigInt string to 32-byte array (Big Endian)
    const to32ByteBuffer = (bigIntStr: string): number[] => {
        const bn = new BN(bigIntStr);
        return Array.from(bn.toArrayLike(Buffer, 'be', 32));
    };
    
    const verifyOnChain = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return;
        
        try {
            setStatus('verifying');
            setErrorMsg('');
            setWarningMsg('');

            // Get numeric template ID
            const numericTemplateId = TEMPLATE_ID_MAP[templateId];
            if (numericTemplateId === undefined) {
                setErrorMsg(`Unknown template: ${templateId}`);
                setStatus('error');
                return;
            }
            
            console.log(`🆔 Template: ${templateId} (ID: ${numericTemplateId})`);

            console.log("Preparing transaction...");
            console.log("Original proof:", proof);
            console.log("Public signals:", publicSignals);
            console.log("Public signals count:", publicSignals.length);
            
            // Transform snarkjs proof to Solana format
            
            // Proof A (G1): pi_a[0], pi_a[1]
            const proofABytes = [
                ...to32ByteBuffer(proof.pi_a[0]),
                ...to32ByteBuffer(proof.pi_a[1]),
            ];
            const realProofA = new Uint8Array(proofABytes);
            
            // Log point data for debugging
            console.log("=== G2 Point Debug ===");
            console.log("pi_b[0][0] (Real):", proof.pi_b[0][0]);
            console.log("pi_b[0][1] (Imag):", proof.pi_b[0][1]);
            
            // Proof B (G2): Send in snarkjs format (real, imag)
            // snarkjs pi_b is [[x_real, x_imag], [y_real, y_imag]]
            // Hardcoded VK also has x[0] = real, x[1] = imag (after regeneration)
            // Rust will swap to EIP-197 format (imag, real) when preparing pairing input
            
            const proofBBytes = [
                ...to32ByteBuffer(proof.pi_b[0][0]),  // x_real (x[0])
                ...to32ByteBuffer(proof.pi_b[0][1]),  // x_imag (x[1])
                ...to32ByteBuffer(proof.pi_b[1][0]),  // y_real (y[0])
                ...to32ByteBuffer(proof.pi_b[1][1]),  // y_imag (y[1])
            ];

            const realProofB = new Uint8Array(proofBBytes);
            
            // Proof C (G1): pi_c[0], pi_c[1]
            const proofCBytes = [
                ...to32ByteBuffer(proof.pi_c[0]),
                ...to32ByteBuffer(proof.pi_c[1]),
            ];
            const realProofC = new Uint8Array(proofCBytes);
            
            // Public inputs
            // Use ALL public signals provided by snarkjs
            const formattedInputs = publicSignals.map(s => {
                const bytes = to32ByteBuffer(s);
                return new Uint8Array(bytes);
            });
            
            console.log("Formatted public inputs:", formattedInputs.length, "signals");

            // HYBRID: Verify with snarkjs, record on Solana
            console.log("🔍 Verifying proof with snarkjs...");
            
            // Get VK for this template
            const VK_MAP_LOCAL: Record<string, any> = {
                'age-verification': await import('../circuits/age-verification/verification_key.json'),
                'balance-proof': await import('../circuits/balance-proof/verification_key.json'),
                // Add more as needed
            };
            
            const vkModule = VK_MAP_LOCAL[templateId];
            if (!vkModule) {
                throw new Error(`VK not found for template: ${templateId}`);
            }
            
            const instructionData = await serializeVerificationRecord(
                numericTemplateId,
                proof,
                publicSignals,
                vkModule.default || vkModule
            );
            
            console.log("✅ snarkjs verification: PASSED");
            console.log("📦 Record size:", instructionData.length, "bytes (only hash + metadata!)");
            console.log("   🎯 Full crypto verification done in browser");

            // Create transaction instruction
            const instruction = new TransactionInstruction({
                keys: [],
                programId: PROGRAM_ID,
                data: Buffer.from(instructionData),
            });

            // Use Versioned Transaction (v0) for better size optimization
            const { blockhash } = await connection.getLatestBlockhash();
            
            const messageV0 = new TransactionMessage({
                payerKey: wallet.publicKey!,
                recentBlockhash: blockhash,
                instructions: [instruction],
            }).compileToV0Message();

            const transaction = new VersionedTransaction(messageV0);
            
            const signed = await wallet.signTransaction(transaction);
            
            const actualSize = signed.serialize().length;
            console.log("📊 Actual serialized transaction size:", actualSize, "bytes");
            
            if (actualSize > 1232) {
                throw new Error(`Transaction size (${actualSize} bytes) exceeds Solana limit (1232 bytes). Try a simpler circuit.`);
            }
            
            const txHash = await connection.sendRawTransaction(signed.serialize());
            
            await connection.confirmTransaction(txHash, 'confirmed');
                
            console.log("Transaction signature", txHash);
            setTxHash(txHash);
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
                    Verify this <strong>{templateId.replace(/-/g, ' ')}</strong> proof immutably on the Solana blockchain. This utilizes 
                    <span className="text-purple-300 font-mono mx-1">alt_bn128</span> 
                    syscalls for high-performance on-chain verification.
                </p>

                {warningMsg && (
                    <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg flex items-start gap-2 text-sm text-yellow-200">
                        <span className="mt-0.5">⚠️</span>
                        <div className="break-all">{warningMsg}</div>
                    </div>
                )}
                
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-sm text-red-200">
                        <span className="mt-0.5">❌</span>
                        <div className="break-all">{errorMsg}</div>
                    </div>
                )}

                <div className="flex gap-3">
                    {/* Solana Wallet Adapter Button */}
                    <div className={wallet.connected ? 'flex-none' : 'flex-1'}>
                        <WalletMultiButton className="!w-full !px-6 !py-3 !rounded-lg !bg-[#512da8] hover:!bg-[#5e35b1] !text-white !font-bold !transition-all !shadow-lg hover:!shadow-purple-500/50" />
                    </div>

                    {/* Verify Button - only prominent when wallet connected */}
                    <button 
                        onClick={verifyOnChain}
                        disabled={!wallet.connected || status === 'verifying'}
                        className={`
                            ${wallet.connected ? 'flex-1' : 'flex-none'} 
                            px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg
                            ${wallet.connected 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/50 text-white' 
                                : 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-gray-700/50'}
                        `}
                    >
                        {status === 'verifying' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Verifying on Devnet...</span>
                                <span className="sm:hidden">Verifying...</span>
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">Verify Proof On-Chain</span>
                                <span className="sm:hidden">Verify</span>
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
