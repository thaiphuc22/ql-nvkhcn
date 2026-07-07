/**
 * Tests for the harness enforcement hooks. Zero dependencies — uses Node's
 * built-in test runner. Run from the repo root:
 *
 *   node --test .claude/hooks/hooks.test.mjs
 *
 * Each test builds a throwaway project fixture in a temp dir, points the hook
 * at it via CLAUDE_PROJECT_DIR, feeds it the real stdin payload, and asserts on
 * stdout + exit code — the same contract Claude Code uses at runtime.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HOOK_DIR, "..", "..");
const SESSION_START = join(HOOK_DIR, "session-start.js");
const GUARD = join(HOOK_DIR, "harness-guard.js");

/** Build a temp project from a { relPath: contents } map. Returns its root dir. */
function fixture(files, { prefix = "harness-test-" } = {}) {
  const root = mkdtempSync(join(tmpdir(), prefix));
  for (const [rel, contents] of Object.entries(files)) {
    const full = join(root, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents);
  }
  return root;
}

/** Spawn a hook, feed stdin, resolve { stdout, code }. */
function runHook(script, { cwd, input = "{}", env = {} } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      env: { ...process.env, CLAUDE_PROJECT_DIR: cwd, ...env },
    });
    let stdout = "";
    child.stdout.on("data", (c) => (stdout += c));
    child.on("error", reject);
    child.on("close", (code) => resolve({ stdout, code }));
    child.stdin.end(input);
  });
}

/** Pull the injected SessionStart context string out of the hook's JSON. */
function digest(stdout) {
  if (!stdout.trim()) return "";
  return JSON.parse(stdout).hookSpecificOutput.additionalContext;
}

const FILLED_FULL = `# Delivery State

## Your Next Action
> **Status**: IN PROGRESS — building F1.

## Foundations
- [x] F0: Workspace & Agent Readiness — DONE
- [ ] F1: Project Scaffold — IN PROGRESS
- [ ] F2: Core Data Schema — NOT STARTED

## Active Feature Workstreams
- [ ] Feature Module 1 — NOT STARTED

## Blockers
_None._
`;

const READY_FILES = {
  "CLAUDE.md": "# CLAUDE.md\nshort and lean\n",
  ".claude/settings.json": "{}",
  ".claude/skills/demo/SKILL.md": "# demo skill\n",
};

// ─────────────────────────── session-start.js ───────────────────────────

test("session-start: no harness state → emits nothing", async () => {
  const root = fixture({ "README.md": "# x" });
  const { stdout, code } = await runHook(SESSION_START, { cwd: root });
  assert.equal(code, 0);
  assert.equal(stdout.trim(), "");
  rmSync(root, { recursive: true, force: true });
});

test("session-start: full profile counts only the Foundations section (not feature boxes)", async () => {
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": FILLED_FULL, ...READY_FILES });
  const ctx = digest((await runHook(SESSION_START, { cwd: root })).stdout);
  // 3 foundation boxes (1 done), the feature checkbox must NOT inflate the total.
  assert.match(ctx, /Foundations: 1\/3 complete/);
  rmSync(root, { recursive: true, force: true });
});

test("session-start: lite profile is detected", async () => {
  const lite = `# State
## Now
Building F1.
## Foundations
- [ ] F0: Workspace & agent readiness
- [ ] F1: Project scaffold
## Active task
none
`;
  const root = fixture({ ".harness/state/STATE.md": lite, ...READY_FILES });
  const ctx = digest((await runHook(SESSION_START, { cwd: root })).stdout);
  assert.match(ctx, /LITE profile/);
  assert.match(ctx, /Foundations: 0\/2 complete/);
  rmSync(root, { recursive: true, force: true });
});

test("session-start: readiness markers reflect what is wired", async () => {
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": FILLED_FULL, ...READY_FILES });
  const ctx = digest((await runHook(SESSION_START, { cwd: root })).stdout);
  assert.match(ctx, /Agentic readiness:/);
  assert.match(ctx, /✓ CLAUDE\.md/);
  assert.match(ctx, /✓ skills/);
  assert.match(ctx, /✓ hooks/);
  assert.match(ctx, /✗ instructions/); // no .github/copilot-instructions.md in fixture
  rmSync(root, { recursive: true, force: true });
});

test("session-start: warns when repo is under a cloud-sync folder", async () => {
  // Prefix forces "OneDrive" into the project path → cloud regex must fire.
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": FILLED_FULL, ...READY_FILES }, { prefix: "OneDrive-" });
  const ctx = digest((await runHook(SESSION_START, { cwd: root })).stdout);
  assert.match(ctx, /cloud-sync folder/i);
  rmSync(root, { recursive: true, force: true });
});

test("session-start: warns when the instruction file is oversized", async () => {
  const bloated = "# CLAUDE.md\n" + "line\n".repeat(700);
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": FILLED_FULL, ...READY_FILES, "CLAUDE.md": bloated });
  const ctx = digest((await runHook(SESSION_START, { cwd: root })).stdout);
  assert.match(ctx, /Primary instruction file is \d+ lines \(> 600\)/);
  assert.match(ctx, /crowd out task context/);
  rmSync(root, { recursive: true, force: true });
});

// ─────────────────────────── harness-guard.js ───────────────────────────

const PLACEHOLDER_STATE = "## Foundations\n- [ ] F0: Workspace & Agent Readiness — None yet — set up foundations\n";
const NO_FOUNDATIONS_DONE = "## Foundations\n- [ ] F1: Project Scaffold — `NOT STARTED`\n- [ ] F2: Schema — `NOT STARTED`\n";
const ONE_FOUNDATION_DONE = "## Foundations\n- [x] F0: Readiness — DONE\n- [ ] F1: Project Scaffold\n";

function guardInput(root, rel) {
  return JSON.stringify({ tool_input: { file_path: join(root, rel) }, cwd: root });
}

test("guard: editing an infra path (.harness) is always allowed silently", async () => {
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": PLACEHOLDER_STATE });
  const { stdout, code } = await runHook(GUARD, { cwd: root, input: guardInput(root, ".harness/foo.md") });
  assert.equal(code, 0);
  assert.equal(stdout.trim(), "");
  rmSync(root, { recursive: true, force: true });
});

test("guard: editing source while state is an unfilled template → soft warn", async () => {
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": PLACEHOLDER_STATE });
  const { stdout, code } = await runHook(GUARD, { cwd: root, input: guardInput(root, "src/app.ts") });
  assert.equal(code, 0); // soft = allow
  const out = JSON.parse(stdout).hookSpecificOutput;
  assert.equal(out.permissionDecision, "allow");
  assert.match(out.permissionDecisionReason, /unfilled template/);
  rmSync(root, { recursive: true, force: true });
});

test("guard: editing source with 0 foundations complete → soft warn", async () => {
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": NO_FOUNDATIONS_DONE });
  const { stdout } = await runHook(GUARD, { cwd: root, input: guardInput(root, "src/app.ts") });
  assert.match(JSON.parse(stdout).hookSpecificOutput.permissionDecisionReason, /0\/2 foundations/);
  rmSync(root, { recursive: true, force: true });
});

test("guard: strict mode turns the warning into a hard deny (exit 2)", async () => {
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": PLACEHOLDER_STATE });
  const { stdout, code } = await runHook(GUARD, {
    cwd: root,
    input: guardInput(root, "src/app.ts"),
    env: { HARNESS_GUARD_STRICT: "1" },
  });
  assert.equal(code, 2);
  assert.equal(JSON.parse(stdout).hookSpecificOutput.permissionDecision, "deny");
  rmSync(root, { recursive: true, force: true });
});

test("guard: a completed foundation lets source edits through silently", async () => {
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": ONE_FOUNDATION_DONE });
  const { stdout, code } = await runHook(GUARD, { cwd: root, input: guardInput(root, "src/app.ts") });
  assert.equal(code, 0);
  assert.equal(stdout.trim(), "");
  rmSync(root, { recursive: true, force: true });
});

test("guard: fails open on malformed stdin", async () => {
  const root = fixture({ ".harness/state/DELIVERY_STATE.md": PLACEHOLDER_STATE });
  const { stdout, code } = await runHook(GUARD, { cwd: root, input: "not json {{{" });
  assert.equal(code, 0);
  assert.equal(stdout.trim(), "");
  rmSync(root, { recursive: true, force: true });
});

// ──────────────────────── repo wiring & consistency ────────────────────────
// These read the kit's real files, so a future renumber or broken link fails CI.

const repoRead = (rel) => readFileSync(join(REPO_ROOT, rel), "utf8");

/** Foundation ids (F0, F1, …) inside a "## Foundations" section, in order. */
function foundationIds(md) {
  const m = md.match(/##+\s*Foundations[^\n]*\n([\s\S]*?)(\n##\s|$)/i);
  return [...(m ? m[1] : "").matchAll(/\bF(\d+):/g)].map((x) => Number(x[1]));
}

test("wiring: settings.json is valid and wires both hooks", () => {
  const cfg = JSON.parse(repoRead(".claude/settings.json"));
  const cmds = JSON.stringify(cfg.hooks);
  assert.match(cmds, /session-start\.js/);
  assert.match(cmds, /harness-guard\.js/);
});

test("wiring: DELIVERY_STATE foundations are contiguous from F0", () => {
  const ids = foundationIds(repoRead(".harness/state/DELIVERY_STATE.md"));
  assert.deepEqual(ids, [0, 1, 2, 3, 4, 5]);
});

test("wiring: lite STATE foundations are contiguous from F0", () => {
  const ids = foundationIds(repoRead(".harness/lite/STATE.md"));
  assert.deepEqual(ids, [0, 1, 2, 3]);
});

test("wiring: F0 is the readiness foundation everywhere it is defined", () => {
  assert.match(repoRead(".harness/state/DELIVERY_STATE.md"), /F0: Workspace & Agent Readiness/);
  assert.match(repoRead(".harness/lite/STATE.md"), /F0: Workspace & agent readiness/);
  assert.match(repoRead(".harness/workflows/foundations.md"), /## Foundation 0 — Workspace & Agent Readiness/);
});

test("wiring: the AI-collaboration-hygiene rule exists and is registered in the README", () => {
  assert.match(repoRead(".harness/rules/ai-collaboration-hygiene.md"), /# AI Collaboration Hygiene/);
  assert.match(repoRead(".harness/README.md"), /ai-collaboration-hygiene\.md/);
});

test("wiring: the skills map exists and the root README links it", () => {
  assert.match(repoRead(".claude/skills/README.md"), /# Skills Map/);
  assert.match(repoRead("README.md"), /skills\/README\.md/);
});

test("wiring: /harness-start onboarding command exists and the root README points to it", () => {
  assert.match(repoRead(".claude/commands/harness-start.md"), /name: harness-start/);
  assert.match(repoRead("README.md"), /\/harness-start/);
});

test("wiring: prompt-quality-check skill exists and is listed in the skills map", () => {
  assert.match(repoRead(".claude/skills/prompt-quality-check/SKILL.md"), /name: prompt-quality-check/);
  assert.match(repoRead(".claude/skills/README.md"), /prompt-quality-check/);
});
