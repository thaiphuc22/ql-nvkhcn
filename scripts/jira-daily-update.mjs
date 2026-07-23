const required = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN", "JIRA_JQL"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
}

const baseUrl = process.env.JIRA_BASE_URL.replace(/\/+$/, "");
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_API_TOKEN;
const jql = process.env.JIRA_JQL;
const maxIssues = Number(process.env.JIRA_MAX_ISSUES || "50");
const dryRun = String(process.env.JIRA_DRY_RUN || "true").toLowerCase() === "true";
const actionModeRaw = process.env.JIRA_ACTION_MODE || "comment";
const actionModes = actionModeRaw
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const transitionId = process.env.JIRA_TRANSITION_ID || "";
const commentTemplate =
  process.env.JIRA_COMMENT_TEMPLATE ||
  "Daily auto-update: Please update status, blockers, and ETA.";
const fieldsJson = process.env.JIRA_FIELDS_JSON || "";

let parsedFields = null;
if (fieldsJson) {
  try {
    parsedFields = JSON.parse(fieldsJson);
  } catch (err) {
    throw new Error(`JIRA_FIELDS_JSON is invalid JSON: ${err.message}`);
  }
}

const auth = Buffer.from(`${email}:${token}`).toString("base64");

async function jiraFetch(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API ${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function commentBody(text) {
  return {
    body: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text }],
        },
      ],
    },
  };
}

async function run() {
  console.log(`Mode: ${actionModes.join(", ") || "comment"}`);
  console.log(`Dry-run: ${dryRun}`);
  console.log(`JQL: ${jql}`);

  const search = await jiraFetch("/rest/api/3/search", {
    method: "POST",
    body: JSON.stringify({
      jql,
      maxResults: maxIssues,
      fields: ["summary", "status", "assignee", "duedate"],
    }),
  });

  const issues = search.issues || [];
  console.log(`Found ${issues.length} issues`);
  if (!issues.length) return;

  for (const issue of issues) {
    const key = issue.key;
    const summary = issue.fields?.summary || "";
    console.log(`\n- ${key}: ${summary}`);

    if (actionModes.includes("comment")) {
      if (dryRun) {
        console.log("  [dry-run] would add comment");
      } else {
        await jiraFetch(`/rest/api/3/issue/${key}/comment`, {
          method: "POST",
          body: JSON.stringify(commentBody(commentTemplate)),
        });
        console.log("  comment added");
      }
    }

    if (actionModes.includes("transition")) {
      if (!transitionId) {
        console.log("  skip transition (JIRA_TRANSITION_ID missing)");
      } else if (dryRun) {
        console.log(`  [dry-run] would transition to id=${transitionId}`);
      } else {
        await jiraFetch(`/rest/api/3/issue/${key}/transitions`, {
          method: "POST",
          body: JSON.stringify({ transition: { id: transitionId } }),
        });
        console.log(`  transitioned to id=${transitionId}`);
      }
    }

    if (actionModes.includes("fields")) {
      if (!parsedFields || typeof parsedFields !== "object") {
        console.log("  skip fields update (JIRA_FIELDS_JSON missing/invalid)");
      } else if (dryRun) {
        console.log("  [dry-run] would update fields");
      } else {
        await jiraFetch(`/rest/api/3/issue/${key}`, {
          method: "PUT",
          body: JSON.stringify({ fields: parsedFields }),
        });
        console.log("  fields updated");
      }
    }
  }
}

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
