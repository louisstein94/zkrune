# zkrune-cli

CLI tool for zkRune - Compile and manage zero-knowledge circuits powered by Zcash's Groth16.

## Installation

```bash
npm install -g zkrune-cli
```

## Quick Start

### 1. Initialize a new project

```bash
zkrune init
cd my-zkrune-project
npm install
```

### 2. Create a circuit from template

```bash
zkrune create MyCircuit --template age-verification
```

### 3. Compile the circuit

```bash
zkrune compile MyCircuit.circom
```

### 4. Test the circuit

```bash
zkrune test MyCircuit --input input.json
```

## Commands

### `zkrune init`

Initialize a new zkRune project with proper structure and dependencies.

```bash
zkrune init
```

### `zkrune create <name>`

Create a new circuit from a template.

```bash
zkrune create MyCircuit --template age-verification
```

**Options:**
- `-t, --template <template>` - Template to use

### `zkrune compile <circuit>`

Compile a Circom circuit to WASM and generate proving/verification keys.

```bash
zkrune compile MyCircuit.circom
zkrune compile MyCircuit.circom --output ./build --optimize
```

**Options:**
- `-o, --output <dir>` - Output directory (default: `./build`)
- `--optimize` - Optimize circuit constraints

### `zkrune test <circuit>`

Test a circuit with sample inputs.

```bash
zkrune test MyCircuit
zkrune test MyCircuit --input custom-input.json
```

**Options:**
- `-i, --input <file>` - Input JSON file

### `zkrune templates`

List all available circuit templates.

```bash
zkrune templates
```

## Available Templates

### Identity & Access
- `age-verification` - Prove age without revealing exact date
- `membership-proof` - Prove group membership without identity

### Financial
- `balance-proof` - Prove minimum balance without amount
- `range-proof` - Prove value in range without exact number

### Governance
- `private-voting` - Vote anonymously with proof

## Example Workflow

```bash
# 1. Create a new project
zkrune init my-age-verifier
cd my-age-verifier

# 2. Install dependencies
npm install

# 3. Create an age verification circuit
zkrune create AgeCheck --template age-verification

# 4. Navigate to circuit directory
cd AgeCheck

# 5. Compile the circuit
zkrune compile AgeCheck.circom

# 6. Test with sample input
zkrune test AgeCheck --input input.json

# 7. Use in your app
# Import the compiled circuit in your Next.js/React app
```

## Integration with zkrune-sdk

The CLI generates circuits that work seamlessly with `zkrune-sdk`:

```typescript
import { generateProof } from 'zkrune-sdk';

const proof = await generateProof({
  templateId: 'age-verification',
  circuitPath: './build/AgeCheck',  // Path from CLI compile
  inputs: { birthYear: '1995', currentYear: '2024', minimumAge: '18' }
});
```

## Features

- ✅ **Template System** - 13+ ready-to-use circuit templates
- ✅ **One-Command Compilation** - Automated build pipeline
- ✅ **Testing** - Verify circuits with sample inputs
- ✅ **Project Scaffolding** - Complete project initialization
- ✅ **TypeScript Support** - Fully typed API
- ✅ **Zcash-Powered** - Using battle-tested Groth16 protocol

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test locally
npm link
zkrune --help
```

## Links

- **Website:** [zkrune.com](https://zkrune.com)
- **SDK:** [zkrune-sdk](https://www.npmjs.com/package/zkrune-sdk)
- **GitHub:** [louisstein94/zkrune](https://github.com/louisstein94/zkrune)
- **Twitter:** [@rune_zk](https://x.com/rune_zk)

## License

MIT

---

**Built for ZypherPunk Hackathon 2025**  
Powered by Zcash's Groth16 zk-SNARKs

