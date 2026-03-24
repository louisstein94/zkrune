# zkRune EVM Groth16 Verifier

Deploy and verify Groth16 proofs on Base Sepolia, Ethereum Sepolia, or Base/Ethereum mainnet.

## Base Sepolia deploy

1. Get test ETH: [Coinbase CDP Faucet](https://portal.cdp.coinbase.com/products/faucet) or [Alchemy Base Sepolia](https://www.alchemy.com/faucets/base-sepolia).

2. Copy `.env.example` to `.env` and set `DEPLOYER_PRIVATE_KEY` (the wallet that received faucet ETH).

3. From the **zkrune repo root** (not `evm-verifier` alone if your shell is already elsewhere):

```bash
cd zkrune/evm-verifier   # or: cd /path/to/zkrune/evm-verifier
npm ci
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseSepolia
```

If deploy succeeded but **circuit registration** failed with `nonce too low`, your verifier is already on-chain. Register without redeploying:

```bash
EVM_VERIFIER_ADDRESS=0xYourDeployedVerifier npx hardhat run scripts/registerCircuits.ts --network baseSepolia
```

4. Note the printed contract address. Add to the web app env if needed:

```
NEXT_PUBLIC_EVM_VERIFIER_ADDRESS=0x...
NEXT_PUBLIC_EVM_CHAIN_ID=84532
```

Chain IDs: Base Sepolia `84532`, Ethereum Sepolia `11155111`.

## Local full test (proof + on-chain verify)

```bash
npm run deploy:local:verify
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy:local` | Deploy + register 14 circuits on ephemeral Hardhat |
| `npm run deploy:local:verify` | Same + snarkjs proof + `verifyProofStatic` |
| `npm run deploy:base-sepolia` | Deploy to Base Sepolia (needs `.env`) |
| `npm test` | Hardhat tests |
