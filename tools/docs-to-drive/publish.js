// Convert selected repo Markdown files to Google Docs and publish them to a
// Drive folder shared with the service account. Usage:
//   node publish.js docs/req/RTM.md docs/arch
// Each argument is either a .md file or a directory (recursed for .md files).

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { marked } = require("marked");

const TOOL_DIR = __dirname;
const REPO_ROOT = path.resolve(TOOL_DIR, "..", "..");
const CONFIG_PATH = path.join(TOOL_DIR, "config.json");
const MANIFEST_PATH = path.join(TOOL_DIR, "manifest.json");
const KEY_PATH = path.join(TOOL_DIR, ".credentials", "service-account.json");

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

function toPosix(relPath) {
  return relPath.split(path.sep).join("/");
}

function collectMarkdownFiles(inputPath) {
  const abs = path.resolve(REPO_ROOT, inputPath);
  const stat = fs.statSync(abs);
  if (stat.isFile()) {
    if (!abs.toLowerCase().endsWith(".md")) {
      throw new Error(`Not a markdown file: ${inputPath}`);
    }
    return [abs];
  }
  const results = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const entryPath = path.join(abs, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(path.relative(REPO_ROOT, entryPath)));
    } else if (entry.name.toLowerCase().endsWith(".md")) {
      results.push(entryPath);
    }
  }
  return results;
}

function mdToHtml(markdownContent, title) {
  const body = marked.parse(markdownContent);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${body}</body></html>`;
}

async function findOrCreateFolder(drive, parentId, name) {
  const escaped = name.replace(/'/g, "\\'");
  const q = `'${parentId}' in parents and name='${escaped}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const list = await drive.files.list({ q, fields: "files(id, name)", spaces: "drive" });
  if (list.data.files && list.data.files.length > 0) {
    return list.data.files[0].id;
  }
  const created = await drive.files.create({
    resource: { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
    fields: "id",
  });
  return created.data.id;
}

async function resolveTargetFolder(drive, rootFolderId, relDir) {
  if (relDir === "." || relDir === "") return rootFolderId;
  let parentId = rootFolderId;
  for (const segment of relDir.split(path.sep)) {
    parentId = await findOrCreateFolder(drive, parentId, segment);
  }
  return parentId;
}

async function publishFile(drive, config, manifest, absFile) {
  const relPath = toPosix(path.relative(REPO_ROOT, absFile));
  const relDir = path.dirname(path.relative(REPO_ROOT, absFile));
  const title = path.basename(absFile, ".md");
  const markdownContent = fs.readFileSync(absFile, "utf8");
  const html = mdToHtml(markdownContent, title);

  const folderId = await resolveTargetFolder(drive, config.rootFolderId, relDir);
  const media = { mimeType: "text/html", body: html };
  const existing = manifest[relPath];

  if (existing && existing.fileId) {
    await drive.files.update({ fileId: existing.fileId, media });
    console.log(`updated  ${relPath} -> ${existing.webViewLink}`);
    return;
  }

  const created = await drive.files.create({
    resource: {
      name: title,
      parents: [folderId],
      mimeType: "application/vnd.google-apps.document",
    },
    media,
    fields: "id, webViewLink",
  });

  manifest[relPath] = { fileId: created.data.id, webViewLink: created.data.webViewLink, folderId };
  saveManifest(manifest);
  console.log(`created  ${relPath} -> ${created.data.webViewLink}`);
}

async function main() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    console.error("Usage: node publish.js <file-or-dir> [more...]");
    process.exit(1);
  }
  if (!fs.existsSync(KEY_PATH)) {
    console.error(`Missing service account key at ${KEY_PATH}`);
    process.exit(1);
  }

  const config = loadJson(CONFIG_PATH, {});
  if (!config.rootFolderId || config.rootFolderId.startsWith("PASTE_")) {
    console.error("Set rootFolderId in tools/docs-to-drive/config.json first.");
    process.exit(1);
  }
  const manifest = loadJson(MANIFEST_PATH, {});

  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  const drive = google.drive({ version: "v3", auth });

  const files = inputs.flatMap(collectMarkdownFiles);
  console.log(`Publishing ${files.length} file(s) to Drive folder ${config.rootFolderId}...`);
  for (const absFile of files) {
    await publishFile(drive, config, manifest, absFile);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
