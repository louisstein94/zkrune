// Node.js example for zkRune SDK
const { generateProof, templates } = require('@zkrune/sdk');

async function main() {
  console.log('zkRune SDK - Node.js Example\n');

  // Generate an age verification proof
  console.log('Generating age verification proof...');
  
  const result = await generateProof({
    templateId: templates.AGE_VERIFICATION,
    inputs: {
      birthYear: '1975',
      currentYear: '2024',
      minimumAge: '18'
    }
  });

  if (result.success) {
    console.log('\n Proof Generated Successfully!');
    console.log(`Time taken: ${result.timing}ms`);
    console.log(`Valid: ${result.proof.isValid}`);
    console.log(`Proof Hash: ${result.proof.proofHash}`);
    console.log(`\nNote: ${result.proof.note}`);
  } else {
    console.error('\n Error:', result.error);
  }
}

main().catch(console.error);

