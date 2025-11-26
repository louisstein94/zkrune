import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

export async function initProject() {
  console.log(chalk.cyan('\n🚀 zkRune Project Initializer\n'));

  const { projectName, useGit } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-zkrune-project',
    },
    {
      type: 'confirm',
      name: 'useGit',
      message: 'Initialize git repository?',
      default: true,
    },
  ]);

  const spinner = ora('Creating project...').start();

  const projectDir = path.join(process.cwd(), projectName);

  if (await fs.pathExists(projectDir)) {
    spinner.fail();
    throw new Error(`Directory "${projectName}" already exists`);
  }

  await fs.ensureDir(projectDir);
  await fs.ensureDir(path.join(projectDir, 'circuits'));
  await fs.ensureDir(path.join(projectDir, 'build'));

  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: 'zkRune zero-knowledge proof project',
    scripts: {
      build: 'zkrune compile circuits/*.circom --output build',
      test: 'zkrune test circuits/main.circom',
    },
    dependencies: {
      'zkrune-sdk': '^1.2.0',
    },
    devDependencies: {
      'zkrune-cli': '^1.0.0',
    },
  };

  await fs.writeJson(path.join(projectDir, 'package.json'), packageJson, { spaces: 2 });

  // Create README
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

  await fs.writeFile(path.join(projectDir, 'README.md'), readme);

  // Create .gitignore
  const gitignore = `node_modules/
build/
dist/
*.zkey
*.ptau
.env
.env.local
`;

  await fs.writeFile(path.join(projectDir, '.gitignore'), gitignore);

  spinner.succeed(chalk.green(`Project "${projectName}" created successfully!`));

  console.log(chalk.dim('\nProject structure:'));
  console.log(chalk.dim(`  📁 ${projectName}/`));
  console.log(chalk.dim(`    ├── circuits/`));
  console.log(chalk.dim(`    ├── build/`));
  console.log(chalk.dim(`    ├── package.json`));
  console.log(chalk.dim(`    ├── README.md`));
  console.log(chalk.dim(`    └── .gitignore`));

  console.log(chalk.cyan('\nNext steps:'));
  console.log(chalk.white(`  cd ${projectName}`));
  console.log(chalk.white(`  npm install`));
  console.log(chalk.white(`  zkrune create MyCircuit --template age-verification`));
  console.log('');
}

