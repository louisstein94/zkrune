import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // zkRune Cyber Rune palette
        'zk-primary': '#00FFA3',      // Neon green
        'zk-secondary': '#6B4CFF',     // Mystic purple
        'zk-dark': '#0A0E27',          // Deep void
        'zk-darker': '#060814',        // Darker void
        'zk-gray': '#999999',          // Medium gray
        'zk-accent': '#FF3366',        // Electric pink
        // Zcash branding
        'zcash-gold': '#F4B728',       // Zcash official gold
        'zcash-dark': '#231F20',       // Zcash dark
      },
      fontFamily: {
        'hatton': ['var(--font-hatton)', 'serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

