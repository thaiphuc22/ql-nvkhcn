#!/usr/bin/env node
/**
 * PreToolUse(Edit|Write) hook — enforces "foundations before features".
 *
 * CLAUDE.md says feature work must not start until foundations are COMPLETE and
 * harness state is initialized. That rule is otherwise only prose. This hook
 * gives it teeth: when an Edit/Write targets what looks like application/source
 * code while the harness state is still an unfilled template (or has zero
 * foundations complete), it surfaces a warning to the model.
 *
 * Default = soft (permissionDecision "allow" + reason — the model is told, work
 * proceeds). Set HARNESS_GUARD_STRICT=1 to make it hard (deny + exit 2).
 *
 * It deliberately IGNORES edits to harness/config/docs paths so that setting up
 * the harness itself is never blocked.
 *
 * Fail-open: any internal error exits 0 (allow) silently. A guard bug must never
 * stop legitimate work.
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

function allowSilently() {
  process.exit(0);
}

function warn(reason, strict) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: strict ? "deny" : "allow",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(strict ? 2 : 0);
}

/** Paths that are infrastructure, not feature code — never guarded. */
function isInfraPath(rel) {
  const p = rel.replace(/\\/g, "/").toLowerCase();
  if (p.startsWith(".harness/")) return true;
  if (p.startsWith(".claude/")) return true;
  if (p.startsWith("docs/")) return true;
  if (p.startsWith(".github/")) return true;
  // top-level config / meta files
  const base = p.split("/").pop();
  const metaFiles = [
    "readme.md",
    "claude.md",
    "license",
    "third_party_notices.md",
    ".gitignore",
    ".mcp.json",
    "package.json",
    "tsconfig.json",
    "docker-compose.yml",
  ];
  if (!p.includes("/") && (metaFiles.includes(base) || base.endsWith(".md"))) return true;
  return false;
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

let buf = "";
process.stdin.on("data", (c) => (buf += c));
process.stdin.on("end", () => {
  try {
    const strict = process.env.HARNESS_GUARD_STRICT === "1";
    const event = JSON.parse(buf || "{}");
    const filePath = event?.tool_input?.file_path;
    if (!filePath) return allowSilently();

    const root = process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd();
    const rel = path.relative(root, filePath);

    // Outside project, or infra/config/docs/harness — never guard.
    if (rel.startsWith("..") || path.isAbsolute(rel)) return allowSilently();
    if (isInfraPath(rel)) return allowSilently();

    // Read harness state (full or lite). No harness → nothing to enforce.
    const stateDir = path.join(root, ".harness", "state");
    const md = read(path.join(stateDir, "STATE.md")) || read(path.join(stateDir, "DELIVERY_STATE.md"));
    if (md === null) return allowSilently();

    const f = countFoundations(md);
    const uninitialized = isPlaceholder(md);
    const noFoundations = f.total > 0 && f.done === 0;

    if (uninitialized) {
      return warn(
        `Harness foundations-before-features rule: you are editing source file "${rel}" but .harness/state is still the unfilled template. ` +
          `Initialize the delivery state and define/complete foundations before feature work. ` +
          `(Set HARNESS_GUARD_STRICT=1 to make this a hard block; editing .harness/, .claude/, docs/ is always allowed.)`,
        strict
      );
    }
    if (noFoundations) {
      return warn(
        `Harness foundations-before-features rule: editing source file "${rel}" but 0/${f.total} foundations are marked COMPLETE in the delivery state. ` +
          `Finish foundations first, or update the state if this edit IS foundation work.`,
        strict
      );
    }
    return allowSilently();
  } catch {
    process.exit(0);
  }
});
