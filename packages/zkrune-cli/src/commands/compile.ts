import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function compileCircuit(circuit: string, options: any) {
  const spinner = ora();

  console.log(chalk.cyan('\n⚡ zkRune Circuit Compiler\n'));

  const circuitPath = path.resolve(circuit);

  if (!await fs.pathExists(circuitPath)) {
    throw new Error(`Circuit file "${circuit}" not found`);
  }

  const outputDir = path.resolve(options.output);
  await fs.ensureDir(outputDir);

  const circuitName = path.basename(circuit, '.circom');

  // Check if circom is installed
  spinner.start('Checking circom installation...');
  
  try {
    await execAsync('circom --version');
    spinner.succeed('Circom found!');
  } catch (error) {
    spinner.warn('Circom not found - using pre-compiled circuits from zkRune');
    
    // Try to use pre-compiled circuits from zkRune website
    console.log(chalk.dim('\n💡 Tip: Install circom for custom circuit compilation:'));
    console.log(chalk.dim('   curl --proto \'=https\' --tlsv1.2 https://sh.rustup.rs -sSf | sh'));
    console.log(chalk.dim('   git clone https://github.com/iden3/circom.git'));
    console.log(chalk.dim('   cd circom && cargo build --release\n'));
    
    // For now, use zkRune's pre-compiled templates
    await usePrecompiledTemplate(circuitName, outputDir, spinner);
    return;
  }

  // Compile with circom
  spinner.start('Compiling circuit with circom...');
  
  try {
    const r1csPath = path.join(outputDir, `${circuitName}.r1cs`);
    const wasmPath = path.join(outputDir, `${circuitName}.wasm`);
    const symPath = path.join(outputDir, `${circuitName}.sym`);

    // Find circomlib path (try common locations)
    const possibleCircomlibPaths = [
      path.join(process.cwd(), 'node_modules'),
      path.join(__dirname, '../../../node_modules'),
      '/usr/local/lib/node_modules',
    ];

    // Try to find via require.resolve
    try {
      const circomlibjsPath = require.resolve('circomlibjs');
      possibleCircomlibPaths.push(path.join(circomlibjsPath, '../../..'));
    } catch (e) {
      // circomlibjs not found, skip
    }

    let circomlibPath = '';
    for (const p of possibleCircomlibPaths) {
      const checkPath = path.join(p, 'circomlib', 'circuits');
      if (await fs.pathExists(checkPath)) {
        circomlibPath = p;
        break;
      }
    }

    // Build circom command with include path
    let circomCmd = `circom ${circuitPath} --r1cs --wasm --sym -o ${outputDir}`;
    if (circomlibPath) {
      circomCmd += ` -l ${circomlibPath}`;
      spinner.text = `Compiling with circomlib at ${circomlibPath}...`;
    }

    await execAsync(circomCmd);

    spinner.succeed('Circuit compiled!');

    console.log(chalk.dim('\nGenerated files:'));
    console.log(chalk.dim(`  📁 ${path.basename(outputDir)}/`));
    console.log(chalk.dim(`    ├── ${circuitName}.wasm`));
    console.log(chalk.dim(`    ├── ${circuitName}.r1cs`));
    console.log(chalk.dim(`    └── ${circuitName}.sym`));

    console.log(chalk.cyan('\n✅ Compilation successful!'));
    console.log(chalk.white('  Next steps:'));
    console.log(chalk.white(`    1. Setup Powers of Tau (if needed)`));
    console.log(chalk.white(`    2. Generate proving key`));
    console.log(chalk.white(`    3. Test with: zkrune test ${circuitName}`));
    console.log('');

  } catch (error: any) {
    spinner.fail('Compilation failed');
    throw new Error(`Circom compilation error: ${error.message}`);
  }
}

async function usePrecompiledTemplate(
  circuitName: string,
  outputDir: string,
  spinner: any
) {
  spinner.start('Looking for pre-compiled template...');

  // Map of template names to their circuit files
  const templateMap: { [key: string]: string } = {
    'age-verification': 'age-verification',
    'balance-proof': 'balance-proof',
    'membership-proof': 'membership-proof',
    'range-proof': 'range-proof',
    'private-voting': 'private-voting',
    'hash-preimage': 'hash-preimage',
    'credential-proof': 'credential-proof',
    'token-swap': 'token-swap',
    'signature-verification': 'signature-verification',
    'patience-proof': 'patience-proof',
    'quadratic-voting': 'quadratic-voting',
    'nft-ownership': 'nft-ownership',
    'anonymous-reputation': 'anonymous-reputation',
  };

  const templateId = templateMap[circuitName.toLowerCase()];

  if (!templateId) {
    spinner.fail();
    throw new Error(
      `No pre-compiled template found for "${circuitName}". ` +
      `Available templates: ${Object.keys(templateMap).join(', ')}`
    );
  }

  spinner.succeed(`Using pre-compiled template: ${templateId}`);

  console.log(chalk.dim('\n📦 Pre-compiled circuits available at:'));
  console.log(chalk.dim(`   https://zkrune.com/circuits/${templateId}.wasm`));
  console.log(chalk.dim(`   https://zkrune.com/circuits/${templateId}.zkey`));
  console.log(chalk.dim(`   https://zkrune.com/circuits/${templateId}_vkey.json`));

  console.log(chalk.cyan('\n💡 To use these circuits:'));
  console.log(chalk.white(`   1. Download the files above`));
  console.log(chalk.white(`   2. Or use zkrune-sdk with templateId: "${templateId}"`));
  console.log(chalk.white(`   3. Or install circom for custom circuits`));
  console.log('');
}

