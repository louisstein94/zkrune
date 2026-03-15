export * from './proof';
export * from './circuits';

export interface ZkRuneConfig {
  circuitBaseUrl: string;
  verifierUrl: string;
  debug: boolean;
  timeout: number;
  cache: boolean;
}

export const DEFAULT_CONFIG: ZkRuneConfig = {
  circuitBaseUrl: 'https://zkrune.com/circuits',
  verifierUrl: 'https://zkrune.com/api/verify-proof',
  debug: false,
  timeout: 30_000,
  cache: true,
};
