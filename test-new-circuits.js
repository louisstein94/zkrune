const snarkjs = require('snarkjs');
const fs = require('fs');

async function testCircuit(circuitName, input) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🧪 Testing: ${circuitName}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  try {
    const wasmPath = `./circuits/${circuitName}/circuit_js/circuit.wasm`;
    const zkeyPath = `./circuits/${circuitName}/circuit_final.zkey`;
    const vkeyPath = `./circuits/${circuitName}/verification_key.json`;

    // Check files exist
    if (!fs.existsSync(wasmPath)) throw new Error('WASM file not found');
    if (!fs.existsSync(zkeyPath)) throw new Error('zkey file not found');
    if (!fs.existsSync(vkeyPath)) throw new Error('vkey file not found');

    console.log('✓ All circuit files found');

    // Generate witness
    console.log('  ⚙️  Generating witness...');
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );
    console.log('✓ Witness generated');
    console.log('✓ Proof generated');
    console.log(`  Public signals: ${publicSignals.length} values`);

    // Verify proof
    console.log('  🔍 Verifying proof...');
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    if (verified) {
      console.log('✅ PROOF VERIFIED SUCCESSFULLY!');
      return true;
    } else {
      console.log('❌ PROOF VERIFICATION FAILED!');
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 Testing 3 New ZK Circuits');
  console.log('═══════════════════════════════════════════\n');

  let passedTests = 0;
  let totalTests = 3;

  // Test 1: Quadratic Voting
  const quadraticInput = {
    voterId: '123456789',
    tokenBalance: '10000',
    voteChoice: '2',
    pollId: '42',
    minTokens: '100'
  };
  if (await testCircuit('quadratic-voting', quadraticInput)) passedTests++;

  // Test 2: NFT Ownership
  const nftInput = {
    nftTokenId: '5678',
    ownerSecret: '987654321',
    collectionRoot: '12345678901234567890123456789012345678901234567890123456789012345',
    minTokenId: '1',
    maxTokenId: '10000'
  };
  if (await testCircuit('nft-ownership', nftInput)) passedTests++;

  // Test 3: Anonymous Reputation
  const reputationInput = {
    userId: '111222333',
    reputationScore: '850',
    userNonce: '999888777',
    thresholdScore: '700',
    platformId: '1'
  };
  if (await testCircuit('anonymous-reputation', reputationInput)) passedTests++;

  // Final Summary
  console.log('\n═══════════════════════════════════════════');
  console.log(`📊 FINAL RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log('═══════════════════════════════════════════\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Ready for deployment!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

runTests();
