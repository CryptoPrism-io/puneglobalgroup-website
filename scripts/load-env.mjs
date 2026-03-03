// Loads .env.local into process.env (no external dependencies)
import { readFileSync } from 'fs';
try {
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .forEach(line => {
      const eq = line.indexOf('=');
      if (eq < 1 || line.trimStart().startsWith('#')) return;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key) process.env[key] = val;
    });
} catch { /* .env.local not found — rely on shell env */ }
