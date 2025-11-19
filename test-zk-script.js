
const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function run() {
  try {
    console.log("🧪 ZK Proof Test Starting...");

    // Input data (Born in 2000, currently 2024. Is older than 18?)
    const inputs = {
      birthYear: 2000,
      currentYear: 2024,
      minimumAge: 18
    };

    // File paths (running from inside zkrune directory)
    const wasmPath = path.join(__dirname, "public/circuits/age-verification.wasm");
    const zkeyPath = path.join(__dirname, "public/circuits/age-verification.zkey");
    const vkeyPath = path.join(__dirname, "public/circuits/age-verification_vkey.json");

    console.log("1. Generating Proof...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasmPath,
      zkeyPath
    );
    console.log("✅ Proof Generated Successfully!");
    
    console.log("Public Signals (Output):", publicSignals);
    // publicSignals[0] = isValid (1 = true, 0 = false)

    console.log("2. Verifying Proof...");
    const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
      console.log("🎉 VERIFICATION SUCCESSFUL! Proof is valid.");
    } else {
      console.error("❌ VERIFICATION FAILED! Proof is invalid.");
    }

  } catch (e) {
    console.error("ERROR:", e);
  }
}

run().then(() => process.exit(0));
