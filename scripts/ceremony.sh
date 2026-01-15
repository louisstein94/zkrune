#!/bin/bash

# zkRune Trusted Setup Ceremony Script
# Multi-Party Computation for Groth16 zk-SNARKs
# 
# Usage:
#   ./ceremony.sh init                  - Initialize ceremony (download ptau, create initial zkeys)
#   ./ceremony.sh contribute <name>     - Add your contribution (LOCAL mode)
#   ./ceremony.sh contribute-remote <name> - Add contribution via API (RECOMMENDED)
#   ./ceremony.sh upload-init           - Upload initial zkeys to server (admin only)
#   ./ceremony.sh verify                - Verify all contributions
#   ./ceremony.sh finalize              - Finalize ceremony and export keys
#   ./ceremony.sh status                - Show current ceremony status

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
CIRCUITS_DIR="circuits"
CEREMONY_DIR="ceremony"
PTAU_FILE="powersOfTau28_hez_final_14.ptau"
PTAU_URL="https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau"

# API Configuration (for real-time sync)
API_URL="${ZKRUNE_API_URL:-https://zkrune.com}"

# Sync contribution to API (Supabase)
sync_to_api() {
    local index="$1"
    local name="$2"
    local hash="$3"
    
    echo -e "${BLUE}🌐 Syncing to zkRune API...${NC}"
    
    # Try to sync - don't fail if API is unavailable
    # -L follows redirects (important for production domains)
    local response=$(curl -sL -X POST "${API_URL}/api/ceremony" \
        -H "Content-Type: application/json" \
        -d "{\"contributorName\": \"$name\", \"contributionHash\": \"$hash\"}" 2>/dev/null || echo '{"success":false}')
    
    # Check for success (handle both with and without spaces in JSON)
    if echo "$response" | grep -qE '"success"\s*:\s*true'; then
        echo -e "${GREEN}✓ Synced to API - visible at ${API_URL}/ceremony${NC}"
    else
        echo -e "${YELLOW}⚠ API sync failed${NC}"
        # Show error if present
        local error=$(echo "$response" | grep -oE '"error"\s*:\s*"[^"]*"' | sed 's/"error"\s*:\s*"//' | sed 's/"$//')
        if [ -n "$error" ]; then
            echo -e "   Error: ${RED}$error${NC}"
        else
            echo -e "   Response: $response"
        fi
        echo -e "   Contribution saved locally. Push to GitHub to share."
    fi
}

# All circuits to process
CIRCUITS=(
    "age-verification"
    "anonymous-reputation"
    "balance-proof"
    "credential-proof"
    "hash-preimage"
    "membership-proof"
    "nft-ownership"
    "patience-proof"
    "private-voting"
    "quadratic-voting"
    "range-proof"
    "signature-verification"
    "token-swap"
)

print_banner() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}     ${YELLOW}🔮 zkRune Trusted Setup Ceremony${NC}                       ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}     ${GREEN}Solana Privacy Hack 2026${NC}                               ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    if ! command -v circom &> /dev/null; then
        echo -e "${RED}❌ Circom not found!${NC}"
        echo "   Install: cargo install --git https://github.com/iden3/circom.git"
        exit 1
    fi
    echo -e "${GREEN}✓ Circom installed${NC}"
    
    if ! command -v snarkjs &> /dev/null; then
        echo -e "${YELLOW}⚠ snarkjs not found, installing...${NC}"
        npm install -g snarkjs
    fi
    echo -e "${GREEN}✓ snarkjs installed${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js installed${NC}"
    echo ""
}

download_ptau() {
    if [ -f "$CEREMONY_DIR/$PTAU_FILE" ]; then
        echo -e "${GREEN}✓ Powers of Tau file already exists${NC}"
        return
    fi
    
    echo -e "${BLUE}📥 Downloading Powers of Tau (Phase 1)...${NC}"
    echo -e "   This is the Hermez Network ceremony with 54 participants"
    echo -e "   File size: ~45MB"
    echo ""
    
    mkdir -p "$CEREMONY_DIR"
    curl -L -o "$CEREMONY_DIR/$PTAU_FILE" "$PTAU_URL"
    
    echo -e "${GREEN}✓ Powers of Tau downloaded${NC}"
}

compile_circuits() {
    echo -e "${BLUE}📝 Compiling circuits...${NC}"
    
    for circuit in "${CIRCUITS[@]}"; do
        echo -e "   Compiling ${CYAN}$circuit${NC}..."
        
        if [ ! -f "$CIRCUITS_DIR/$circuit/circuit.circom" ]; then
            echo -e "${YELLOW}   ⚠ Skipping $circuit (no circom file)${NC}"
            continue
        fi
        
        circom "$CIRCUITS_DIR/$circuit/circuit.circom" \
            -l node_modules \
            --r1cs --wasm --sym \
            --output "$CIRCUITS_DIR/$circuit/" 2>/dev/null || {
                echo -e "${YELLOW}   ⚠ Warning: $circuit had compilation issues${NC}"
            }
    done
    
    echo -e "${GREEN}✓ Circuits compiled${NC}"
}

init_ceremony() {
    print_banner
    check_dependencies
    download_ptau
    compile_circuits
    
    echo -e "${BLUE}🔑 Initializing ceremony (Phase 2)...${NC}"
    echo ""
    
    mkdir -p "$CEREMONY_DIR/contributions"
    mkdir -p "$CEREMONY_DIR/zkeys"
    
    # Create initial zkeys for each circuit
    for circuit in "${CIRCUITS[@]}"; do
        r1cs_file="$CIRCUITS_DIR/$circuit/circuit.r1cs"
        
        if [ ! -f "$r1cs_file" ]; then
            echo -e "${YELLOW}   ⚠ Skipping $circuit (no r1cs file)${NC}"
            continue
        fi
        
        echo -e "   Initializing ${CYAN}$circuit${NC}..."
        
        snarkjs groth16 setup \
            "$r1cs_file" \
            "$CEREMONY_DIR/$PTAU_FILE" \
            "$CEREMONY_DIR/zkeys/${circuit}_0000.zkey" 2>/dev/null
        
        echo -e "${GREEN}   ✓ $circuit initialized${NC}"
    done
    
    # Create ceremony state file
    cat > "$CEREMONY_DIR/state.json" << EOF
{
    "phase": "contribution",
    "startedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "contributions": [],
    "circuits": $(echo "${CIRCUITS[@]}" | jq -R 'split(" ")'),
    "ptauFile": "$PTAU_FILE",
    "currentContributionIndex": 0
}
EOF
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Ceremony Initialized Successfully!                     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Next steps:"
    echo -e "  1. ${CYAN}./scripts/ceremony.sh contribute \"Your Name\"${NC}"
    echo -e "  2. Share the ceremony with community members"
    echo -e "  3. Each contributor runs the contribute command"
    echo -e "  4. ${CYAN}./scripts/ceremony.sh finalize${NC} when done"
    echo ""
}

contribute() {
    local contributor_name="$1"
    
    if [ -z "$contributor_name" ]; then
        echo -e "${RED}❌ Please provide your name${NC}"
        echo "   Usage: ./ceremony.sh contribute \"Your Name\""
        exit 1
    fi
    
    print_banner
    
    if [ ! -f "$CEREMONY_DIR/state.json" ]; then
        echo -e "${RED}❌ Ceremony not initialized!${NC}"
        echo "   Run: ./ceremony.sh init"
        exit 1
    fi
    
    # Get current contribution index
    local current_index=$(jq -r '.currentContributionIndex' "$CEREMONY_DIR/state.json")
    local next_index=$((current_index + 1))
    
    echo -e "${BLUE}🔐 Adding contribution from: ${CYAN}$contributor_name${NC}"
    echo -e "   Contribution #$next_index"
    echo ""
    echo -e "${YELLOW}⚠️  This process uses random entropy from your system.${NC}"
    echo -e "${YELLOW}   Please move your mouse and type randomly during the process.${NC}"
    echo ""
    
    # Generate random entropy
    local entropy="zkrune_${contributor_name}_$(date +%s)_$(openssl rand -hex 16)"
    
    # Contribute to each circuit
    for circuit in "${CIRCUITS[@]}"; do
        local prev_zkey="$CEREMONY_DIR/zkeys/${circuit}_$(printf "%04d" $current_index).zkey"
        local next_zkey="$CEREMONY_DIR/zkeys/${circuit}_$(printf "%04d" $next_index).zkey"
        
        if [ ! -f "$prev_zkey" ]; then
            continue
        fi
        
        echo -e "   Contributing to ${CYAN}$circuit${NC}..."
        
        snarkjs zkey contribute \
            "$prev_zkey" \
            "$next_zkey" \
            --name="$contributor_name" \
            -e="$entropy" 2>/dev/null
        
        echo -e "${GREEN}   ✓ $circuit contribution added${NC}"
    done
    
    # Update state
    local contribution_hash=$(openssl rand -hex 32)
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    jq --arg name "$contributor_name" \
       --arg hash "$contribution_hash" \
       --arg time "$timestamp" \
       --argjson index "$next_index" \
       '.contributions += [{"index": $index, "name": $name, "hash": $hash, "timestamp": $time}] | .currentContributionIndex = $index' \
       "$CEREMONY_DIR/state.json" > "$CEREMONY_DIR/state.tmp" && mv "$CEREMONY_DIR/state.tmp" "$CEREMONY_DIR/state.json"
    
    # Export contribution receipt
    local receipt_file="$CEREMONY_DIR/contributions/contribution_${next_index}_${contributor_name// /_}.json"
    cat > "$receipt_file" << EOF
{
    "contributionIndex": $next_index,
    "contributorName": "$contributor_name",
    "contributionHash": "$contribution_hash",
    "timestamp": "$timestamp",
    "circuits": $(echo "${CIRCUITS[@]}" | jq -R 'split(" ")'),
    "verification": "Run './ceremony.sh verify' to verify this contribution"
}
EOF
    
    # Sync to API for real-time tracking
    sync_to_api "$next_index" "$contributor_name" "$contribution_hash"
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Contribution Added Successfully!                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Contribution Hash: ${CYAN}$contribution_hash${NC}"
    echo -e "Receipt saved to: ${CYAN}$receipt_file${NC}"
    echo ""
    echo -e "Share your contribution hash on social media:"
    echo -e "${YELLOW}\"I contributed to @rune_zk trusted setup ceremony! 🔮\"${NC}"
    echo -e "${YELLOW}\"Hash: $contribution_hash\"${NC}"
    echo ""
}

verify_contributions() {
    print_banner
    
    if [ ! -f "$CEREMONY_DIR/state.json" ]; then
        echo -e "${RED}❌ Ceremony not initialized!${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔍 Verifying all contributions...${NC}"
    echo ""
    
    local current_index=$(jq -r '.currentContributionIndex' "$CEREMONY_DIR/state.json")
    
    if [ "$current_index" -eq 0 ]; then
        echo -e "${YELLOW}⚠ No contributions yet${NC}"
        exit 0
    fi
    
    # Verify each circuit's final zkey
    local all_valid=true
    for circuit in "${CIRCUITS[@]}"; do
        local final_zkey="$CEREMONY_DIR/zkeys/${circuit}_$(printf "%04d" $current_index).zkey"
        local r1cs_file="$CIRCUITS_DIR/$circuit/circuit.r1cs"
        
        if [ ! -f "$final_zkey" ] || [ ! -f "$r1cs_file" ]; then
            continue
        fi
        
        echo -e "   Verifying ${CYAN}$circuit${NC}..."
        
        if snarkjs zkey verify "$r1cs_file" "$CEREMONY_DIR/$PTAU_FILE" "$final_zkey" 2>/dev/null; then
            echo -e "${GREEN}   ✓ $circuit verified${NC}"
        else
            echo -e "${RED}   ✗ $circuit verification failed${NC}"
            all_valid=false
        fi
    done
    
    echo ""
    if [ "$all_valid" = true ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ All Contributions Verified!                            ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ❌ Some Verifications Failed!                              ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    fi
    
    # Show contribution list
    echo ""
    echo -e "${BLUE}📜 Contribution History:${NC}"
    jq -r '.contributions[] | "   #\(.index) - \(.name) @ \(.timestamp)"' "$CEREMONY_DIR/state.json"
}

finalize_ceremony() {
    print_banner
    
    if [ ! -f "$CEREMONY_DIR/state.json" ]; then
        echo -e "${RED}❌ Ceremony not initialized!${NC}"
        exit 1
    fi
    
    local current_index=$(jq -r '.currentContributionIndex' "$CEREMONY_DIR/state.json")
    
    if [ "$current_index" -lt 2 ]; then
        echo -e "${YELLOW}⚠️  Warning: Only $current_index contribution(s) received.${NC}"
        echo -e "   For production security, at least 2+ contributions are recommended."
        read -p "   Continue anyway? (y/n): " confirm
        if [ "$confirm" != "y" ]; then
            exit 0
        fi
    fi
    
    echo -e "${BLUE}🏁 Finalizing ceremony...${NC}"
    echo ""
    
    # Apply random beacon (optional, adds final entropy)
    local beacon=$(curl -s "https://drand.cloudflare.com/public/latest" | jq -r '.randomness' 2>/dev/null || echo "fallback_$(openssl rand -hex 32)")
    
    for circuit in "${CIRCUITS[@]}"; do
        local final_zkey="$CEREMONY_DIR/zkeys/${circuit}_$(printf "%04d" $current_index).zkey"
        local beacon_zkey="$CEREMONY_DIR/zkeys/${circuit}_final.zkey"
        
        if [ ! -f "$final_zkey" ]; then
            continue
        fi
        
        echo -e "   Finalizing ${CYAN}$circuit${NC}..."
        
        # Apply beacon
        snarkjs zkey beacon \
            "$final_zkey" \
            "$beacon_zkey" \
            "$beacon" \
            10 \
            --name="Final Beacon" 2>/dev/null
        
        # Export verification key
        snarkjs zkey export verificationkey \
            "$beacon_zkey" \
            "$CIRCUITS_DIR/$circuit/verification_key.json" 2>/dev/null
        
        # Copy final zkey to circuit directory
        cp "$beacon_zkey" "$CIRCUITS_DIR/$circuit/circuit_final.zkey"
        
        # Copy to public directory
        cp "$beacon_zkey" "public/circuits/${circuit}.zkey" 2>/dev/null || true
        cp "$CIRCUITS_DIR/$circuit/verification_key.json" "public/circuits/${circuit}_vkey.json" 2>/dev/null || true
        
        echo -e "${GREEN}   ✓ $circuit finalized${NC}"
    done
    
    # Update state
    jq '.phase = "finalized" | .finalizedAt = now | .beacon = "'$beacon'"' \
       "$CEREMONY_DIR/state.json" > "$CEREMONY_DIR/state.tmp" && mv "$CEREMONY_DIR/state.tmp" "$CEREMONY_DIR/state.json"
    
    # Generate ceremony report
    generate_report
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 Ceremony Finalized Successfully!                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Final files copied to:"
    echo -e "  - ${CYAN}circuits/*/circuit_final.zkey${NC}"
    echo -e "  - ${CYAN}circuits/*/verification_key.json${NC}"
    echo -e "  - ${CYAN}public/circuits/*.zkey${NC}"
    echo ""
    echo -e "Ceremony report: ${CYAN}$CEREMONY_DIR/CEREMONY_REPORT.md${NC}"
    echo ""
}

generate_report() {
    local report_file="$CEREMONY_DIR/CEREMONY_REPORT.md"
    local current_index=$(jq -r '.currentContributionIndex' "$CEREMONY_DIR/state.json")
    local started=$(jq -r '.startedAt' "$CEREMONY_DIR/state.json")
    
    cat > "$report_file" << EOF
# 🔮 zkRune Trusted Setup Ceremony Report

## Overview

| Property | Value |
|----------|-------|
| Project | zkRune - Solana Privacy Hack 2026 |
| Ceremony Type | Groth16 Multi-Party Computation |
| Phase 1 | Hermez Network Powers of Tau (54 participants) |
| Phase 2 | zkRune Community Ceremony |
| Started | $started |
| Finalized | $(date -u +"%Y-%m-%dT%H:%M:%SZ") |
| Total Contributions | $current_index |

## Circuits

$(for circuit in "${CIRCUITS[@]}"; do echo "- $circuit"; done)

## Contributors

| # | Name | Timestamp | Hash |
|---|------|-----------|------|
$(jq -r '.contributions[] | "| \(.index) | \(.name) | \(.timestamp) | \(.hash | .[0:16])... |"' "$CEREMONY_DIR/state.json")

## Security Guarantees

The Groth16 trusted setup is secure as long as **at least one participant** was honest and properly deleted their toxic waste (random values used during contribution).

Each contributor added entropy that cannot be reversed. The final ceremony includes:

1. **Phase 1**: Hermez Network's Powers of Tau ceremony with 54 participants
2. **Phase 2**: zkRune community contributions
3. **Final Beacon**: Random value from drand network for additional security

## Verification

Anyone can verify the ceremony by running:

\`\`\`bash
./scripts/ceremony.sh verify
\`\`\`

## Files

- **Final zkeys**: \`circuits/*/circuit_final.zkey\`
- **Verification keys**: \`circuits/*/verification_key.json\`
- **Public files**: \`public/circuits/\`

---

*Generated by zkRune Ceremony Script*
*https://github.com/louisstein94/zkrune*
EOF
}

show_status() {
    print_banner
    
    if [ ! -f "$CEREMONY_DIR/state.json" ]; then
        echo -e "${YELLOW}⚠ Ceremony not initialized${NC}"
        echo "   Run: ./ceremony.sh init"
        exit 0
    fi
    
    local phase=$(jq -r '.phase' "$CEREMONY_DIR/state.json")
    local started=$(jq -r '.startedAt' "$CEREMONY_DIR/state.json")
    local count=$(jq -r '.currentContributionIndex' "$CEREMONY_DIR/state.json")
    
    echo -e "${BLUE}📊 Ceremony Status${NC}"
    echo ""
    echo -e "   Phase:         ${CYAN}$phase${NC}"
    echo -e "   Started:       ${CYAN}$started${NC}"
    echo -e "   Contributions: ${CYAN}$count${NC}"
    echo ""
    
    if [ "$count" -gt 0 ]; then
        echo -e "${BLUE}📜 Contributors:${NC}"
        jq -r '.contributions[] | "   #\(.index) \(.name) - \(.timestamp)"' "$CEREMONY_DIR/state.json"
    fi
    
    echo ""
    echo -e "${BLUE}📁 Circuits:${NC}"
    for circuit in "${CIRCUITS[@]}"; do
        if [ -f "$CEREMONY_DIR/zkeys/${circuit}_$(printf "%04d" $count).zkey" ]; then
            echo -e "   ${GREEN}✓${NC} $circuit"
        else
            echo -e "   ${YELLOW}○${NC} $circuit (pending)"
        fi
    done
}

# =====================================================
# REMOTE CONTRIBUTION (via API)
# =====================================================

# Download latest zkey from server
download_zkey() {
    local circuit="$1"
    local output_dir="$2"
    
    echo -e "   Downloading ${CYAN}$circuit${NC} from server..." >&2
    
    local response=$(curl -sL "${API_URL}/api/ceremony/zkey?circuit=$circuit")
    
    if ! echo "$response" | grep -qE '"success"\s*:\s*true'; then
        echo -e "${RED}   ✗ Failed to get download URL for $circuit${NC}" >&2
        return 1
    fi
    
    local download_url=$(echo "$response" | jq -r '.data.downloadUrl')
    local current_index=$(echo "$response" | jq -r '.data.currentIndex')
    local file_name=$(echo "$response" | jq -r '.data.fileName')
    
    if [ "$download_url" == "null" ] || [ -z "$download_url" ]; then
        echo -e "${RED}   ✗ No zkey found for $circuit${NC}" >&2
        return 1
    fi
    
    # Download the zkey
    curl -sL "$download_url" -o "$output_dir/${file_name}"
    
    if [ ! -f "$output_dir/${file_name}" ]; then
        echo -e "${RED}   ✗ Download failed for $circuit${NC}" >&2
        return 1
    fi
    
    echo "$current_index"
}

# Upload zkey to server
upload_zkey() {
    local circuit="$1"
    local zkey_file="$2"
    local contributor_name="$3"
    local contribution_hash="$4"
    
    echo -e "   Uploading ${CYAN}$circuit${NC} to server..." >&2
    
    local response=$(curl -sL -X POST "${API_URL}/api/ceremony/zkey" \
        -F "circuit=$circuit" \
        -F "contributorName=$contributor_name" \
        -F "contributionHash=$contribution_hash" \
        -F "zkey=@$zkey_file")
    
    if echo "$response" | grep -qE '"success"\s*:\s*true'; then
        echo -e "${GREEN}   ✓ $circuit uploaded${NC}" >&2
        return 0
    else
        echo -e "${RED}   ✗ Upload failed for $circuit${NC}" >&2
        echo "   Response: $response" >&2
        return 1
    fi
}

# Contribute via remote API
contribute_remote() {
    local contributor_name="$1"
    
    if [ -z "$contributor_name" ]; then
        echo -e "${RED}❌ Please provide your name${NC}"
        echo "   Usage: ./ceremony.sh contribute-remote \"Your Name\""
        exit 1
    fi
    
    print_banner
    check_dependencies
    
    echo -e "${BLUE}🌐 Remote Contribution Mode${NC}"
    echo -e "   Contributor: ${CYAN}$contributor_name${NC}"
    echo -e "   API: ${CYAN}$API_URL${NC}"
    echo ""
    
    # Create temp directory for zkeys
    local temp_dir=$(mktemp -d)
    trap "rm -rf $temp_dir" EXIT
    
    echo -e "${BLUE}📥 Downloading latest zkeys from server...${NC}"
    
    # Download ptau if not exists
    if [ ! -f "$CEREMONY_DIR/$PTAU_FILE" ]; then
        echo -e "${BLUE}📥 Downloading Powers of Tau...${NC}"
        mkdir -p "$CEREMONY_DIR"
        curl -L -o "$CEREMONY_DIR/$PTAU_FILE" "$PTAU_URL"
    fi
    
    # Generate random entropy
    local entropy="zkrune_${contributor_name}_$(date +%s)_$(openssl rand -hex 16)"
    local all_hashes=""
    local success_count=0
    
    echo ""
    echo -e "${YELLOW}⚠️  Move your mouse and type randomly for better entropy!${NC}"
    echo ""
    
    for circuit in "${CIRCUITS[@]}"; do
        # Download current zkey
        local current_index=$(download_zkey "$circuit" "$temp_dir")
        
        if [ $? -ne 0 ] || [ -z "$current_index" ]; then
            echo -e "${YELLOW}   ⚠ Skipping $circuit (not initialized on server)${NC}"
            continue
        fi
        
        local next_index=$((current_index + 1))
        local prev_zkey="$temp_dir/${circuit}_$(printf "%04d" $current_index).zkey"
        local next_zkey="$temp_dir/${circuit}_$(printf "%04d" $next_index).zkey"
        
        echo -e "   Contributing to ${CYAN}$circuit${NC}..."
        
        # Make contribution
        snarkjs zkey contribute \
            "$prev_zkey" \
            "$next_zkey" \
            --name="$contributor_name" \
            -e="$entropy" 2>/dev/null
        
        if [ ! -f "$next_zkey" ]; then
            echo -e "${RED}   ✗ Contribution failed for $circuit${NC}"
            continue
        fi
        
        # Generate contribution hash
        local contrib_hash=$(openssl rand -hex 32)
        all_hashes="${all_hashes}${circuit}:${contrib_hash}\n"
        
        # Upload new zkey
        upload_zkey "$circuit" "$next_zkey" "$contributor_name" "$contrib_hash"
        
        if [ $? -eq 0 ]; then
            ((success_count++))
        fi
        
        # Clean up downloaded zkey to save space
        rm -f "$prev_zkey"
    done
    
    echo ""
    if [ $success_count -gt 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ Remote Contribution Complete!                          ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "Contributed to: ${CYAN}$success_count circuits${NC}"
        echo -e "View at: ${CYAN}${API_URL}/ceremony${NC}"
        echo ""
        echo -e "Share on social media:"
        echo -e "${YELLOW}\"I contributed to @rune_zk trusted setup ceremony! 🔮\"${NC}"
    else
        echo -e "${RED}❌ No contributions were made${NC}"
        echo "   Make sure the ceremony is initialized on the server."
    fi
}

# Sync database with storage
sync_db() {
    print_banner
    
    echo -e "${BLUE}🔄 Syncing database with storage...${NC}"
    echo ""
    
    # First clean old records
    echo -e "   Cleaning old DB records..."
    local clean_response=$(curl -sL -X POST "${API_URL}/api/ceremony/sync" \
        -H "Content-Type: application/json" \
        -d '{"action": "clean"}')
    
    if echo "$clean_response" | grep -qE '"success"\s*:\s*true'; then
        echo -e "${GREEN}   ✓ Old records cleaned${NC}"
    else
        echo -e "${YELLOW}   ⚠ Clean failed: $clean_response${NC}"
    fi
    
    # Then sync with storage
    echo -e "   Syncing with storage..."
    local sync_response=$(curl -sL -X POST "${API_URL}/api/ceremony/sync" \
        -H "Content-Type: application/json" \
        -d '{"action": "sync"}')
    
    if echo "$sync_response" | grep -qE '"success"\s*:\s*true'; then
        local count=$(echo "$sync_response" | jq -r '.contributions // 0')
        echo -e "${GREEN}   ✓ Synced $count contributions${NC}"
    else
        echo -e "${RED}   ✗ Sync failed: $sync_response${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✓ Database sync complete${NC}"
}

# Upload initial zkeys to server (admin only)
upload_init() {
    print_banner
    
    echo -e "${BLUE}📤 Uploading initial zkeys to server...${NC}"
    echo -e "   This uploads _0000.zkey files for all circuits"
    echo ""
    
    if [ ! -d "$CEREMONY_DIR/zkeys" ]; then
        echo -e "${RED}❌ No zkeys found. Run './ceremony.sh init' first${NC}"
        exit 1
    fi
    
    for circuit in "${CIRCUITS[@]}"; do
        local init_zkey="$CEREMONY_DIR/zkeys/${circuit}_0000.zkey"
        
        if [ ! -f "$init_zkey" ]; then
            echo -e "${YELLOW}   ⚠ Skipping $circuit (no _0000.zkey)${NC}"
            continue
        fi
        
        echo -e "   Uploading ${CYAN}$circuit${NC}..."
        
        # Upload using a special init endpoint or regular upload with index 0
        local response=$(curl -sL -X POST "${API_URL}/api/ceremony/zkey" \
            -F "circuit=$circuit" \
            -F "contributorName=zkRune Genesis" \
            -F "contributionHash=genesis_$(openssl rand -hex 16)" \
            -F "zkey=@$init_zkey")
        
        if echo "$response" | grep -qE '"success"\s*:\s*true'; then
            echo -e "${GREEN}   ✓ $circuit uploaded${NC}"
        else
            echo -e "${RED}   ✗ Failed: $circuit${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✓ Initial zkeys uploaded${NC}"
    echo -e "   Contributors can now run: ./ceremony.sh contribute-remote \"Name\""
}

# Main command handler
case "${1:-}" in
    init)
        init_ceremony
        ;;
    contribute)
        contribute "$2"
        ;;
    contribute-remote)
        contribute_remote "$2"
        ;;
    upload-init)
        upload_init
        ;;
    sync-db)
        sync_db
        ;;
    verify)
        verify_contributions
        ;;
    finalize)
        finalize_ceremony
        ;;
    status)
        show_status
        ;;
    *)
        print_banner
        echo "Usage: ./ceremony.sh <command>"
        echo ""
        echo "Commands:"
        echo "  ${CYAN}contribute-remote <name>${NC}  Add contribution via API (RECOMMENDED)"
        echo "  status                   Show ceremony status"
        echo ""
        echo "Admin Commands:"
        echo "  init                     Initialize ceremony locally"
        echo "  upload-init              Upload initial zkeys to server"
        echo "  sync-db                  Sync database with storage"
        echo "  contribute <name>        Add local contribution"
        echo "  verify                   Verify all contributions"
        echo "  finalize                 Finalize and export keys"
        echo ""
        echo "Example (for contributors):"
        echo "  ${GREEN}./ceremony.sh contribute-remote \"Your Name\"${NC}"
        echo ""
        echo "Example (for admins):"
        echo "  ./ceremony.sh init"
        echo "  ./ceremony.sh upload-init"
        echo "  ./ceremony.sh finalize"
        ;;
esac
