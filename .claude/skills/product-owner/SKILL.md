---
name: product-owner
description: Use when running daily standups, prioritizing work, tracking cross-project dependencies, or managing development flow. Synthesizes GitHub state with AI-powered analysis, DORA metrics, and WSJF prioritization. Say "/standup", "what should I work on?", or "show project status".
---

# Product Owner Skill

A Claude-native product owner that provides daily standups, priority recommendations, and cross-project awareness without artificial sprint boundaries. Enhanced with AI-powered analysis, metrics tracking, and intelligent dependency detection.

## Contextd Integration (Optional)

If contextd MCP is available:
- `memory_record` for standup patterns, blockers, and prioritization decisions
- Cross-session priority tracking with decision accuracy measurement
- `memory_search` to find past standup context and recurring patterns
- `remediation_search` for known blockers and their resolutions

If contextd is NOT available:
- GitHub queries work normally
- No cross-session memory (stateless standups)
- No decision tracking or pattern learning

## Philosophy

- **Recommend, don't dictate**: Present priorities; user decides what to act on
- **Continuous flow**: No sprints or ceremonies - priorities adjust daily
- **Cross-project awareness**: Dependencies across repos get flagged and prioritized
- **Memory persistence**: Use contextd if available (optional)
- **Data-driven decisions**: Leverage DORA metrics and WSJF for objective prioritization
- **Learn from history**: Track decision accuracy to improve recommendations over time

## When to Use

| Trigger | Use Case |
|---------|----------|
| `/standup` | Daily standup report with AI-generated blockers |
| `/standup --metrics` | Include DORA metrics and velocity |
| `/standup --platform` | Cross-project view with dependency map |
| "what should I work on?" | WSJF-ranked priority recommendations |
| "project status" | Current state with risk scoring |
| "what's blocking?" | AI-powered blocker analysis |
| "show velocity" | Velocity tracking and forecasting |
| "show metrics" | DORA metrics dashboard |

## Data Sources

### GitHub (via MCP)

| Query | Purpose |
|-------|---------|
| `list_pull_requests` | Open PRs, review states, ages |
| `list_issues` | Priority-labeled issues |
| `list_commits` | Recent activity on main |
| `list_branches` | Detect stale branches |
| `get_commit` | Deployment tracking for DORA |
| `search_issues` | Cross-repo dependency detection |

### GitHub Projects v2 (via GraphQL)

| Query | Purpose |
|-------|---------|
| Project items | Sprint/iteration tracking |
| Custom fields | Story points, priority, status |
| Project views | Board and table layouts |

**GraphQL Example:**
```graphql
query {
  organization(login: "fyrsmithlabs") {
    projectV2(number: 1) {
      items(first: 100) {
        nodes {
          content { ... on Issue { title number } }
          fieldValues(first: 10) {
            nodes { ... on ProjectV2ItemFieldNumberValue { number } }
          }
        }
      }
    }
  }
}
```

### contextd (Cross-Session Memory)

| Query | Purpose |
|-------|---------|
| `checkpoint_list/resume` | Yesterday's state |
| `memory_search` | Recurring patterns, blockers |
| `remediation_search` | Known issues and fixes |
| `memory_record` | Store prioritization decisions |

---

## AI-Powered Analysis

### Risk Scoring

Calculate risk score (0-100) based on technical complexity and business impact:

```
Risk Score = (Technical Complexity * 0.4) + (Business Impact * 0.4) + (Time Sensitivity * 0.2)

Technical Complexity factors:
- Lines changed: >500 = HIGH, >100 = MEDIUM, else LOW
- Files touched: >10 = HIGH, >3 = MEDIUM, else LOW
- Cross-service changes: +20 points
- Database migrations: +25 points
- Security-sensitive areas: +30 points

Business Impact factors:
- Label priority:critical = 40, priority:high = 30, else 10
- Customer-facing: +20 points
- Revenue-impacting: +25 points
- Compliance-related: +30 points

Time Sensitivity factors:
- Days until deadline (if any)
- External dependencies timing
- Release train alignment
```

**Risk Categories:**
| Score | Category | Action |
|-------|----------|--------|
| 80-100 | CRITICAL | Immediate attention, may need escalation |
| 60-79 | HIGH | Prioritize this session |
| 40-59 | MEDIUM | Schedule within week |
| 0-39 | LOW | Normal queue |

### Semantic Dependency Detection

AI analyzes issue/PR content for implicit dependencies beyond explicit references:

**Patterns detected:**
- Shared code paths (same files modified)
- Common data models or schemas
- API contract dependencies
- Feature flag interdependencies
- Deployment order requirements

**Example detection:**
```
Issue #45: "Add user avatar upload"
Issue #52: "Implement image resizing service"
  -> DETECTED: #45 likely depends on #52 (image processing capability)
```

### Automated Blocker Identification

Scan issue comments and PR reviews for blocker signals:

**Signal patterns:**
```regex
# Explicit blockers
blocked by|waiting on|depends on|can't proceed

# Implicit blockers (in comments)
need.*first|requires.*before|after.*merged
stuck on|no progress|help needed

# Review blockers
changes requested.*\d+ days ago
approved but.*merge conflict
CI.*failing.*\d+ hours
```

**AI Comment Analysis:**
```
PR #42 Comments Analysis:
  - @alice (2 days ago): "This needs the auth refactor first"
  - @bob (1 day ago): "Still waiting on API spec"
  -> BLOCKERS DETECTED: Auth refactor, API spec finalization
```

---

## WSJF Prioritization

Weighted Shortest Job First for objective prioritization:

```
WSJF Score = Cost of Delay / Job Size

Cost of Delay = User Value + Time Criticality + Risk Reduction

Where:
- User Value: Business impact (1-10)
- Time Criticality: Urgency decay (1-10)
- Risk Reduction: Technical/business risk mitigated (1-10)
- Job Size: Estimated effort in story points or T-shirt sizes
```

### WSJF Calculation Example

```
Issue: Implement OAuth2 login
  User Value: 8 (high user demand)
  Time Criticality: 6 (competitor launching similar)
  Risk Reduction: 7 (security improvement)
  Job Size: 5 (medium complexity)
  WSJF = (8 + 6 + 7) / 5 = 4.2

Issue: Fix typo in docs
  User Value: 2 (minor inconvenience)
  Time Criticality: 1 (no deadline)
  Risk Reduction: 1 (no risk)
  Job Size: 1 (trivial)
  WSJF = (2 + 1 + 1) / 1 = 4.0

Result: OAuth2 login prioritized higher despite larger size
```

### Auto-WSJF from Labels

Map GitHub labels to WSJF components:

| Label | Component | Value |
|-------|-----------|-------|
| `priority:critical` | Time Criticality | 10 |
| `priority:high` | Time Criticality | 7 |
| `security` | Risk Reduction | 9 |
| `customer-facing` | User Value | 8 |
| `tech-debt` | Risk Reduction | 5 |
| `size:XL` | Job Size | 13 |
| `size:L` | Job Size | 8 |
| `size:M` | Job Size | 5 |
| `size:S` | Job Size | 3 |
| `size:XS` | Job Size | 1 |

---

## DORA Metrics Integration

Track and display key DevOps Research and Assessment metrics:

### Metrics Definitions

| Metric | Definition | Calculation |
|--------|------------|-------------|
| **Deployment Frequency** | How often code deploys to production | Deploys per day/week |
| **Lead Time for Changes** | Time from commit to production | PR open -> merge -> deploy |
| **Mean Time to Recovery** | Time to restore service after incident | Incident open -> resolved |
| **Change Failure Rate** | % of deployments causing failures | Failed deploys / total deploys |

### Data Collection

**Deployment Frequency:**
```
# Count merges to main/production in time period
mcp__MCP_DOCKER__list_commits(
  owner: "<org>",
  repo: "<repo>",
  sha: "main",
  since: "<period_start>"
)
```

**Lead Time for Changes:**
```
# For each merged PR:
Lead Time = PR merged_at - first_commit_at + deploy_delay
```

**Change Failure Rate:**
```
# Track labels/issues indicating failures
mcp__MCP_DOCKER__list_issues(
  labels: "incident,hotfix,rollback"
)
```

### Metrics Display Format

```
+-------------------------------------------------------------+
| DORA Metrics: <repo> (Last 30 days)                         |
+-------------------------------------------------------------+
| Deployment Frequency:  2.3/day  ########-- Elite            |
| Lead Time for Changes: 4.2 hrs  #######--- High             |
| Mean Time to Recovery: 1.1 hrs  ########-- Elite            |
| Change Failure Rate:   8%       #######--- High             |
+-------------------------------------------------------------+
| Trend: ^ Improving (vs last 30 days)                        |
| Team Performance: HIGH PERFORMER                            |
+-------------------------------------------------------------+
```

### Performance Benchmarks

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| Deploy Frequency | Multiple/day | Daily-Weekly | Weekly-Monthly | Monthly+ |
| Lead Time | <1 hour | <1 day | <1 week | >1 week |
| MTTR | <1 hour | <1 day | <1 week | >1 week |
| Change Failure Rate | <5% | 5-10% | 10-15% | >15% |

---

## Velocity Tracking

### Velocity Calculation

```
Velocity = Story Points Completed / Time Period

Rolling Average (recommended):
  velocity_avg = (v_current * 0.4) + (v_prev1 * 0.3) + (v_prev2 * 0.2) + (v_prev3 * 0.1)
```

### Velocity Sources

**From GitHub:**
- Closed issues with size labels
- Merged PRs with story points
- GitHub Projects v2 custom fields

**From contextd:**
- Historical velocity records
- Pattern trends over time

### Forecasting

```
Remaining Work = Sum of story points in backlog
Predicted Completion = Remaining Work / Velocity Average

Example:
  Backlog: 45 story points
  Velocity: 15 points/week
  Forecast: 3 weeks to completion

  With 80% confidence interval:
    Best case: 2.4 weeks (velocity + 25%)
    Worst case: 4.5 weeks (velocity - 33%)
```

### Velocity Display

```
Velocity Trend (Last 4 Weeks):
  Week -3: ########---- 12 pts
  Week -2: ##########-- 15 pts
  Week -1: #######----- 11 pts
  Current: #########--- 14 pts

  Average: 13 pts/week
  Trend: Stable (+/-15%)

  Backlog: 52 pts remaining
  Forecast: 4 weeks (3-5 week range)
```

---

## Cross-Project Intelligence

### Dependency Mapping

Automatically map dependencies across repositories:

```
Dependency Graph: fyrsmithlabs
+------------------+     +------------------+
|   marketplace    |---->|    contextd      |
|  (v1.6.0)        |     |  (v1.0.0)        |
+------------------+     +------------------+
         |                       |
         v                       v
+------------------+     +------------------+
|   fs-design      |     |   mcp-server     |
|  (v1.0.0)        |     |  (v0.9.0)        |
+------------------+     +------------------+

Legend:
  ---> Runtime dependency
  ...> Dev dependency
  !!!> Blocking dependency (needs action)
```

### Shared Component Impact Analysis

Detect when changes affect multiple projects:

**Detection triggers:**
- Shared library version changes
- API contract modifications
- Database schema changes
- Configuration format changes

**Impact report:**
```
SHARED COMPONENT ALERT: contextd MCP types v1.3.0
  Affected repositories:
    - marketplace (uses v1.2.0) - UPDATE NEEDED
    - claude-code-plugin (uses v1.3.0) - Current
    - internal-tools (uses v1.1.0) - UPDATE NEEDED

  Breaking changes in v1.3.0:
    - memory_record signature changed
    - New required field: project_id
```

### Team Capacity Allocation

Track and recommend work distribution:

```
Team Capacity Overview:
  Total: 5 contributors active this week

  Allocation:
    marketplace:    3 contributors (60%)
    contextd:       2 contributors (40%)
    fs-design:      1 contributor  (20%)
                    ^ overlap detected

  Recommendations:
    - contextd has 2 HIGH priority items but limited capacity
    - Consider cross-training for fs-design (single point of failure)
```

---

## Enhanced Standup Features

### AI-Generated Blockers from Comments

Automatically extract blockers from issue/PR discussions:

```
BLOCKER ANALYSIS (AI-Generated):

PR #42 - Add OAuth2 login
  Explicit: None stated
  Detected from comments:
    - "Waiting on security review" (@alice, 2 days ago)
    - "Need API docs updated first" (@bob, 1 day ago)
  Confidence: HIGH
  Suggested action: Follow up with security team

Issue #38 - Performance regression
  Explicit: "blocked by #35"
  Detected from comments:
    - "Can't reproduce without staging access" (@carol, 3 days ago)
  Confidence: MEDIUM
  Suggested action: Provision staging access for @carol
```

### Automated PR Status Summary

Rich PR status with actionable insights:

```
PR STATUS SUMMARY:

Ready to Merge (2):
  #42 OAuth2 login - Approved 2 days ago, CI passing
       ^ STALE: Consider merging or comment on delay
  #45 Fix typo - Approved today, CI passing

In Review (3):
  #48 Add metrics dashboard - 1 approval, waiting on @alice
       Last activity: 4 hours ago
  #50 Refactor auth module - Changes requested by @bob
       ^ ACTION NEEDED: Address review comments
  #51 Update deps - No reviews yet (opened 1 hour ago)

Draft (1):
  #52 WIP: New feature - Draft, 15 commits
       Last push: 30 minutes ago
```

### Sprint Burndown Context

When using iterations/sprints:

```
Sprint Progress (if applicable):
+-----------------------------------------------+
| Sprint: 2026-W05 (Jan 27 - Feb 2)             |
+-----------------------------------------------+
| Day 2 of 5                                    |
|                                               |
| Planned: 34 pts  | Completed: 8 pts           |
| Remaining: 26 pts                             |
|                                               |
| Burndown:                                     |
|   Ideal:  ##########################          |
|   Actual: ####----------------------          |
|                                               |
| Status: BEHIND (ideal: 13.6 pts)              |
| Risk: HIGH - May not complete sprint goal     |
|                                               |
| Recommendations:                              |
|   - Reduce scope: Consider moving #48 to next |
|   - Focus: Complete #42 today (ready to merge)|
+-----------------------------------------------+
```

---

## External Integrations

### Slack/Teams Notification Patterns

Send standup summaries to team channels:

**Slack Webhook Format:**
```json
{
  "channel": "#dev-standup",
  "username": "Product Owner Bot",
  "icon_emoji": ":clipboard:",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Daily Standup: marketplace"
      }
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*CRITICAL:* 0"},
        {"type": "mrkdwn", "text": "*HIGH:* 2"},
        {"type": "mrkdwn", "text": "*PRs Ready:* 2"},
        {"type": "mrkdwn", "text": "*Blockers:* 1"}
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Top Recommendation:* Merge PR #42 (approved, waiting 2 days)"
      }
    }
  ]
}
```

**Teams Adaptive Card:**
```json
{
  "type": "AdaptiveCard",
  "body": [
    {
      "type": "TextBlock",
      "size": "Large",
      "weight": "Bolder",
      "text": "Daily Standup: marketplace"
    },
    {
      "type": "ColumnSet",
      "columns": [
        {"type": "Column", "items": [{"type": "TextBlock", "text": "CRITICAL: 0"}]},
        {"type": "Column", "items": [{"type": "TextBlock", "text": "HIGH: 2"}]}
      ]
    }
  ]
}
```

### Jira Bridge for Hybrid Teams

Map between GitHub Issues and Jira:

**Jira Field Mapping:**
| GitHub | Jira |
|--------|------|
| `priority:critical` | Priority: Highest |
| `priority:high` | Priority: High |
| `size:XL` | Story Points: 13 |
| Issue labels | Jira labels |
| Milestone | Fix Version |

**Sync Pattern:**
```
# Query Jira for linked issues
jira_issues = jira.search("project = PROJ AND 'GitHub Issue' is not EMPTY")

# Correlate with GitHub
for issue in jira_issues:
  gh_ref = issue.customfield_github
  gh_issue = github.get_issue(gh_ref)

  # Sync status
  if gh_issue.state == "closed" and issue.status != "Done":
    notify("Jira issue out of sync with GitHub")
```

**Hybrid Standup Report:**
```
Cross-Platform Status:
  GitHub Issues: 12 open (3 HIGH)
  Jira Tickets: 8 open (2 HIGH)
  Synced: 5 issues linked

  Discrepancies:
    - PROJ-123 (Jira: In Progress) != #45 (GitHub: Closed)
      ^ ACTION: Update Jira status
```

---

## contextd Decision Tracking

### Recording Prioritization Decisions

Track why items were prioritized:

```
mcp__contextd__memory_record(
  project_id: "fyrsmithlabs/marketplace",
  title: "Prioritization decision: OAuth2 over metrics",
  content: |
    Context: Both OAuth2 (#42) and metrics (#48) were HIGH priority
    Decision: Prioritized OAuth2 first
    Reasoning:
      - WSJF: OAuth2 (4.2) > metrics (3.8)
      - Security benefit from OAuth2
      - External deadline for OAuth2 (partner launch)
    Expected outcome: OAuth2 merged by EOD
  outcome: "pending",
  tags: ["standup", "prioritization", "decision"]
)
```

### Tracking Decision Accuracy

Measure prioritization quality over time:

```
mcp__contextd__memory_outcome(
  memory_id: "<decision_memory_id>",
  outcome: "success",
  notes: "OAuth2 merged on time, partner launch successful"
)
```

**Accuracy Report:**
```
Prioritization Accuracy (Last 30 days):
  Total decisions tracked: 24
  Correct predictions: 19 (79%)

  Patterns:
    - Security items: 95% accuracy (prioritize well)
    - Time estimates: 65% accuracy (often underestimate)
    - Blocker detection: 72% accuracy (improve detection)

  Recommendations:
    - Add 20% buffer to time estimates
    - More aggressive blocker follow-up
```

### Searching Past Standup Context

Find relevant historical context:

```
mcp__contextd__memory_search(
  query: "OAuth implementation blockers",
  tags: ["standup", "blocker"],
  limit: 5
)

Results:
  1. "Blocker: OAuth2 waiting on security review" (2 days ago)
     Resolution: Escalated to security lead, resolved in 4 hours

  2. "Blocker: OAuth2 library compatibility" (1 week ago)
     Resolution: Downgraded to v2.1.0, documented in ADR
```

---

## Priority Classification

### CRITICAL (Immediate Attention)

Items requiring immediate attention. Stop current work if needed.

**Criteria:**
- Security vulnerabilities (label: `security`, `vulnerability`)
- Failing CI on main/production branches
- PRs blocked >24h with no activity
- Production incidents or outages
- Data integrity issues
- Risk score >= 80

**Action:** Address before anything else.

### HIGH (Today's Focus)

Primary work items for the current session.

**Criteria:**
- PRs approved and ready to merge
- Issues with `priority:high` or `priority:critical` label
- Items explicitly marked for today in last checkpoint
- Carried over items from previous standup
- Time-sensitive deliverables
- WSJF score in top quartile
- Risk score 60-79

**Action:** Complete these during current session.

### DEPENDENCY ALERT (Cross-Project)

Items with cross-repository dependencies.

**Detection patterns in issue/PR bodies:**
```
- "blocked by <repo>#<number>"
- "depends on <repo>"
- "waiting for <repo>"
- "upstream: <repo>"
- References to other fyrsmithlabs repos
```

**Semantic detection:**
- Shared file modifications across repos
- API contract consumers
- Shared library version conflicts

**Action:** Flag prominently, include in cross-project view.

### MEDIUM (This Week)

Important but not urgent items.

**Criteria:**
- PRs in active review
- Issues with `priority:medium` or no priority label
- Planned work mentioned in checkpoints
- Technical debt items
- Risk score 40-59

**Action:** Work on after HIGH items complete.

### CARRIED OVER (Tracking)

Items from previous sessions not yet completed.

**Detection:**
- Compare current checkpoint to previous
- Items mentioned but not closed
- Stale branches (>24h without PR)

**Action:** Review whether still relevant, re-prioritize or close.

## Standup Report Format

### Standard Report

```
+-------------------------------------------------------------+
| Daily Standup: <owner>/<repo>                               |
| <date> at <time>                                            |
+-------------------------------------------------------------+

Yesterday:
  - <accomplishments from last checkpoint>
  - <velocity: n issues closed, m PRs merged>

CRITICAL (<count>):
  * <item> - <status/reason> [Risk: <score>]

HIGH (<count>):
  * <item> - <status> [WSJF: <score>]

DEPENDENCY ALERT:
  ! <description of cross-project dependency>

MEDIUM (<count>):
  * <item> - <status>

CARRIED OVER from yesterday:
  * <item> - <reason still open>

AI-Detected Blockers:
  * <blocker from comment analysis>

Recommendations:
  1. <actionable next step>
  2. <actionable next step>
  3. <actionable next step>

-------------------------------------------------------------
```

### Metrics Report (--metrics flag)

```
+-------------------------------------------------------------+
| Daily Standup: <owner>/<repo>                               |
| <date> at <time>                                            |
+-------------------------------------------------------------+

[Standard report sections...]

DORA Metrics (30-day rolling):
  Deploy Frequency:   2.3/day  [Elite]
  Lead Time:          4.2 hrs  [High]
  MTTR:               1.1 hrs  [Elite]
  Change Failure:     8%       [High]

  Trend: Improving (+12% vs last period)

Velocity:
  This week: 14 pts (target: 15)
  Rolling avg: 13 pts/week
  Backlog: 52 pts | Forecast: 4 weeks

-------------------------------------------------------------
```

### Brief Report (for scripting)

```
[<repo>] CRIT:<n> HIGH:<m> MED:<k> | PRs:<open>,<ready> | Blocked: <description> | DORA: <performance_tier>
```

### Platform Report (cross-project)

```
+-------------------------------------------------------------+
| Platform Standup: fyrsmithlabs                              |
| <date> at <time>                                            |
+-------------------------------------------------------------+

Cross-Project Dependencies:
  ! <repo> -> <repo>: <description>
  OK <repo> -> <repo>: No blockers

Dependency Graph:
  marketplace --> contextd --> mcp-server
       |
       v
  fs-design

Shared Component Alerts:
  * contextd types v1.3.0 needs update in marketplace

Project Summaries:
  [<repo>] CRIT:<n> HIGH:<m> MED:<k> | Focus: <summary>

Team Capacity:
  marketplace: 3 active | contextd: 2 active

Recommended Focus Order:
  1. <repo> - <reason>
  2. <repo> - <reason>

-------------------------------------------------------------
```

## Cross-Project Discovery

### Finding fyrsmithlabs Repos

Priority order for discovering repos:

1. **Config file** (if exists):
   ```
   ~/.fyrsmithlabs/repos.json
   {
     "repos": [
       "fyrsmithlabs/contextd",
       "fyrsmithlabs/marketplace"
     ]
   }
   ```

2. **Local directory scan:**
   ```bash
   ls ~/projects/fyrsmithlabs/
   ```

3. **GitHub org query:**
   ```
   mcp__MCP_DOCKER__search_repositories(
     query: "org:fyrsmithlabs"
   )
   ```

### Dependency Detection

Scan issue/PR content for patterns:

```regex
# Cross-repo references
fyrsmithlabs/\w+#\d+
blocked by .+#\d+
depends on .+
waiting for .+
upstream: .+
```

## contextd Integration

### Checkpoint Schema

Store standup state for next session:

```yaml
checkpoint:
  name: "standup-YYYY-MM-DD"
  summary: "CRIT:0 HIGH:2 MED:5. Focus: Complete auth PR"
  context: |
    PRs: #42 (auth, ready), #38 (hooks, in review)
    Issues: #15 (high), #20 (medium), #22 (medium)
    Blockers: contextd v1.3 release
    DORA: Elite (2.3 deploys/day)
    Velocity: 14 pts this week
  full_state: |
    <complete standup output for comparison>
```

### Memory Recording

Record notable events:

**Persistent blockers:**
```
mcp__contextd__memory_record(
  project_id: "<project>",
  title: "Persistent blocker: <description>",
  content: "Blocked on <item> for <n> days. First seen: <date>",
  outcome: "failure",
  tags: ["standup", "blocker", "persistent"]
)
```

**Velocity patterns:**
```
mcp__contextd__memory_record(
  project_id: "<project>",
  title: "Velocity trend: <direction>",
  content: "Closed <n> issues this week vs <m> last week",
  outcome: "success",
  tags: ["standup", "velocity"]
)
```

**Prioritization decisions:**
```
mcp__contextd__memory_record(
  project_id: "<project>",
  title: "Prioritization: <item_a> over <item_b>",
  content: "WSJF scores: <a>=<score>, <b>=<score>. Chose <a> because <reason>",
  outcome: "pending",
  tags: ["standup", "prioritization", "decision"]
)
```

## Stale Work Detection

### Stale PRs

**Criteria:**
- Open >48h with no review activity
- Approved but not merged >24h
- Changes requested but no updates >48h

**Action:** Flag in CARRIED OVER, suggest follow-up.

### Stale Branches

**Criteria:**
- Branch exists with commits not on main
- No open PR associated
- Last commit >24h ago

**Action:** Prompt to create PR or delete branch.

### Stale Issues

**Criteria:**
- Assigned but no activity >7 days
- In progress label but no linked PR

**Action:** Flag in MEDIUM, suggest status update.

## Error Handling

| Scenario | Handling |
|----------|----------|
| GitHub API unavailable | Use cached data from last checkpoint |
| No Git remote | Skip GitHub, show contextd-only standup |
| First standup (no checkpoint) | Show current state, note "first standup" |
| Empty repo (no issues/PRs) | Prompt "Clean slate - what's the first task?" |
| Rate limited | Graceful degradation with warning |
| DORA data insufficient | Show "Insufficient data" for affected metrics |
| Jira sync fails | Continue with GitHub-only data, warn user |

## Mandatory Checklist

Every standup MUST complete:

- [ ] Load contextd checkpoint (or note first standup)
- [ ] Query GitHub PRs and issues
- [ ] Detect cross-project dependencies
- [ ] Calculate WSJF scores for HIGH items
- [ ] Run AI blocker detection on comments
- [ ] Classify items by priority with risk scores
- [ ] Generate recommendations
- [ ] Save checkpoint for next standup
- [ ] Record blockers to memory (if any)
- [ ] Record prioritization decisions (for accuracy tracking)

## Red Flags - STOP and Reconsider

| Thought | Reality |
|---------|---------|
| "Skip checkpoint - not important" | Checkpoint enables tomorrow's comparison |
| "No need to check dependencies" | Cross-project blockers are often invisible |
| "Just show raw GitHub data" | Synthesis and prioritization is the value |
| "CRITICAL for everything" | Overuse dilutes urgency |
| "Skip contextd - just use GitHub" | Memory provides continuity across sessions |
| "Ignore WSJF - trust gut" | Data-driven decisions reduce bias |
| "Skip blocker detection" | AI catches what humans miss in comments |
| "DORA metrics are overhead" | Metrics drive continuous improvement |

## Attribution

Original research synthesized from:
- Digital Scrum Master patterns (episodic memory)
- CrewAI role-based agents (structured autonomy)
- GitHub Copilot Agent (native integration)
- fyrsmithlabs contextd (cross-session memory)
- Accelerate book (DORA metrics)
- SAFe framework (WSJF prioritization)

See CREDITS.md for full attribution.
