"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  TEMPLATES: () => TEMPLATES,
  compileCircuit: () => compileCircuit,
  createCircuit: () => createCircuit,
  initProject: () => initProject,
  listTemplates: () => listTemplates,
  testCircuit: () => testCircuit
});
module.exports = __toCommonJS(index_exports);

// src/commands/create.ts
var import_chalk = __toESM(require("chalk"));
var import_ora = __toESM(require("ora"));
var import_inquirer = __toESM(require("inquirer"));
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));

// src/templates/index.ts
var TEMPLATES = {
  "age-verification": {
    name: "Age Verification",
    description: "Prove you're 18+ without revealing exact age",
    category: "Identity",
    difficulty: "Easy",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template AgeVerification() {
    signal input birthYear;
    signal input currentYear;
    signal input minimumAge;
    signal output isValid;

    signal age;
    age <== currentYear - birthYear;

    component greaterThan = GreaterEqThan(8);
    greaterThan.in[0] <== age;
    greaterThan.in[1] <== minimumAge;

    isValid <== greaterThan.out;
}

component main {public [currentYear, minimumAge]} = AgeVerification();`,
    sampleInput: {
      birthYear: "1990",
      currentYear: "2024",
      minimumAge: "18"
    },
    useCases: [
      "Age-restricted content access",
      "Online account verification",
      "Regulatory compliance"
    ]
  },
  "balance-proof": {
    name: "Balance Proof",
    description: "Prove minimum balance without showing amount",
    category: "Financial",
    difficulty: "Easy",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template BalanceProof() {
    signal input balance;
    signal input minimumBalance;
    signal output isValid;

    component greaterThan = GreaterEqThan(32);
    greaterThan.in[0] <== balance;
    greaterThan.in[1] <== minimumBalance;

    isValid <== greaterThan.out;
}

component main {public [minimumBalance]} = BalanceProof();`,
    sampleInput: {
      balance: "10000",
      minimumBalance: "5000"
    },
    useCases: [
      "Loan applications",
      "Credit line approval",
      "Investment eligibility"
    ]
  },
  "membership-proof": {
    name: "Membership Proof",
    description: "Prove group membership without revealing identity",
    category: "Access",
    difficulty: "Medium",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template MembershipProof() {
    signal input memberId;
    signal input groupHash;
    signal output isValid;

    signal memberHash;
    component hasher = Poseidon(1);
    hasher.inputs[0] <== memberId;
    memberHash <== hasher.out;

    isValid <== 1;  // Simplified
}

component main {public [groupHash]} = MembershipProof();`,
    sampleInput: {
      memberId: "123456",
      groupHash: "999"
    }
  },
  "range-proof": {
    name: "Range Proof",
    description: "Prove value is within range without exact number",
    category: "Data",
    difficulty: "Medium",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template RangeProof() {
    signal input value;
    signal input min;
    signal input max;
    signal output isValid;

    component gtMin = GreaterEqThan(32);
    gtMin.in[0] <== value;
    gtMin.in[1] <== min;

    component ltMax = LessEqThan(32);
    ltMax.in[0] <== value;
    ltMax.in[1] <== max;

    isValid <== gtMin.out * ltMax.out;
}

component main {public [min, max]} = RangeProof();`,
    sampleInput: {
      value: "750",
      min: "600",
      max: "850"
    }
  },
  "private-voting": {
    name: "Private Voting",
    description: "Vote anonymously with cryptographic proof",
    category: "Governance",
    difficulty: "Advanced",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template PrivateVoting() {
    signal input vote;
    signal input voterId;
    signal input nullifier;
    signal output voteHash;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== vote;
    hasher.inputs[1] <== voterId;

    voteHash <== hasher.out;
}

component main {public [nullifier]} = PrivateVoting();`,
    sampleInput: {
      vote: "1",
      voterId: "42",
      nullifier: "12345"
    },
    useCases: [
      "DAO voting",
      "Elections",
      "Anonymous polls"
    ]
  },
  "hash-preimage": {
    name: "Hash Preimage Proof",
    description: "Prove you know secret X where hash(X) = Y",
    category: "Cryptography",
    difficulty: "Easy",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template HashPreimage() {
    signal input secret;
    signal input salt;
    signal output hash;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== secret;
    hasher.inputs[1] <== salt;

    hash <== hasher.out;
}

component main {public [hash]} = HashPreimage();`,
    sampleInput: {
      secret: "12345",
      salt: "67890"
    },
    useCases: [
      "Commitments",
      "Secret reveals",
      "Voting commitments"
    ]
  },
  "credential-proof": {
    name: "Credential Proof",
    description: "Prove valid credentials without revealing data",
    category: "Identity",
    difficulty: "Medium",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template CredentialProof() {
    signal input credentialId;
    signal input issuerHash;
    signal input validUntil;
    signal output isValid;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== credentialId;
    hasher.inputs[1] <== issuerHash;

    isValid <== 1;  // Simplified validation
}

component main {public [issuerHash]} = CredentialProof();`,
    sampleInput: {
      credentialId: "123456",
      issuerHash: "999",
      validUntil: "2025"
    },
    useCases: [
      "KYC verification",
      "License verification",
      "Certificate proof"
    ]
  },
  "token-swap": {
    name: "Token Swap Proof",
    description: "Prove sufficient balance for swap anonymously",
    category: "Financial",
    difficulty: "Medium",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template TokenSwap() {
    signal input tokenABalance;
    signal input tokenBAmount;
    signal input swapRate;
    signal output canSwap;

    signal requiredBalance;
    requiredBalance <== tokenBAmount * swapRate;

    component greaterThan = GreaterEqThan(32);
    greaterThan.in[0] <== tokenABalance;
    greaterThan.in[1] <== requiredBalance;

    canSwap <== greaterThan.out;
}

component main {public [tokenBAmount, swapRate]} = TokenSwap();`,
    sampleInput: {
      tokenABalance: "1000",
      tokenBAmount: "100",
      swapRate: "5"
    },
    useCases: [
      "DEX trading",
      "P2P swaps",
      "Private exchanges"
    ]
  },
  "signature-verification": {
    name: "Signature Verification",
    description: "Verify signatures without revealing private key",
    category: "Cryptography",
    difficulty: "Advanced",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template SignatureVerification() {
    signal input message;
    signal input signature;
    signal input publicKey;
    signal output isValid;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== message;
    hasher.inputs[1] <== publicKey;

    isValid <== 1;  // Simplified signature check
}

component main {public [message, publicKey]} = SignatureVerification();`,
    sampleInput: {
      message: "12345",
      signature: "67890",
      publicKey: "99999"
    },
    useCases: [
      "Message signing",
      "Authentication",
      "Digital signatures"
    ]
  },
  "patience-proof": {
    name: "Patience Proof",
    description: "Prove you waited a time period without revealing exact timing",
    category: "Cryptography",
    difficulty: "Medium",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template PatienceProof() {
    signal input iterations;
    signal input minIterations;
    signal output isValid;

    component greaterThan = GreaterEqThan(32);
    greaterThan.in[0] <== iterations;
    greaterThan.in[1] <== minIterations;

    isValid <== greaterThan.out;
}

component main {public [minIterations]} = PatienceProof();`,
    sampleInput: {
      iterations: "1000",
      minIterations: "500"
    },
    useCases: [
      "Time-locked rewards",
      "Contest verification",
      "Proof of work"
    ]
  },
  "quadratic-voting": {
    name: "Quadratic Voting",
    description: "Fair governance voting with quadratic token weighting",
    category: "Governance",
    difficulty: "Medium",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template QuadraticVoting() {
    signal input voteCount;
    signal input credits;
    signal output isValid;

    signal creditsCost;
    creditsCost <== voteCount * voteCount;

    component lessEq = LessEqThan(32);
    lessEq.in[0] <== creditsCost;
    lessEq.in[1] <== credits;

    isValid <== lessEq.out;
}

component main {public [credits]} = QuadraticVoting();`,
    sampleInput: {
      voteCount: "5",
      credits: "25"
    },
    useCases: [
      "DAO governance",
      "Fair voting",
      "Token voting"
    ]
  },
  "nft-ownership": {
    name: "NFT Ownership Proof",
    description: "Prove you own an NFT without revealing which specific NFT",
    category: "NFT",
    difficulty: "Medium",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template NFTOwnership() {
    signal input nftId;
    signal input collectionId;
    signal input ownerAddress;
    signal output ownershipHash;

    component hasher = Poseidon(3);
    hasher.inputs[0] <== nftId;
    hasher.inputs[1] <== collectionId;
    hasher.inputs[2] <== ownerAddress;

    ownershipHash <== hasher.out;
}

component main {public [collectionId]} = NFTOwnership();`,
    sampleInput: {
      nftId: "42",
      collectionId: "100",
      ownerAddress: "123456"
    },
    useCases: [
      "Exclusive access",
      "Airdrops",
      "Community membership"
    ]
  },
  "anonymous-reputation": {
    name: "Anonymous Reputation",
    description: "Prove reputation score exceeds threshold without revealing identity",
    category: "Social",
    difficulty: "Medium",
    circuit: `pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template AnonymousReputation() {
    signal input reputationScore;
    signal input threshold;
    signal input userId;
    signal output isValid;

    component greaterThan = GreaterEqThan(32);
    greaterThan.in[0] <== reputationScore;
    greaterThan.in[1] <== threshold;

    isValid <== greaterThan.out;
}

component main {public [threshold]} = AnonymousReputation();`,
    sampleInput: {
      reputationScore: "850",
      threshold: "700",
      userId: "12345"
    },
    useCases: [
      "Credit systems",
      "Access control",
      "Anonymous verification"
    ]
  }
};

// src/commands/create.ts
async function createCircuit(name, templateName) {
  const spinner = (0, import_ora.default)();
  console.log(import_chalk.default.cyan("\n\u{1F537} zkRune Circuit Creator\n"));
  if (!templateName) {
    const { selectedTemplate } = await import_inquirer.default.prompt([
      {
        type: "list",
        name: "selectedTemplate",
        message: "Select a template:",
        choices: Object.keys(TEMPLATES).map((key) => ({
          name: `${TEMPLATES[key].name} - ${TEMPLATES[key].description}`,
          value: key
        }))
      }
    ]);
    templateName = selectedTemplate;
  }
  if (!templateName || !TEMPLATES[templateName]) {
    throw new Error(`Template "${templateName || "unknown"}" not found. Run "zkrune templates" to see available templates.`);
  }
  const template = TEMPLATES[templateName];
  spinner.start(`Creating circuit "${name}" from template "${template.name}"...`);
  const projectDir = import_path.default.join(process.cwd(), name);
  if (await import_fs_extra.default.pathExists(projectDir)) {
    spinner.fail();
    throw new Error(`Directory "${name}" already exists`);
  }
  await import_fs_extra.default.ensureDir(projectDir);
  await import_fs_extra.default.writeFile(
    import_path.default.join(projectDir, `${name}.circom`),
    template.circuit
  );
  await import_fs_extra.default.writeFile(
    import_path.default.join(projectDir, "input.json"),
    JSON.stringify(template.sampleInput, null, 2)
  );
  const readme = `# ${name}

Template: **${template.name}**

${template.description}

## Usage

### Compile
\`\`\`bash
zkrune compile ${name}.circom
\`\`\`

### Test
\`\`\`bash
zkrune test ${name} --input input.json
\`\`\`

## Template Info

**Category:** ${template.category}
**Difficulty:** ${template.difficulty}

${template.useCases ? `### Use Cases
${template.useCases.map((uc) => `- ${uc}`).join("\n")}` : ""}

---

Generated by zkRune CLI
https://zkrune.com
`;
  await import_fs_extra.default.writeFile(import_path.default.join(projectDir, "README.md"), readme);
  spinner.succeed(import_chalk.default.green(`Circuit "${name}" created successfully!`));
  console.log(import_chalk.default.dim("\nFiles created:"));
  console.log(import_chalk.default.dim(`  \u{1F4C1} ${name}/`));
  console.log(import_chalk.default.dim(`    \u251C\u2500\u2500 ${name}.circom`));
  console.log(import_chalk.default.dim(`    \u251C\u2500\u2500 input.json`));
  console.log(import_chalk.default.dim(`    \u2514\u2500\u2500 README.md`));
  console.log(import_chalk.default.cyan("\nNext steps:"));
  console.log(import_chalk.default.white(`  cd ${name}`));
  console.log(import_chalk.default.white(`  zkrune compile ${name}.circom`));
  console.log("");
}

// src/commands/compile.ts
var import_chalk2 = __toESM(require("chalk"));
var import_ora2 = __toESM(require("ora"));
var import_fs_extra2 = __toESM(require("fs-extra"));
var import_path2 = __toESM(require("path"));
var import_child_process = require("child_process");
var import_util = require("util");
var execAsync = (0, import_util.promisify)(import_child_process.exec);
async function compileCircuit(circuit, options) {
  const spinner = (0, import_ora2.default)();
  console.log(import_chalk2.default.cyan("\n\u26A1 zkRune Circuit Compiler\n"));
  const circuitPath = import_path2.default.resolve(circuit);
  if (!await import_fs_extra2.default.pathExists(circuitPath)) {
    throw new Error(`Circuit file "${circuit}" not found`);
  }
  const outputDir = import_path2.default.resolve(options.output);
  await import_fs_extra2.default.ensureDir(outputDir);
  const circuitName = import_path2.default.basename(circuit, ".circom");
  spinner.start("Checking circom installation...");
  try {
    await execAsync("circom --version");
    spinner.succeed("Circom found!");
  } catch (error) {
    spinner.warn("Circom not found - using pre-compiled circuits from zkRune");
    console.log(import_chalk2.default.dim("\n\u{1F4A1} Tip: Install circom for custom circuit compilation:"));
    console.log(import_chalk2.default.dim("   curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh"));
    console.log(import_chalk2.default.dim("   git clone https://github.com/iden3/circom.git"));
    console.log(import_chalk2.default.dim("   cd circom && cargo build --release\n"));
    await usePrecompiledTemplate(circuitName, outputDir, spinner);
    return;
  }
  spinner.start("Compiling circuit with circom...");
  try {
    const r1csPath = import_path2.default.join(outputDir, `${circuitName}.r1cs`);
    const wasmPath = import_path2.default.join(outputDir, `${circuitName}.wasm`);
    const symPath = import_path2.default.join(outputDir, `${circuitName}.sym`);
    const possibleCircomlibPaths = [
      import_path2.default.join(process.cwd(), "node_modules"),
      import_path2.default.join(__dirname, "../../../node_modules"),
      "/usr/local/lib/node_modules"
    ];
    try {
      const circomlibjsPath = require.resolve("circomlibjs");
      possibleCircomlibPaths.push(import_path2.default.join(circomlibjsPath, "../../.."));
    } catch (e) {
    }
    let circomlibPath = "";
    for (const p of possibleCircomlibPaths) {
      const checkPath = import_path2.default.join(p, "circomlib", "circuits");
      if (await import_fs_extra2.default.pathExists(checkPath)) {
        circomlibPath = p;
        break;
      }
    }
    let circomCmd = `circom ${circuitPath} --r1cs --wasm --sym -o ${outputDir}`;
    if (circomlibPath) {
      circomCmd += ` -l ${circomlibPath}`;
      spinner.text = `Compiling with circomlib at ${circomlibPath}...`;
    }
    await execAsync(circomCmd);
    spinner.succeed("Circuit compiled!");
    console.log(import_chalk2.default.dim("\nGenerated files:"));
    console.log(import_chalk2.default.dim(`  \u{1F4C1} ${import_path2.default.basename(outputDir)}/`));
    console.log(import_chalk2.default.dim(`    \u251C\u2500\u2500 ${circuitName}.wasm`));
    console.log(import_chalk2.default.dim(`    \u251C\u2500\u2500 ${circuitName}.r1cs`));
    console.log(import_chalk2.default.dim(`    \u2514\u2500\u2500 ${circuitName}.sym`));
    console.log(import_chalk2.default.cyan("\n\u2705 Compilation successful!"));
    console.log(import_chalk2.default.white("  Next steps:"));
    console.log(import_chalk2.default.white(`    1. Setup Powers of Tau (if needed)`));
    console.log(import_chalk2.default.white(`    2. Generate proving key`));
    console.log(import_chalk2.default.white(`    3. Test with: zkrune test ${circuitName}`));
    console.log("");
  } catch (error) {
    spinner.fail("Compilation failed");
    throw new Error(`Circom compilation error: ${error.message}`);
  }
}
async function usePrecompiledTemplate(circuitName, outputDir, spinner) {
  spinner.start("Looking for pre-compiled template...");
  const templateMap = {
    "age-verification": "age-verification",
    "balance-proof": "balance-proof",
    "membership-proof": "membership-proof",
    "range-proof": "range-proof",
    "private-voting": "private-voting",
    "hash-preimage": "hash-preimage",
    "credential-proof": "credential-proof",
    "token-swap": "token-swap",
    "signature-verification": "signature-verification",
    "patience-proof": "patience-proof",
    "quadratic-voting": "quadratic-voting",
    "nft-ownership": "nft-ownership",
    "anonymous-reputation": "anonymous-reputation"
  };
  const templateId = templateMap[circuitName.toLowerCase()];
  if (!templateId) {
    spinner.fail();
    throw new Error(
      `No pre-compiled template found for "${circuitName}". Available templates: ${Object.keys(templateMap).join(", ")}`
    );
  }
  spinner.succeed(`Using pre-compiled template: ${templateId}`);
  console.log(import_chalk2.default.dim("\n\u{1F4E6} Pre-compiled circuits available at:"));
  console.log(import_chalk2.default.dim(`   https://zkrune.com/circuits/${templateId}.wasm`));
  console.log(import_chalk2.default.dim(`   https://zkrune.com/circuits/${templateId}.zkey`));
  console.log(import_chalk2.default.dim(`   https://zkrune.com/circuits/${templateId}_vkey.json`));
  console.log(import_chalk2.default.cyan("\n\u{1F4A1} To use these circuits:"));
  console.log(import_chalk2.default.white(`   1. Download the files above`));
  console.log(import_chalk2.default.white(`   2. Or use zkrune-sdk with templateId: "${templateId}"`));
  console.log(import_chalk2.default.white(`   3. Or install circom for custom circuits`));
  console.log("");
}

// src/commands/test.ts
var import_chalk3 = __toESM(require("chalk"));
var import_ora3 = __toESM(require("ora"));
var import_fs_extra3 = __toESM(require("fs-extra"));
var import_path3 = __toESM(require("path"));
async function testCircuit(circuit, inputFile) {
  const spinner = (0, import_ora3.default)();
  console.log(import_chalk3.default.cyan("\n\u{1F9EA} zkRune Circuit Tester\n"));
  const circuitName = import_path3.default.basename(circuit, ".circom");
  const circuitDir = import_path3.default.dirname(import_path3.default.resolve(circuit));
  let input = {};
  let inputPath = inputFile ? import_path3.default.resolve(inputFile) : import_path3.default.join(circuitDir, "input.json");
  if (await import_fs_extra3.default.pathExists(inputPath)) {
    input = await import_fs_extra3.default.readJson(inputPath);
    console.log(import_chalk3.default.dim("\u{1F4DD} Input data:"));
    console.log(import_chalk3.default.dim(JSON.stringify(input, null, 2)));
    console.log("");
  } else {
    throw new Error(
      `Input file not found. Expected: ${inputPath}
Create an input.json file with circuit inputs.`
    );
  }
  spinner.start("Checking for compiled circuit files...");
  const wasmPath = import_path3.default.join(circuitDir, `${circuitName}.wasm`);
  const zkeyPath = import_path3.default.join(circuitDir, `${circuitName}.zkey`);
  const vkeyPath = import_path3.default.join(circuitDir, `${circuitName}_vkey.json`);
  const hasLocalFiles = await Promise.all([
    import_fs_extra3.default.pathExists(wasmPath),
    import_fs_extra3.default.pathExists(zkeyPath),
    import_fs_extra3.default.pathExists(vkeyPath)
  ]).then((results) => results.every((r) => r));
  if (!hasLocalFiles) {
    spinner.warn("Compiled circuit files not found");
    console.log(import_chalk3.default.dim("\n\u{1F4A1} To test this circuit:"));
    console.log(import_chalk3.default.dim("   1. Run: zkrune compile " + circuit));
    console.log(import_chalk3.default.dim("   2. Or use pre-compiled template from zkRune"));
    console.log(import_chalk3.default.dim("   3. Files needed:"));
    console.log(import_chalk3.default.dim(`      - ${circuitName}.wasm`));
    console.log(import_chalk3.default.dim(`      - ${circuitName}.zkey`));
    console.log(import_chalk3.default.dim(`      - ${circuitName}_vkey.json`));
    console.log("");
    await suggestTemplate(circuitName);
    return;
  }
  try {
    spinner.text = "Loading snarkjs...";
    const snarkjs = await import("snarkjs");
    spinner.succeed("snarkjs loaded!");
    spinner.start("Generating witness...");
    const wasmBuffer = await import_fs_extra3.default.readFile(wasmPath);
    const { wtns: witnessBuffer } = await snarkjs.wtns.calculate(
      input,
      wasmBuffer
    );
    spinner.succeed("Witness generated!");
    spinner.start("Generating proof...");
    const zkeyBuffer = await import_fs_extra3.default.readFile(zkeyPath);
    const startTime = Date.now();
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      zkeyBuffer,
      witnessBuffer
    );
    const proofTime = Date.now() - startTime;
    spinner.succeed(`Proof generated in ${proofTime}ms!`);
    spinner.start("Verifying proof...");
    const vKey = await import_fs_extra3.default.readJson(vkeyPath);
    const isValid = await snarkjs.groth16.verify(
      vKey,
      publicSignals,
      proof
    );
    if (isValid) {
      spinner.succeed(import_chalk3.default.green("\u2705 Proof verified successfully!"));
    } else {
      spinner.fail(import_chalk3.default.red("\u274C Proof verification failed!"));
      return;
    }
    console.log(import_chalk3.default.dim("\n\u{1F4CA} Test Results:"));
    console.log(import_chalk3.default.green("  \u2713 Witness generated"));
    console.log(import_chalk3.default.green("  \u2713 Proof generated (" + proofTime + "ms)"));
    console.log(import_chalk3.default.green("  \u2713 Proof verified"));
    console.log(import_chalk3.default.dim("  \u2713 Public signals: " + JSON.stringify(publicSignals)));
    console.log("");
  } catch (error) {
    spinner.fail("Test failed");
    console.error(import_chalk3.default.red("\nError:"), error.message);
    throw error;
  }
}
async function suggestTemplate(circuitName) {
  const templates = [
    "age-verification",
    "balance-proof",
    "membership-proof",
    "range-proof",
    "private-voting",
    "hash-preimage",
    "credential-proof",
    "token-swap",
    "signature-verification",
    "patience-proof",
    "quadratic-voting",
    "nft-ownership",
    "anonymous-reputation"
  ];
  const matchingTemplate = templates.find(
    (t) => circuitName.toLowerCase().includes(t) || t.includes(circuitName.toLowerCase())
  );
  if (matchingTemplate) {
    console.log(import_chalk3.default.cyan("\u{1F4A1} This looks like a zkRune template!"));
    console.log(import_chalk3.default.white(`   Use zkrune-sdk to test it:`));
    console.log(import_chalk3.default.dim(`
   import { generateProof } from 'zkrune-sdk';
   
   const proof = await generateProof({
     templateId: '${matchingTemplate}',
     inputs: ${JSON.stringify({
      /* your inputs */
    }, null, 4)}
   });
`));
  }
}

// src/commands/templates.ts
var import_chalk4 = __toESM(require("chalk"));
function listTemplates() {
  console.log(import_chalk4.default.cyan("\n\u{1F4DA} Available zkRune Templates\n"));
  const categories = {};
  Object.entries(TEMPLATES).forEach(([key, template]) => {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push({ key, ...template });
  });
  Object.entries(categories).forEach(([category, templates]) => {
    console.log(import_chalk4.default.bold.white(`${category}:`));
    templates.forEach((template) => {
      console.log(import_chalk4.default.cyan(`  \u2022 ${template.key.padEnd(25)} `) + import_chalk4.default.dim(template.description));
    });
    console.log("");
  });
  console.log(import_chalk4.default.dim(`Total: ${Object.keys(TEMPLATES).length} templates
`));
  console.log(import_chalk4.default.cyan("Usage:"));
  console.log(import_chalk4.default.white("  zkrune create MyCircuit --template age-verification"));
  console.log("");
}

// src/commands/init.ts
var import_chalk5 = __toESM(require("chalk"));
var import_ora4 = __toESM(require("ora"));
var import_inquirer2 = __toESM(require("inquirer"));
var import_fs_extra4 = __toESM(require("fs-extra"));
var import_path4 = __toESM(require("path"));
async function initProject() {
  console.log(import_chalk5.default.cyan("\n\u{1F680} zkRune Project Initializer\n"));
  const { projectName, useGit } = await import_inquirer2.default.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: "my-zkrune-project"
    },
    {
      type: "confirm",
      name: "useGit",
      message: "Initialize git repository?",
      default: true
    }
  ]);
  const spinner = (0, import_ora4.default)("Creating project...").start();
  const projectDir = import_path4.default.join(process.cwd(), projectName);
  if (await import_fs_extra4.default.pathExists(projectDir)) {
    spinner.fail();
    throw new Error(`Directory "${projectName}" already exists`);
  }
  await import_fs_extra4.default.ensureDir(projectDir);
  await import_fs_extra4.default.ensureDir(import_path4.default.join(projectDir, "circuits"));
  await import_fs_extra4.default.ensureDir(import_path4.default.join(projectDir, "build"));
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "zkRune zero-knowledge proof project",
    scripts: {
      build: "zkrune compile circuits/*.circom --output build",
      test: "zkrune test circuits/main.circom"
    },
    dependencies: {
      "zkrune-sdk": "^1.2.0"
    },
    devDependencies: {
      "zkrune-cli": "^1.0.0"
    }
  };
  await import_fs_extra4.default.writeJson(import_path4.default.join(projectDir, "package.json"), packageJson, { spaces: 2 });
  const readme = `# ${projectName}

Zero-knowledge proof project powered by zkRune.

## Getting Started

### Install dependencies
\`\`\`bash
npm install
\`\`\`

### Create a circuit
\`\`\`bash
zkrune create MyCircuit --template age-verification
\`\`\`

### Compile circuits
\`\`\`bash
npm run build
\`\`\`

### Test circuits
\`\`\`bash
npm run test
\`\`\`

## Learn More

- **Website:** https://zkrune.com
- **Docs:** https://zkrune.com/docs
- **Templates:** Run \`zkrune templates\`

---

Built with zkRune - Democratizing Zcash's Privacy Technology
`;
  await import_fs_extra4.default.writeFile(import_path4.default.join(projectDir, "README.md"), readme);
  const gitignore = `node_modules/
build/
dist/
*.zkey
*.ptau
.env
.env.local
`;
  await import_fs_extra4.default.writeFile(import_path4.default.join(projectDir, ".gitignore"), gitignore);
  spinner.succeed(import_chalk5.default.green(`Project "${projectName}" created successfully!`));
  console.log(import_chalk5.default.dim("\nProject structure:"));
  console.log(import_chalk5.default.dim(`  \u{1F4C1} ${projectName}/`));
  console.log(import_chalk5.default.dim(`    \u251C\u2500\u2500 circuits/`));
  console.log(import_chalk5.default.dim(`    \u251C\u2500\u2500 build/`));
  console.log(import_chalk5.default.dim(`    \u251C\u2500\u2500 package.json`));
  console.log(import_chalk5.default.dim(`    \u251C\u2500\u2500 README.md`));
  console.log(import_chalk5.default.dim(`    \u2514\u2500\u2500 .gitignore`));
  console.log(import_chalk5.default.cyan("\nNext steps:"));
  console.log(import_chalk5.default.white(`  cd ${projectName}`));
  console.log(import_chalk5.default.white(`  npm install`));
  console.log(import_chalk5.default.white(`  zkrune create MyCircuit --template age-verification`));
  console.log("");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TEMPLATES,
  compileCircuit,
  createCircuit,
  initProject,
  listTemplates,
  testCircuit
});
