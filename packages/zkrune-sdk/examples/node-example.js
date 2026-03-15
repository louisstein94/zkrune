const { ZkRune, templates } = require('zkrune-sdk');

async function main() {
  const zk = new ZkRune({ debug: true });

  console.log('zkRune SDK v2 — Node.js Example\n');

  console.log('Generating age verification proof...');
  const result = await zk.prove('age-verification', {
    birthYear: '1975',
    currentYear: '2026',
    minimumAge: '18',
  });

  if (result.success) {
    console.log('\nProof generated!');
    console.log(`Time: ${result.timing}ms`);
    console.log(`Valid: ${result.proof.isValid}`);
    console.log(`Hash: ${result.proof.proofHash}`);
  } else {
    console.error('\nError:', result.error);
  }
}

main().catch(console.error);
