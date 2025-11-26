import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

export async function testCircuit(circuit: string, inputFile?: string) {
  const spinner = ora();

  console.log(chalk.cyan('\n🧪 zkRune Circuit Tester\n'));

  // Determine circuit name and paths
  const circuitName = path.basename(circuit, '.circom');
  const circuitDir = path.dirname(path.resolve(circuit));

  // Check for input file
  let input = {};
  let inputPath = inputFile ? path.resolve(inputFile) : path.join(circuitDir, 'input.json');

  if (await fs.pathExists(inputPath)) {
    input = await fs.readJson(inputPath);
    console.log(chalk.dim('📝 Input data:'));
    console.log(chalk.dim(JSON.stringify(input, null, 2)));
    console.log('');
  } else {
    throw new Error(
      `Input file not found. Expected: ${inputPath}\n` +
      `Create an input.json file with circuit inputs.`
    );
  }

  // Try to use pre-compiled circuits from zkRune
  spinner.start('Checking for compiled circuit files...');

  const wasmPath = path.join(circuitDir, `${circuitName}.wasm`);
  const zkeyPath = path.join(circuitDir, `${circuitName}.zkey`);
  const vkeyPath = path.join(circuitDir, `${circuitName}_vkey.json`);

  const hasLocalFiles = await Promise.all([
    fs.pathExists(wasmPath),
    fs.pathExists(zkeyPath),
    fs.pathExists(vkeyPath),
  ]).then(results => results.every(r => r));

  if (!hasLocalFiles) {
    spinner.warn('Compiled circuit files not found');
    
    console.log(chalk.dim('\n💡 To test this circuit:'));
    console.log(chalk.dim('   1. Run: zkrune compile ' + circuit));
    console.log(chalk.dim('   2. Or use pre-compiled template from zkRune'));
    console.log(chalk.dim('   3. Files needed:'));
    console.log(chalk.dim(`      - ${circuitName}.wasm`));
    console.log(chalk.dim(`      - ${circuitName}.zkey`));
    console.log(chalk.dim(`      - ${circuitName}_vkey.json`));
    console.log('');
    
    // Show template suggestion
    await suggestTemplate(circuitName);
    return;
  }

  try {
    // Load snarkjs
    spinner.text = 'Loading snarkjs...';
    const snarkjs = await import('snarkjs') as any;
    spinner.succeed('snarkjs loaded!');

    // Generate witness
    spinner.start('Generating witness...');
    const wasmBuffer = await fs.readFile(wasmPath);
    
    const { wtns: witnessBuffer } = await snarkjs.wtns.calculate(
      input,
      wasmBuffer
    );
    
    spinner.succeed('Witness generated!');

    // Generate proof
    spinner.start('Generating proof...');
    const zkeyBuffer = await fs.readFile(zkeyPath);
    
    const startTime = Date.now();
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      zkeyBuffer,
      witnessBuffer
    );
    const proofTime = Date.now() - startTime;
    
    spinner.succeed(`Proof generated in ${proofTime}ms!`);

    // Verify proof
    spinner.start('Verifying proof...');
    const vKey = await fs.readJson(vkeyPath);
    
    const isValid = await snarkjs.groth16.verify(
      vKey,
      publicSignals,
      proof
    );
    
    if (isValid) {
      spinner.succeed(chalk.green('✅ Proof verified successfully!'));
    } else {
      spinner.fail(chalk.red('❌ Proof verification failed!'));
      return;
    }

    console.log(chalk.dim('\n📊 Test Results:'));
    console.log(chalk.green('  ✓ Witness generated'));
    console.log(chalk.green('  ✓ Proof generated (' + proofTime + 'ms)'));
    console.log(chalk.green('  ✓ Proof verified'));
    console.log(chalk.dim('  ✓ Public signals: ' + JSON.stringify(publicSignals)));
    console.log('');

  } catch (error: any) {
    spinner.fail('Test failed');
    console.error(chalk.red('\nError:'), error.message);
    throw error;
  }
}

async function suggestTemplate(circuitName: string) {
  const templates = [
    'age-verification',
    'balance-proof',
    'membership-proof',
    'range-proof',
    'private-voting',
    'hash-preimage',
    'credential-proof',
    'token-swap',
    'signature-verification',
    'patience-proof',
    'quadratic-voting',
    'nft-ownership',
    'anonymous-reputation',
  ];

  const matchingTemplate = templates.find(t => 
    circuitName.toLowerCase().includes(t) || 
    t.includes(circuitName.toLowerCase())
  );

  if (matchingTemplate) {
    console.log(chalk.cyan('💡 This looks like a zkRune template!'));
    console.log(chalk.white(`   Use zkrune-sdk to test it:`));
    console.log(chalk.dim(`
   import { generateProof } from 'zkrune-sdk';
   
   const proof = await generateProof({
     templateId: '${matchingTemplate}',
     inputs: ${JSON.stringify({ /* your inputs */ }, null, 4)}
   });
`));
  }
}

