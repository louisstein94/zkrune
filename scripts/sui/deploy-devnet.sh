#!/usr/bin/env bash
# Publish zkrune Groth16 verifier to Sui devnet (uses active CLI wallet + gas).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/sui-groth16-verifier"

if command -v brew >/dev/null 2>&1; then
  eval "$(brew shellenv)" 2>/dev/null || true
fi

if ! command -v sui >/dev/null 2>&1; then
  echo "sui CLI not found. Install: brew install sui"
  exit 1
fi

echo "Switching to devnet..."
sui client switch --env devnet

echo "Active address / gas:"
sui client active-address
GAS_OUT=$(sui client gas 2>&1) || true
echo "$GAS_OUT"
if echo "$GAS_OUT" | grep -qi "No gas coins"; then
  echo ""
  echo "Devnet'te SUI yok. Faucet isteği gönderiliyor (birkaç saniye bekle)..."
  sui client faucet || {
    echo "Faucet başarısız oldu. Elle dene: sui client faucet"
    echo "veya https://docs.sui.io/guides/developer/getting-started/get-coins"
    exit 1
  }
  sleep 3
  sui client gas
fi

# Devnet geçici ağ: `sui client publish -e` desteklenmiyor; doğru yol test-publish + pubfile.
# Derleme testnet (veya mainnet) bağımlılıklarıyla yapılır, tx devnet'e gider.
BUILD_ENV="${SUI_BUILD_ENV:-testnet}"
PUBFILE="$ROOT/sui-groth16-verifier/Pub.devnet.toml"

echo ""
echo "Publishing via test-publish (network=devnet, build-env=${BUILD_ENV})..."
echo "Ephemeral pubfile: $PUBFILE"
sui client test-publish \
  --pubfile-path "$PUBFILE" \
  -e "$BUILD_ENV" \
  --gas-budget 500000000 \
  .

echo ""
echo "Next steps:"
echo "  1. From the output, copy: PackageID, AdminCap object (owned), VerifierRegistry (shared)."
echo "  2. export SUI_PACKAGE_ID=0x..."
echo "     export SUI_VERIFIER_REGISTRY_ID=0x..."
echo "     export SUI_ADMIN_CAP_ID=0x..."
echo "  3. npm run sui:register:devnet"
echo "  4. Add to .env.local: NEXT_PUBLIC_SUI_NETWORK=devnet and the three IDs as NEXT_PUBLIC_* (see .env.example)."
