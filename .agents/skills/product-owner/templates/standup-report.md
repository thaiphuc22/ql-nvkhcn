# Standup Report Template

Use this template for generating standup reports. Replace placeholders with actual data.

## Standard Report

```
┌─────────────────────────────────────────────────────────────┐
│ Daily Standup: {{owner}}/{{repo}}                           │
│ {{date}} at {{time}}                                        │
└─────────────────────────────────────────────────────────────┘

Yesterday:
{{#if lastCheckpoint}}
  - {{lastCheckpoint.summary}}
  - {{velocity.issuesClosed}} issues closed, {{velocity.prsMerged}} PRs merged
{{else}}
  - First standup for this project
{{/if}}

{{#if criticalItems.length}}
CRITICAL ({{criticalItems.length}}):
{{#each criticalItems}}
  • {{this.type}} #{{this.number}}: "{{this.title}}" - {{this.reason}}
{{/each}}
{{else}}
CRITICAL (0):
  (none - great!)
{{/if}}

{{#if highItems.length}}
HIGH ({{highItems.length}}):
{{#each highItems}}
  • {{this.type}} #{{this.number}}: "{{this.title}}" - {{this.status}}
{{/each}}
{{/if}}

{{#if dependencyAlerts.length}}
DEPENDENCY ALERT:
{{#each dependencyAlerts}}
  ⚠ [{{this.sourceRepo}}] {{this.description}}
{{/each}}
{{/if}}

{{#if mediumItems.length}}
MEDIUM ({{mediumItems.length}}):
{{#each mediumItems}}
  • {{this.type}} #{{this.number}}: "{{this.title}}" - {{this.status}}
{{/each}}
{{/if}}

{{#if carriedOver.length}}
CARRIED OVER from yesterday:
{{#each carriedOver}}
  • {{this.description}} ({{this.reason}})
{{/each}}
{{/if}}

{{#if recommendations.length}}
Recommendations:
{{#each recommendations}}
  {{@index}}. {{this}}
{{/each}}
{{/if}}

───────────────────────────────────────────────────────────────
```

## Brief Report

For scripting and aggregation:

```
[{{repo}}] CRIT:{{counts.critical}} HIGH:{{counts.high}} MED:{{counts.medium}} | PRs:{{prs.open}},{{prs.ready}} | {{#if blockers}}Blocked: {{blockers}}{{else}}No blockers{{/if}}
```

## Platform Report

For cross-project standup:

```
┌─────────────────────────────────────────────────────────────┐
│ Platform Standup: {{org}}                                   │
│ {{date}} at {{time}}                                        │
└─────────────────────────────────────────────────────────────┘

Cross-Project Dependencies:
{{#each dependencies}}
  {{#if this.blocked}}⚠{{else}}✓{{/if}} {{this.from}} → {{this.to}}: {{this.description}}
{{/each}}

Project Summaries:
{{#each projects}}
  [{{this.name}}] CRIT:{{this.critical}} HIGH:{{this.high}} MED:{{this.medium}} | Focus: {{this.focus}}
{{/each}}

Recommended Focus Order:
{{#each focusOrder}}
  {{@index}}. {{this.repo}} - {{this.reason}}
{{/each}}

───────────────────────────────────────────────────────────────
```

## Data Structure Reference

```typescript
interface StandupData {
  owner: string;
  repo: string;
  date: string;
  time: string;

  lastCheckpoint?: {
    summary: string;
    date: string;
  };

  velocity: {
    issuesClosed: number;
    prsMerged: number;
  };

  criticalItems: Array<{
    type: 'PR' | 'Issue';
    number: number;
    title: string;
    reason: string;
  }>;

  highItems: Array<{
    type: 'PR' | 'Issue';
    number: number;
    title: string;
    status: string;
  }>;

  dependencyAlerts: Array<{
    sourceRepo: string;
    targetRepo: string;
    description: string;
  }>;

  mediumItems: Array<{
    type: 'PR' | 'Issue';
    number: number;
    title: string;
    status: string;
  }>;

  carriedOver: Array<{
    description: string;
    reason: string;
  }>;

  recommendations: string[];

  counts: {
    critical: number;
    high: number;
    medium: number;
  };

  prs: {
    open: number;
    ready: number;
  };

  blockers?: string;
}
```
