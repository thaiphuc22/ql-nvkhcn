# Skills Map

There are ~58 skills here. **You are not meant to learn them all.** Pick the bucket that
matches your task — and in most buckets there is a **slash command** that already chains the
right skills for you, so you rarely call a skill by name.

> **Fast rule:** start from a slash command (the `/…` entries below). Drop to an individual
> skill only when you want one specific step, not the whole flow.

---

## 🧭 If you only read one thing

| Your task right now | Go here |
|---|---|
| "I have a vague problem / opportunity" | `/discover` → **Discovery & Research** |
| "I need to decide direction / positioning" | `/strategy` → **Strategy & Positioning** |
| "I have too many things to build" | `/prioritize`, `/plan-roadmap` → **Prioritization & Roadmap** |
| "I need a PRD / user stories to build from" | `/write-prd` → **Specs & Stories** |
| "I'm a BA writing/reviewing requirements docs" | **Business Analysis (BABOK)** |
| "I need to measure the business" | **Metrics & Business Health** |
| "How well am I prompting the agent?" | `prompt-quality-check` → **First-party harness skills** |

---

## 1. Discovery & Research — *understand the problem before solving*
**Entry command:** `/discover`

`problem-framing-canvas` · `problem-statement` · `jobs-to-be-done` · `discovery-process` ·
`discovery-interview-prep` · `opportunity-solution-tree` · `customer-journey-map` ·
`customer-journey-mapping-workshop` · `proto-persona` · `company-research` · `pestel-analysis` ·
`lean-ux-canvas` · `pol-probe` · `pol-probe-advisor`

**Use when:** the problem, user, or market is still fuzzy and you need evidence before building.

## 2. Strategy & Positioning — *decide where to play*
**Entry command:** `/strategy`

`product-strategy-session` · `positioning-statement` · `positioning-workshop` ·
`tam-sam-som-calculator` · `recommendation-canvas` · `organic-growth-advisor` ·
`acquisition-channel-advisor` · `ai-shaped-readiness-advisor` · `context-engineering-advisor`

**Use when:** you know the problem and need a defensible direction, category, or growth path.

## 3. Prioritization & Roadmap — *decide what and when*
**Entry commands:** `/prioritize`, `/plan-roadmap`

`prioritization-advisor` · `feature-investment-advisor` · `roadmap-planning` ·
`epic-hypothesis` · `epic-breakdown-advisor` · `product-owner`

**Use when:** more candidates than capacity, or you need a sequenced release plan.

## 4. Specs & Stories — *turn decisions into buildable work*
**Entry command:** `/write-prd`

`prd-development` · `press-release` · `storyboard` · `user-story` · `user-story-mapping` ·
`user-story-mapping-workshop` · `user-story-splitting` · `skill-user-story-generator` ·
`skill-ac-generator`

**Use when:** direction is set and you need a PRD, story map, or testable stories for delivery.

## 5. Business Analysis (IIBA / BABOK) — *requirements engineering*
**Entry skill:** `babok-assistant` (router that sends you to the right one)

`babok-assistant` · `ba-doc-write` (BRD/FRD/SRS/Use Case) · `ba-doc-review` ·
`skill-requirement-extractor` · `skill-br-extractor` · `skill-traceability-builder` ·
`skill-user-story-generator` · `skill-ac-generator`

**Use when:** you are a BA producing or auditing formal requirements artifacts (often Vietnamese).

## 6. Metrics & Business Health — *measure*
`saas-revenue-growth-metrics` · `saas-economics-efficiency-metrics` · `finance-metrics-quickref` ·
`finance-based-pricing-advisor` · `business-health-diagnostic`

**Use when:** you need a number, a benchmark, or a health read on growth / unit economics / pricing.

## 7. Leadership, Comms & Meta — *career, messaging, and making more skills*
**Entry command:** `/leadership-transition`

`altitude-horizon-framework` · `director-readiness-advisor` · `vp-cpo-readiness-advisor` ·
`executive-onboarding-playbook` · `product-sense-interview-answer` · `eol-message` ·
`pm-skill-creator` · `skill-authoring-workflow` · `workshop-facilitation`

**Use when:** PM-to-leadership transitions, interview prep, EOL announcements, or authoring new skills.

---

## First-party harness skills

Distinct from the third-party PM/BA library above — these ship with the kit and carry no external
license. They are about **working with the agent itself**, not product management.

- [`prompt-quality-check`](prompt-quality-check/SKILL.md) — measure your prompt quality across a
  conversation against the 4 dimensions + thresholds from AI-Engineering-Coach. Pairs with
  [`.harness/rules/ai-collaboration-hygiene.md`](../../.harness/rules/ai-collaboration-hygiene.md).

---

## How this relates to the harness

These skills are **Layer 1 (PM/PO — "what do we build?")** — the on-ramp *before* the delivery
harness. Their output (a PRD, a prioritized backlog, stories) feeds Layer 2 delivery. See
[`.harness/GUIDE.md`](../../.harness/GUIDE.md) for how the two layers connect, and run
[`/harness-start`](../commands/harness-start.md) to set up a new project interactively.

> **Licensing:** these skills are third-party (see [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md)).
> The PM set is CC BY-NC-SA 4.0 (non-commercial). Review before commercial use.
