import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Red Panda palette — soft red/orange + warm dark background
        'rpd-primary': '#ff6b3d',
        'rpd-darker':  '#0f0a08',
        'rpd-dark':    '#1a120e',
        'rpd-gray':    '#a89888',
      },
    },
  },
  plugins: [],
};

export default config;
