#!/usr/bin/env node
/**
 * scripts/setup.js
 * One-command local setup for NoteGenius AI
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const log  = (msg) => console.log(`\x1b[36m[setup]\x1b[0m ${msg}`)
const ok   = (msg) => console.log(`\x1b[32m  ✓\x1b[0m ${msg}`)
const warn = (msg) => console.log(`\x1b[33m  ⚠\x1b[0m ${msg}`)

const run = (cmd, cwd = process.cwd()) => {
  execSync(cmd, { cwd, stdio: 'inherit' })
}

log('🚀 Setting up NoteGenius AI...\n')

// 1. Install all deps
log('Installing dependencies...')
run('npm install')
run('npm install', path.join(__dirname, 'frontend'))
run('npm install', path.join(__dirname, 'backend'))
run('npm install', path.join(__dirname, 'infrastructure'))
ok('All dependencies installed')

// 2. Create .env.local if missing
const envPath = path.join(__dirname, 'frontend', '.env.local')
if (!fs.existsSync(envPath)) {
  fs.copyFileSync(
    path.join(__dirname, 'frontend', '.env.example'),
    envPath
  )
  ok('.env.local created from template')
  warn('Edit frontend/.env.local and add your API keys before running!')
} else {
  ok('.env.local already exists')
}

// 3. Done
console.log(`
\x1b[32m✅ Setup complete!\x1b[0m

\x1b[1mNext steps:\x1b[0m

  1. Edit \x1b[36mfrontend/.env.local\x1b[0m and set your Anthropic API key
  2. Run \x1b[36mnpm run dev\x1b[0m to start the dev server
  3. Open \x1b[36mhttp://localhost:3000\x1b[0m

\x1b[1mTo deploy to AWS:\x1b[0m

  cd infrastructure
  npx cdk bootstrap
  ANTHROPIC_API_KEY=sk-ant-... npx cdk deploy --all
`)
