// Canonical mainnet verifier contract addresses for zkRune's Groth16
// on-chain verifiers. Single source of truth — referenced by /trust,
// every /enterprise/* vertical, and any future page that anchors
// trust on the on-chain keys.
//
// When a new chain ships, add it here (the type and component pick
// it up automatically).

export interface MainnetVerifier {
  chain: string;
  address: string;
  /** Block explorer URL for the verifier account / contract. */
  explorer: string;
}

export const MAINNET_VERIFIERS: MainnetVerifier[] = [
  {
    chain: "Base",
    address: "0xa03A353d890033aC9b3044776440C2a4c9E849EA",
    explorer:
      "https://basescan.org/address/0xa03A353d890033aC9b3044776440C2a4c9E849EA",
  },
  {
    chain: "Solana",
    address: "9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad",
    explorer:
      "https://solscan.io/account/9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad",
  },
  {
    chain: "Sui",
    address:
      "0x278301424c954dcfdb6e46407728964271fbfff3dc1d4fae5b799c7e977bd4c5",
    explorer:
      "https://suiscan.xyz/mainnet/object/0x278301424c954dcfdb6e46407728964271fbfff3dc1d4fae5b799c7e977bd4c5",
  },
];
