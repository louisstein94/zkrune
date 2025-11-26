import chalk from 'chalk';
import { TEMPLATES } from '../templates';

export function listTemplates() {
  console.log(chalk.cyan('\n📚 Available zkRune Templates\n'));

  const categories: { [key: string]: any[] } = {};

  Object.entries(TEMPLATES).forEach(([key, template]) => {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push({ key, ...template });
  });

  Object.entries(categories).forEach(([category, templates]) => {
    console.log(chalk.bold.white(`${category}:`));
    templates.forEach(template => {
      console.log(chalk.cyan(`  • ${template.key.padEnd(25)} `) + chalk.dim(template.description));
    });
    console.log('');
  });

  console.log(chalk.dim(`Total: ${Object.keys(TEMPLATES).length} templates\n`));

  console.log(chalk.cyan('Usage:'));
  console.log(chalk.white('  zkrune create MyCircuit --template age-verification'));
  console.log('');
}

