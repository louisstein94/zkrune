import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_PATH = path.join(__dirname, '..', 'lib', 'supabase', 'schema.sql');
const TYPES_PATH = path.join(__dirname, '..', 'lib', 'supabase', 'types.ts');

describe('Supabase Schema', () => {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

  it('schema file exists and is non-empty', () => {
    expect(schema.length).toBeGreaterThan(0);
  });

  const expectedTables = [
    'proposals',
    'votes',
    'marketplace_templates',
    'purchases',
    'staking_positions',
    'premium_status',
    'burn_history',
    'ceremony_contributions',
    'treasury_distributions',
  ];

  for (const table of expectedTables) {
    it(`defines ${table} table`, () => {
      expect(schema).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    });

    it(`enables RLS on ${table}`, () => {
      expect(schema).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    });
  }

  it('staking_positions has transaction_signature column', () => {
    const tableMatch = schema.match(
      /CREATE TABLE IF NOT EXISTS staking_positions \(([\s\S]*?)\);/,
    );
    expect(tableMatch).not.toBeNull();
    expect(tableMatch![1]).toContain('transaction_signature');
  });

  it('staking_positions transaction_signature has UNIQUE constraint', () => {
    const tableMatch = schema.match(
      /CREATE TABLE IF NOT EXISTS staking_positions \(([\s\S]*?)\);/,
    );
    expect(tableMatch![1]).toMatch(/transaction_signature\s+TEXT\s+UNIQUE/);
  });

  it('has index on staking_positions.transaction_signature', () => {
    expect(schema).toContain('idx_staking_txsig');
  });
});

describe('Supabase Types', () => {
  const types = fs.readFileSync(TYPES_PATH, 'utf-8');

  it('types file exists', () => {
    expect(types.length).toBeGreaterThan(0);
  });

  it('staking_positions Row includes transaction_signature', () => {
    const rowMatch = types.match(
      /staking_positions:\s*\{[\s\S]*?Row:\s*\{([\s\S]*?)\}/,
    );
    expect(rowMatch).not.toBeNull();
    expect(rowMatch![1]).toContain('transaction_signature');
  });

  it('staking_positions Insert includes transaction_signature', () => {
    const insertMatch = types.match(
      /staking_positions:[\s\S]*?Insert:\s*\{([\s\S]*?)\}/,
    );
    expect(insertMatch).not.toBeNull();
    expect(insertMatch![1]).toContain('transaction_signature');
  });
});

describe('Schema-API Sync', () => {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

  const apiDir = path.join(__dirname, '..', 'app', 'api');

  it('staking API transaction_signature field matches schema', () => {
    const stakingRoute = fs.readFileSync(
      path.join(apiDir, 'staking', 'route.ts'),
      'utf-8',
    );
    if (stakingRoute.includes('transaction_signature')) {
      const tableMatch = schema.match(
        /CREATE TABLE IF NOT EXISTS staking_positions \(([\s\S]*?)\);/,
      );
      expect(tableMatch![1]).toContain('transaction_signature');
    }
  });

  it('premium API transaction_signature field matches schema', () => {
    const premiumRoute = fs.readFileSync(
      path.join(apiDir, 'premium', 'route.ts'),
      'utf-8',
    );
    if (premiumRoute.includes('transaction_signature')) {
      expect(schema).toMatch(
        /CREATE TABLE IF NOT EXISTS burn_history[\s\S]*?transaction_signature/,
      );
    }
  });
});
