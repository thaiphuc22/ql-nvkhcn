#!/usr/bin/env node
/**
 * SessionStart hook — operationalizes the harness "read state first" rule.
 *
 * Instead of *hoping* the model reads .harness/state/* at the start of every
 * session (as CLAUDE.md asks), this injects a concise digest of the current
 * delivery state directly into context. Enforcement, not prose.
 *
 * Supports both profiles:
 *   - Full harness:  .harness/state/DELIVERY_STATE.md  (+ active-task.md)
 *   - Lite profile:  .harness/state/STATE.md           (single combined file)
 *
 * Contract: print { hookSpecificOutput: { hookEventName, additionalContext } }
 * to stdout and exit 0. On ANY internal error we exit 0 silently — a hook bug
 * must never break the session.
 */
const fs = require("fs");
const path = require("path");

function read(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function emit(context) {
  if (context) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "SessionStart",
          additionalContext: context.slice(0, 9000),
        },
      })
    );
  }
  process.exit(0);
}

/** First non-empty, non-comment line under a "## Heading" section. */
function sectionBody(md, heading) {
  const re = new RegExp("##+\\s*" + heading + "[^\\n]*\\n([\\s\\S]*?)(\\n##\\s|$)", "i");
  const m = md.match(re);
  if (!m) return "";
  return m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("<!--") && !l.startsWith("---"))
    .join("\n")
    .trim();
}

/** Restrict to the "## Foundations" section so feature/workstream checkboxes aren't counted. */
function foundationScope(md) {
  const m = md.match(/##+\s*Foundations[^\n]*\n([\s\S]*?)(\n##\s|$)/i);
  return m ? m[1] : md;
}

function countFoundations(md) {
  const scope = foundationScope(md);
  const done = (scope.match(/- \[x\]/gi) || []).length;
  const open = (scope.match(/- \[ \]/g) || []).length;
  return { done, total: done + open };
}

function isPlaceholder(md) {
  return /<YYYY-MM-DD>|NOT STARTED — fill in foundations below|None yet — set up foundations/.test(md);
}

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/** Non-empty directory check (a skills/ dir that exists but is empty doesn't count). */
function hasFiles(dir) {
  try {
    return fs.statSync(dir).isDirectory() && fs.readdirSync(dir).length > 0;
  } catch {
    return false;
  }
}

/**
 * Agentic-readiness + config-health digest. Inspired by AI-Engineering-Coach's
 * config-health-helpers.ts (MIT, microsoft/AI-Engineering-Coach): checks that the
 * project is actually set up to be driven by an agent, and flags two footguns —
 * a repo living under cloud storage (corrupts agent state files) and an oversized
 * primary instruction file (dilutes context). Returns [] on a clean/unknown project.
 */
// Repo under a sync folder → agents writing state hit corruption/conflict files.
const CLOUD_PATH_PATTERNS = [/onedrive/i, /google\s*drive/i, /dropbox/i, /icloud/i, /cloudstorage/i];
const OVERSIZED_INSTRUCTION_LINES = 600;

function readinessLines(root) {
  const out = [];

  // Cloud-storage footgun — highest-value signal, surface first.
  if (CLOUD_PATH_PATTERNS.some((re) => re.test(root))) {
    out.push("⚠️ Project is under a cloud-sync folder (OneDrive/Dropbox/…). Agent state files can corrupt or conflict — move the repo to a local path.");
  }

  // Oversized primary instruction file dilutes every prompt's context.
  const guide = read(path.join(root, "CLAUDE.md")) || read(path.join(root, "AGENTS.md"));
  if (guide) {
    const n = guide.split("\n").length;
    if (n > OVERSIZED_INSTRUCTION_LINES) {
      out.push(`⚠️ Primary instruction file is ${n} lines (> ${OVERSIZED_INSTRUCTION_LINES}). Trim it — long instructions crowd out task context.`);
    }
  }

  // Agentic-readiness markers (✓/✗) — what the project has wired up for agents.
  const markers = [
    ["CLAUDE.md", exists(path.join(root, "CLAUDE.md")) || exists(path.join(root, "AGENTS.md"))],
    ["instructions", exists(path.join(root, ".github", "copilot-instructions.md")) || hasFiles(path.join(root, ".github", "instructions"))],
    ["skills", hasFiles(path.join(root, ".claude", "skills")) || hasFiles(path.join(root, ".github", "skills"))],
    ["hooks", exists(path.join(root, ".claude", "settings.json"))],
  ];
  out.push("Agentic readiness: " + markers.map(([k, ok]) => `${ok ? "✓" : "✗"} ${k}`).join(" · "));
  return out;
}

try {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const stateDir = path.join(root, ".harness", "state");

  const liteFile = path.join(stateDir, "STATE.md");
  const fullState = path.join(stateDir, "DELIVERY_STATE.md");
  const activeTask = path.join(stateDir, "active-task.md");

  const lite = read(liteFile);
  if (lite !== null) {
    // ---- Lite profile ----
    const f = countFoundations(lite);
    const status = sectionBody(lite, "(?:Status|Now|Current)").split("\n")[0] || "(no status line)";
    const lines = [
      "📋 Harness state (LITE profile) — auto-injected by SessionStart hook.",
      `Foundations: ${f.done}/${f.total} complete.`,
      `Now: ${status}`,
    ];
    if (isPlaceholder(lite)) {
      lines.push("⚠️ State is still the unfilled template — initialize .harness/state/STATE.md before feature work.");
    } else {
      lines.push("Read .harness/state/STATE.md in full before acting. Foundations before features.");
    }
    lines.push(...readinessLines(root));
    return emit(lines.join("\n"));
  }

  const full = read(fullState);
  if (full === null) {
    // No harness state at all — nothing to inject.
    return emit(null);
  }

  // ---- Full harness ----
  const f = countFoundations(full);
  const nextAction =
    sectionBody(full, "Your Next Action").split("\n").find((l) => /status/i.test(l)) ||
    sectionBody(full, "Your Next Action").split("\n")[0] ||
    "(no next action recorded)";
  const blockers = sectionBody(full, "Blockers");

  const at = read(activeTask) || "";
  const currentTask = sectionBody(at, "Task").split("\n")[0] || "(none)";

  const lines = [
    "📋 Harness state — auto-injected by SessionStart hook. Treat .harness/state/* as source of truth.",
    `Foundations: ${f.done}/${f.total} complete.`,
    `Next action: ${nextAction.replace(/^>\s*/, "").trim()}`,
    `Active task: ${currentTask}`,
  ];
  if (blockers && !/^_?none/i.test(blockers)) {
    lines.push(`Blockers: ${blockers.split("\n")[0]}`);
  }
  if (isPlaceholder(full) || isPlaceholder(at)) {
    lines.push("⚠️ State files are still unfilled templates — fill DELIVERY_STATE.md / active-task.md before starting feature work.");
  } else {
    lines.push("Resume the active task first. No feature work until all foundations are COMPLETE.");
  }
  lines.push(...readinessLines(root));
  return emit(lines.join("\n"));
} catch {
  process.exit(0);
}
