import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#111827', accent:'#22c55e' }, boxShadow: { soft:'0 20px 60px rgba(17,24,39,.14)' } } }, plugins: [] };
export default config;