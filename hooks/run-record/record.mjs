#!/usr/bin/env node
// Claude Code hook (Stop and SessionEnd): builds this session's run record,
// validates it, and stores it as runs/<YYYY-MM>/<session_id>.json on the
// run-log branch. Each call overwrites the session's file, so the last turn
// wins. Never blocks or fails the session: problems go to the session output
// as a systemMessage and the hook exits 0.
//
// Configuration (environment, all optional):
//   AI_KIT_RUN_LOG_REMOTE   git remote name or URL to push to (default: origin)
//   AI_KIT_RUN_LOG_BRANCH   branch that holds the records (default: run-log)
//   AI_KIT_RUN_LOG_DISABLE  set to 1 to skip recording

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRecord, parseJsonl, validate } from './lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUSH_ATTEMPTS = 3;
const GIT_TIMEOUT_MS = 20_000;

function report(message) {
  process.stdout.write(`${JSON.stringify({ systemMessage: `run-record: ${message}` })}\n`);
}

function git(cwd, args, options = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: GIT_TIMEOUT_MS,
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function tryGit(cwd, args) {
  try {
    return git(cwd, args);
  } catch {
    return null;
  }
}

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function readSubagents(transcriptPath, sessionId) {
  const dir = join(dirname(transcriptPath), sessionId, 'subagents');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /^agent-.+\.jsonl$/.test(name))
    .sort()
    .map((name) => {
      const agentId = basename(name, '.jsonl').replace(/^agent-/, '');
      let meta = {};
      try {
        meta = JSON.parse(readFileSync(join(dir, `agent-${agentId}.meta.json`), 'utf8'));
      } catch {
        // Older Claude Code versions write no meta file.
      }
      return {
        agentId,
        type: meta.agentType ?? null,
        toolUseId: meta.toolUseId ?? null,
        entries: parseJsonl(readFileSync(join(dir, name), 'utf8')),
      };
    });
}

// "owner/repo" from a GitHub-style remote URL; never returns credentials.
function projectName(cwd) {
  const url = tryGit(cwd, ['remote', 'get-url', 'origin']);
  if (!url) return null;
  const match = url.match(/[/:]([^/:]+\/[^/]+?)(?:\.git)?\/?$/);
  return match ? match[1] : null;
}

function sessionLink() {
  const remoteId = process.env.CLAUDE_CODE_REMOTE_SESSION_ID;
  if (!remoteId?.startsWith('cse_')) return null;
  return `https://claude.ai/code/session_${remoteId.slice('cse_'.length)}`;
}

function repoFacts(cwd) {
  const facts = { packedBytes: null, trackedFiles: null, commits: null, shallow: null };
  const counts = tryGit(cwd, ['count-objects', '-v']);
  const packKiB = counts?.match(/^size-pack: (\d+)$/m);
  if (packKiB) facts.packedBytes = Number(packKiB[1]) * 1024;
  const files = tryGit(cwd, ['ls-files', '-z']);
  if (files !== null) facts.trackedFiles = files.split('\0').filter(Boolean).length;
  const commits = tryGit(cwd, ['rev-list', '--count', 'HEAD']);
  if (commits !== null) facts.commits = Number(commits);
  const shallow = tryGit(cwd, ['rev-parse', '--is-shallow-repository']);
  if (shallow !== null) facts.shallow = shallow === 'true';
  return facts;
}

// Commits the record onto the run-log branch with plumbing commands and a
// throwaway index, so the working tree, index, and HEAD stay untouched.
function store(cwd, filePath, line) {
  const remote = process.env.AI_KIT_RUN_LOG_REMOTE || 'origin';
  const branch = process.env.AI_KIT_RUN_LOG_BRANCH || 'run-log';
  const localRef = `refs/ai-kit/${branch}`;
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: 'ai-kit run-record',
    GIT_AUTHOR_EMAIL: 'run-record@ai-kit.invalid',
    GIT_COMMITTER_NAME: 'ai-kit run-record',
    GIT_COMMITTER_EMAIL: 'run-record@ai-kit.invalid',
  };
  const scratch = mkdtempSync(join(tmpdir(), 'run-record-'));
  const indexEnv = { ...env, GIT_INDEX_FILE: join(scratch, 'index') };
  let lastError = null;
  try {
    const blob = git(cwd, ['hash-object', '-w', '--stdin'], { input: line });
    for (let attempt = 1; attempt <= PUSH_ATTEMPTS; attempt += 1) {
      let parent = null;
      try {
        git(cwd, ['fetch', '--quiet', '--no-tags', remote, `+refs/heads/${branch}:${localRef}`]);
        parent = git(cwd, ['rev-parse', '--verify', `${localRef}^{commit}`]);
      } catch (error) {
        if (!/couldn't find remote ref/i.test(String(error.stderr))) throw error;
      }
      rmSync(indexEnv.GIT_INDEX_FILE, { force: true });
      if (parent) git(cwd, ['read-tree', parent], { env: indexEnv });
      git(cwd, ['update-index', '--add', '--cacheinfo', `100644,${blob},${filePath}`], { env: indexEnv });
      const tree = git(cwd, ['write-tree'], { env: indexEnv });
      if (parent && git(cwd, ['rev-parse', `${parent}^{tree}`]) === tree) return;
      const commitArgs = ['commit-tree', tree, '-m', `run: ${filePath}`];
      if (parent) commitArgs.push('-p', parent);
      const commit = git(cwd, commitArgs, { env });
      try {
        git(cwd, ['push', '--quiet', remote, `${commit}:refs/heads/${branch}`]);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function errorText(error) {
  const stderr = String(error?.stderr ?? '').trim().split('\n').at(-1);
  return stderr || error?.message || String(error);
}

function main() {
  if (process.env.AI_KIT_RUN_LOG_DISABLE === '1') return;
  const input = readStdin();
  const sessionId = input.session_id;
  const transcriptPath = input.transcript_path;
  const cwd = input.cwd || process.cwd();
  if (!sessionId || !transcriptPath || !existsSync(transcriptPath)) {
    report('no session id or transcript in the hook input; nothing recorded');
    return;
  }

  const contextWarnings = [];
  const branch = tryGit(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const record = buildRecord({
    main: parseJsonl(readFileSync(transcriptPath, 'utf8')),
    subagents: readSubagents(transcriptPath, sessionId),
    context: {
      now: new Date().toISOString(),
      event: input.hook_event_name === 'SessionEnd' ? 'SessionEnd' : 'Stop',
      endReason: input.reason ?? null,
      sessionId,
      sessionLink: sessionLink(),
      project: projectName(cwd),
      branch: branch && branch !== 'HEAD' ? branch : null,
      repo: repoFacts(cwd),
      warnings: contextWarnings,
    },
  });

  const schema = JSON.parse(readFileSync(join(HERE, 'schema.json'), 'utf8'));
  const errors = validate(record, schema);
  if (errors.length > 0) {
    report(`record failed schema validation, not stored: ${errors.slice(0, 5).join('; ')}`);
    return;
  }

  const month = (record.time.start ?? record.recorded_at).slice(0, 7);
  const filePath = `runs/${month}/${sessionId}.json`;
  try {
    store(cwd, filePath, `${JSON.stringify(record)}\n`);
  } catch (error) {
    report(`storing the record failed: ${errorText(error)}`);
  }
}

try {
  main();
} catch (error) {
  report(`unexpected error, nothing recorded: ${error?.message ?? error}`);
}
process.exit(0);
