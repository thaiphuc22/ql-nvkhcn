# Harness–Skill Boundary

Defines the boundary between the **harness** (the delivery process under `.harness/`) and **skills** (capabilities under `.claude/skills/`). Its purpose is to prevent the two from doing the same work twice and to make every newly loaded skill classify itself automatically.

Read this whenever a harness role's work overlaps with a skill, or when a new skill is added to the project.

---

## The Governing Law

> **A skill may *produce, self-validate, and return*. A skill may NOT decide *when it runs*, *whether its output is accepted*, or *write to harness state*. Those three are the harness's exclusive authority.**

Restated as ownership:

| Concern | Owner | Why |
|---|---|---|
| **WHEN** a capability runs (phase/sequence) | Harness (Loop) | The rail decides order; a capability cannot self-schedule |
| **WHO** is allowed to act / approve | Harness (Authority) | Gates and roles are partitioned in the harness, not in skills |
| **WHETHER** an output is accepted | Harness (Governance) | Acceptance is a gate; a skill self-check is not an approval |
| **HOW** the work is produced | Skill | The packaged capability — reasoning pipeline + validators |

Every overlap is a violation of one of these lines. The fix is always to pull the work back to its correct owner.

---

## Skill Classification (apply to every skill, including ones loaded later)

Every skill falls into exactly one of three buckets. Classify by what the skill *tries to do*, then apply that bucket's rule.

### Bucket 1 — Capability (pure producer)

**Examples:** `skill-ac-generator`, `skill-user-story-generator`, `skill-br-extractor`, `skill-requirement-extractor`, `skill-traceability-builder`, `ba-doc-write`, `ba-doc-review`, and all analytical PM skills (`prioritize`, `prd-development`, `tam-sam-som-calculator`, …).

**Rule:** No overlap. The matching harness role **delegates** the production step to the skill, then performs the harness-only parts (gate, escalate, write state). The skill never reads `.harness/state/` and never decides phase or approval.

### Bucket 2 — Router (dispatcher)

**Examples:** `babok-assistant`.

**Rule:** Subordinate to the harness Loop. A router may dispatch **within a single phase** only. It must never own project flow or move work across phases. The harness calls the router; the router never drives the harness.

### Bucket 3 — Tracker (status synthesizer)

**Examples:** `product-owner` (/standup, WSJF, DORA).

**Rule:** The Delivery Manager remains the **single source of truth** for `.harness/state/`. A tracker skill is an analytical engine the Delivery Manager may *invoke*; its output flows into harness state. It never publishes status as a parallel authority.

### Classification decision procedure

```
Does the skill try to decide WHEN work runs or move it across phases?
  → YES: Router (Bucket 2). Subordinate to Loop; intra-phase only.
Does the skill try to publish project/delivery status as truth?
  → YES: Tracker (Bucket 3). Feeds the Delivery Manager; never parallel truth.
Otherwise (it only produces an artifact and returns):
  → Capability (Bucket 1). A role delegates to it.
```

---

## Upstream vs in-loop skills

- **Upstream (pre-harness):** strategy, discovery, prioritization, roadmap, PRD skills decide *what to build*. Their output is the **input to Phase 1**. They do not conflict with the harness — they feed it.
- **In-loop (at the seam):** the BA cluster *is* Phase 1 (Requirements). This is the only place a capability skill sits directly on a harness phase, so it is where delegation discipline matters most.

---

## Documents are Capability output too

The documentation system (`docs/requirements/` — BRD, PRD, SRS, RTM, and the
`00-document-guide.md` that governs them) is **Bucket-1 Capability**: it *produces*
specs and self-validates their completeness. It does not own delivery authority.

Split the word "ready":

| Question | Owner |
|---|---|
| Is the spec **complete / buildable**? (DoR: AC + data + API + UI) | **Document** — self-asserted, like a skill validator |
| Is the spec **approved to build**, or is the feature **done**? | **Harness** — `DELIVERY_STATE.md` + `decisions.md` + human gate |

A document may state its own completeness. It must NOT assert delivery / approval /
done status as independent truth — that lives in `DELIVERY_STATE.md`. Documents
reference that state; they never duplicate it. (Mirror of the babok↔harness rule:
a producer never owns WHETHER.)

---

## Delegation Contract (how a role calls a skill)

A harness role with a skill twin must follow these six steps. Step 3 is the skill; steps 1, 2, 4, 5, 6 are the harness. The boundary lives exactly here.

```
1. WHEN   — the Loop confirms this role's phase is active (e.g. Phase 1)
2. WHO    — check authority: is this role allowed to act? (Not Allowed list)
3. CALL   — delegate production to the skill (input contract → validated output)
4. GATE   — apply the harness gate to the skill output (testable? human approval needed?)
5. STATE  — serialize the skill's JSON output into a harness artifact
6. SIGNAL — update DELIVERY_STATE.md + active-task.md; escalate to human if required
```

A role must not re-implement step 3 in prose if a Bucket-1 skill already covers it.

Roles **without** a skill twin (Solution Architect, Backend, Frontend, QA, DevOps, Tech Lead Reviewer) act directly — there is nothing to delegate.

---

## Orchestration Authority Tree

```
HARNESS LOOP  (root — owns phases, gates, state)
   ├─ Phase 1 calls → babok-assistant (router, BA scope only)
   │                     └─ dispatches → ba-doc-write / ac-gen / story-gen / …
   └─ Delivery Manager calls → product-owner (analytics engine; returns numbers to DM)
```

**Locked rule:** Only the harness Loop may move work across phases. Any router skill orchestrates *within* one phase and never across phases.

---

## Trace Seam (JSON → harness state)

Skills emit structured JSON; harness state is markdown. To compose them, the calling role serializes skill output into the matching harness artifact at step 5:

| Skill output | Harness artifact it lands in |
|---|---|
| `skill-ac-generator` → AC JSON | acceptance criteria block in `templates/feature-plan.md` instance |
| `skill-user-story-generator` → stories | user-story section of the feature plan |
| `skill-traceability-builder` → RTM | the project RTM file (`docs/requirements/RTM.md`) |
| `product-owner` → WSJF/DORA numbers | `DELIVERY_STATE.md` (Delivery Manager writes) |

The role owns the serialization. The skill never writes the file itself.

---

## Quick Test

Before a role does any production work, ask: *"Is there a Bucket-1 skill that already does this?"*
- **Yes** → delegate (step 3), then do steps 4–6. Do not hand-write the artifact.
- **No** → act directly.

Before a skill does anything, it must assume it has **no authority over WHEN / WHO / WHETHER**. If it appears to need that authority, it is misclassified — re-run the decision procedure.
