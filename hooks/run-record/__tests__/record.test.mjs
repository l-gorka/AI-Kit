import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const hook = fileURLToPath(new URL('../record.mjs', import.meta.url));

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function setup() {
  const root = mkdtempSync(join(tmpdir(), 'run-record-test-'));
  const remote = join(root, 'remote.git');
  const work = join(root, 'work');
  git(root, 'init', '-q', '--bare', remote);
  git(root, 'init', '-q', '-b', 'main', work);
  writeFileSync(join(work, 'a.txt'), 'a\n');
  git(work, 'add', '.');
  git(work, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'init');
  git(work, 'remote', 'add', 'origin', remote);
  writeFileSync(join(work, 'a.txt'), 'dirty\n');

  const projects = join(root, 'projects');
  mkdirSync(join(projects, 's1', 'subagents'), { recursive: true });
  const transcript = join(projects, 's1.jsonl');
  const assistant = {
    type: 'assistant',
    requestId: 'r1',
    timestamp: '2026-03-01T00:00:00.000Z',
    message: { model: 'm', usage: { input_tokens: 1, output_tokens: 2 }, content: [{ type: 'text', text: 'hi' }] },
  };
  writeFileSync(transcript, `${JSON.stringify(assistant)}\n`);
  return { root, remote, work, transcript };
}

function runHook(env, input) {
  return execFileSync('node', [hook], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_CODE_REMOTE_SESSION_ID: '', ...env },
  });
}

test('stores the record on the run-log branch without touching the checkout', () => {
  const { root, remote, work, transcript } = setup();
  try {
    const input = { session_id: 's1', transcript_path: transcript, cwd: work, hook_event_name: 'Stop' };
    assert.equal(runHook({}, input), '');
    assert.equal(runHook({}, { ...input, hook_event_name: 'SessionEnd', reason: 'exit' }), '');
    // Same record apart from recorded_at: no new commit.
    assert.equal(runHook({}, { ...input, hook_event_name: 'SessionEnd', reason: 'exit' }), '');

    const stored = JSON.parse(git(remote, 'show', 'run-log:runs/s1.json'));
    assert.equal(stored.recorded_on, 'SessionEnd');
    assert.equal(stored.end_reason, 'exit');
    assert.equal(stored.identity.branch, 'main');
    assert.equal(stored.repo.tracked_files, 1);
    assert.equal(git(remote, 'rev-list', '--count', 'run-log'), '2');
    assert.equal(git(work, 'rev-parse', '--abbrev-ref', 'HEAD'), 'main');
    assert.equal(git(work, 'status', '--porcelain'), 'M a.txt');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('reports a storage failure in the session output and exits 0', () => {
  const { root, work, transcript } = setup();
  try {
    const out = runHook(
      { AI_KIT_RUN_LOG_REMOTE: join(root, 'missing.git') },
      { session_id: 's1', transcript_path: transcript, cwd: work, hook_event_name: 'Stop' },
    );
    assert.match(JSON.parse(out).systemMessage, /^run-record: storing the record failed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('reports bad hook input and exits 0', () => {
  const out = runHook({}, {});
  assert.match(JSON.parse(out).systemMessage, /nothing recorded/);
});
