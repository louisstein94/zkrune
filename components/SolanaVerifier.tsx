"use client";

import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
    PublicKey, 
    Transaction,
    TransactionInstruction 
} from '@solana/web3.js';

// Deployed Program ID (Devnet) - zkRune Groth16 Verifier
const PROGRAM_ID = new PublicKey("9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad");

// BN254 curve prime field modulus (for negation)
const BN254_PRIME = BigInt('21888242871839275222246405745257275088696311157297823662689037894645226208583');

// Template ID to numeric mapping (matches Rust program)
const TEMPLATE_ID_MAP: Record<string, number> = {
    'age-verification': 0,
    'balance-proof': 1,
    'membership-proof': 2,
    'credential-proof': 3,
    'private-voting': 4,
    'nft-ownership': 5,
    'range-proof': 6,
    'hash-preimage': 7,
    'quadratic-voting': 8,
    'anonymous-reputation': 9,
    'token-swap': 10,
    'patience-proof': 11,
    'signature-verification': 12,
};

/**
 * Convert a decimal string to a 32-byte big-endian array
 */
function fieldToBytes(decimalStr: string): Uint8Array {
    let n = BigInt(decimalStr);
    n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
    
    const bytes = new Uint8Array(32);
    for (let i = 31; i >= 0; i--) {
        bytes[i] = Number(n & BigInt(0xff));
        n = n >> BigInt(8);
    }
    return bytes;
}

/**
 * Negate G1 point y-coordinate: (x, y) → (x, p - y)
 */
function negateG1(point: string[]): string[] {
    const y = BigInt(point[1]);
    const negY = y === BigInt(0) ? BigInt(0) : BN254_PRIME - (y % BN254_PRIME);
    return [point[0], negY.toString()];
}

/**
 * Convert G1 point to 64 bytes (Light Protocol format: direct BE)
 */
function g1ToBytes(point: string[]): Uint8Array {
    const result = new Uint8Array(64);
    result.set(fieldToBytes(point[0]), 0);  // x BE
    result.set(fieldToBytes(point[1]), 32); // y BE
    return result;
}

/**
 * Convert G2 point to 128 bytes (Light Protocol format)
 * snarkjs format: [[x.c1, x.c0], [y.c1, y.c0]]
 * Output: [x.c0 BE, x.c1 BE, y.c0 BE, y.c1 BE]
 */
function g2ToBytes(point: string[][]): Uint8Array {
    const result = new Uint8Array(128);
    // snarkjs: point[0] = [x.c1, x.c0], point[1] = [y.c1, y.c0]
    result.set(fieldToBytes(point[0][1]), 0);   // x.c0 BE
    result.set(fieldToBytes(point[0][0]), 32);  // x.c1 BE
    result.set(fieldToBytes(point[1][1]), 64);  // y.c0 BE
    result.set(fieldToBytes(point[1][0]), 96);  // y.c1 BE
    return result;
}

/**
 * Serialize proof for on-chain Groth16 verification
 */
function serializeProof(
    templateId: number,
    proof: any,
    publicSignals: string[]
): Uint8Array {
    const size = 1 + 64 + 128 + 64 + (publicSignals.length * 32);
    const data = new Uint8Array(size);
    
    let offset = 0;
    
    // Template ID (1 byte)
    data[offset] = templateId;
    offset += 1;
    
    // Proof A (64 bytes - G1 point, NEGATED)
    const negatedA = negateG1(proof.pi_a);
    data.set(g1ToBytes(negatedA), offset);
    offset += 64;
    
    // Proof B (128 bytes - G2 point)
    data.set(g2ToBytes(proof.pi_b), offset);
    offset += 128;
    
    // Proof C (64 bytes - G1 point)
    data.set(g1ToBytes(proof.pi_c), offset);
    offset += 64;
    
    // Public inputs (n * 32 bytes, big-endian)
    for (const input of publicSignals) {
        data.set(fieldToBytes(input), offset);
        offset += 32;
    }
    
    return data;
}

interface Props {
    proof: any; // snarkjs proof object
    publicSignals: string[];
    templateId?: string;
}

export const SolanaVerifier: FC<Props> = ({ proof, publicSignals, templateId = 'age-verification' }) => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    
    const verifyOnChain = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return;
        
        try {
            setStatus('verifying');
            setErrorMsg('');

            // Get numeric template ID
            const numericTemplateId = TEMPLATE_ID_MAP[templateId];
            if (numericTemplateId === undefined) {
                setErrorMsg(`Template "${templateId}" is not supported for on-chain verification.`);
                setStatus('error');
                return;
            }
            
            console.log(`Verifying on-chain: ${templateId} (ID: ${numericTemplateId})`);
            console.log('Public signals:', publicSignals);

            // Serialize proof in Light Protocol format
            const instructionData = serializeProof(numericTemplateId, proof, publicSignals);
            console.log('Instruction data size:', instructionData.length, 'bytes');

            // Create transaction instruction
            const instruction = new TransactionInstruction({
                keys: [],
                programId: PROGRAM_ID,
                data: Buffer.from(instructionData),
            });

            // Create and send transaction
            const transaction = new Transaction().add(instruction);
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            const signed = await wallet.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signed.serialize());
            
            console.log('Transaction sent:', signature);
            
            // Wait for confirmation
            await connection.confirmTransaction(signature, 'confirmed');
            
            console.log('Verification successful!');
            setTxHash(signature);
            setStatus('success');

        } catch (err: any) {
            console.error("On-chain verification failed:", err);
            
            // Parse error message
            let message = err.message || "Transaction failed";
            if (message.includes('ProofVerificationFailed')) {
                message = "Proof verification failed on-chain. Please regenerate the proof.";
            } else if (message.includes('insufficient funds')) {
                message = "Insufficient SOL for transaction. Get devnet SOL from a faucet.";
            }
            
            setErrorMsg(message);
            setStatus('error');
        }
    };

    return (
        <div className="w-full mt-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
            {/* Background effect */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 128 128" fill="currentColor">
                            <path d="M93.94 42.63c13.48 0 24.42 10.94 24.42 24.42s-10.94 24.42-24.42 24.42H49.88L93.94 42.63zM34.06 85.37c-13.48 0-24.42-10.94-24.42-24.42s10.94-24.42 24.42-24.42h44.06L34.06 85.37z"/>
                        </svg>
                        Verify on Solana
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-600/30 text-green-400 border border-green-500/30">
                            DEVNET
                        </span>
                    </h3>
                    {wallet.connected && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30 text-xs text-green-400">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            {wallet.publicKey?.toString().slice(0,4)}...{wallet.publicKey?.toString().slice(-4)}
                        </div>
                    )}
                </div>

                <p className="text-gray-400 text-sm mb-4">
                    Submit this proof to Solana for cryptographic verification using Groth16 pairing checks.
                    This is <strong className="text-purple-300">real on-chain verification</strong> using altbn254 syscalls.
                </p>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-sm text-red-200">
                        {errorMsg}
                    </div>
                )}

                <div className="flex gap-3">
                    <div className={wallet.connected ? 'flex-none' : 'flex-1'}>
                        <WalletMultiButton className="!w-full !px-4 !py-2.5 !rounded-lg !bg-[#512da8] hover:!bg-[#5e35b1] !text-white !font-medium !text-sm" />
                    </div>

                    {wallet.connected && (
                        <button 
                            onClick={verifyOnChain}
                            disabled={status === 'verifying'}
                            className={`
                                flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                                ${status === 'verifying' 
                                    ? 'bg-purple-600/50 cursor-wait' 
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'}
                                text-white
                            `}
                        >
                            {status === 'verifying' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify On-Chain
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {status === 'success' && (
                    <div className="mt-4 p-4 bg-green-900/30 border border-green-500/40 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl">
                                ✓
                            </div>
                            <div>
                                <h4 className="font-bold text-green-100">Verified On-Chain!</h4>
                                <p className="text-xs text-green-300/80">Groth16 proof verified using Solana altbn254 syscalls</p>
                            </div>
                        </div>
                        <a 
                            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-sm text-purple-300 hover:text-purple-200 hover:underline"
                        >
                            View on Solana Explorer
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
