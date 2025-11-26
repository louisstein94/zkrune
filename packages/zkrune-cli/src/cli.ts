#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createCircuit, compileCircuit, testCircuit, listTemplates, initProject } from './commands';

const program = new Command();

program
  .name('zkrune')
  .description('CLI tool for zkRune - Compile and manage zero-knowledge circuits')
  .version('1.0.0');

// Create command
program
  .command('create <name>')
  .description('Create a new circuit from template')
  .option('-t, --template <template>', 'Template to use (age-verification, balance-proof, etc.)')
  .action(async (name, options) => {
    try {
      await createCircuit(name, options.template);
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Compile command
program
  .command('compile <circuit>')
  .description('Compile a Circom circuit')
  .option('-o, --output <dir>', 'Output directory', './build')
  .option('--optimize', 'Optimize circuit constraints')
  .action(async (circuit, options) => {
    try {
      await compileCircuit(circuit, options);
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Test command
program
  .command('test <circuit>')
  .description('Test a circuit with sample inputs')
  .option('-i, --input <file>', 'Input JSON file')
  .action(async (circuit, options) => {
    try {
      await testCircuit(circuit, options.input);
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// List templates
program
  .command('templates')
  .description('List all available circuit templates')
  .action(() => {
    listTemplates();
  });

// Init project
program
  .command('init')
  .description('Initialize a new zkRune project')
  .action(async () => {
    try {
      await initProject();
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Help command
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ zkrune create MyCircuit --template age-verification');
  console.log('  $ zkrune compile MyCircuit.circom');
  console.log('  $ zkrune test MyCircuit --input inputs.json');
  console.log('  $ zkrune templates');
  console.log('');
  console.log('Learn more:');
  console.log('  Website: https://zkrune.com');
  console.log('  Docs: https://zkrune.com/docs');
  console.log('  GitHub: https://github.com/louisstein94/zkrune');
});

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

