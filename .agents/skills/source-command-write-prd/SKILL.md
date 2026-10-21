---
name: "source-command-write-prd"
description: "Create a decision-ready PRD by chaining problem framing, requirements definition, and story scaffolding."
---

# source-command-write-prd

Use this skill when the user asks to run the migrated source command `write-prd`.

## Command Template

# /write-prd

Generate a PRD that moves smoothly from strategy to delivery.

## Invocation

```text
/write-prd Team inbox redesign for faster triage in customer support
```

## Workflow

1. Define the problem context with `problem-statement`.
2. Align user assumptions with `proto-persona`.
3. Build the full document using `prd-development`.
4. Draft initial stories with `user-story`.
5. Split larger items with `user-story-splitting`.

## Checkpoints

- Validate scope boundaries before writing requirements.
- Keep success criteria measurable and tied to outcome metrics.
- Ensure at least one anti-pattern is called out in risks.

## Next Steps

- Run `/plan-roadmap` to sequence delivery.
- Run `/prioritize` if scope exceeds current capacity.
