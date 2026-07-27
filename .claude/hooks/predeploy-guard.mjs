#!/usr/bin/env node
// PreToolUse(Bash) guard: если команда содержит `vercel deploy`, прогнать предпроверку
// и показать результат. Не блокирует — только информирует (владелец решает сам).
import { execSync } from 'node:child_process';
let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let cmd = '';
  try { cmd = (JSON.parse(input).tool_input || {}).command || ''; } catch {}
  if (!/vercel\s+deploy/.test(cmd)) { process.exit(0); }
  let out = '';
  try {
    out = execSync('node scripts/predeploy-check.mjs', { cwd: process.cwd(), encoding: 'utf8' });
  } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  // PostToolUse-style: вернуть контекст ассистенту, не блокируя деплой
  const ctx = `Предеплой-проверка Amberra перед vercel deploy:\n${out}`;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: ctx },
  }));
  process.exit(0);
});
