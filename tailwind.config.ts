import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#0f172a', accent:'#22c55e' }, boxShadow: { soft:'0 20px 60px rgba(15,23,42,.14)' } } }, plugins: [] };
export default config;