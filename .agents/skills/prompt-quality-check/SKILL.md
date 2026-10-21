---
name: prompt-quality-check
description: >-
  Measure the quality of user prompts in a conversation against four dimensions
  (lazy prompting, repeated prompts, verbose-no-compression, low-constraint usage)
  using the thresholds from microsoft/AI-Engineering-Coach. Use when asked to
  "đánh giá chất lượng prompt", "đo lường prompt", "chấm điểm prompt", "review my
  prompts", "prompt quality check", or to evaluate how well someone is prompting
  across a chat excerpt. Works on the current conversation or a pasted excerpt.
type: analytical
theme: ai-collaboration
---

# Prompt Quality Check

A repeatable, manual application of the **prompt-quality** anti-patterns from
[microsoft/AI-Engineering-Coach](https://github.com/microsoft/AI-Engineering-Coach) (MIT).
It pairs with the prose standard in
[`.harness/rules/ai-collaboration-hygiene.md`](../../../.harness/rules/ai-collaboration-hygiene.md)
— that file is the *why*; this skill is the *measure*.

This is a lightweight evaluator, **not** the Coach's automated scorer (that lives in their VS Code
extension). It applies the same four dimensions and thresholds by hand to a conversation.

## Input

- **Default:** the user messages in the current conversation.
- **Or:** a pasted excerpt (a list of user turns). Evaluate only *user* turns, not assistant turns.

## The four dimensions (with Coach thresholds)

| # | Dimension | Per-message flag | Aggregate trigger (large sample) |
|---|---|---|---|
| 1 | **Lazy prompting** | `0 < length < 30` chars | flagged ratio > 0.30 AND count > 10 |
| 2 | **Repeated prompts** | near-duplicate of another turn | ≥ 3 near-duplicates |
| 3 | **Verbose, no compression** | `length ≥ 800` chars AND ≥ 2 filler words | flagged ratio > 0.20 AND count > 15 |
| 4 | **Low-constraint usage** | `length ≥ 40` chars AND no constraint keyword | > 92% of substantial turns lack constraints (needs ≥ 30 turns) |

### Keyword lists (judge **semantically**, not just by regex — especially for non-English)

- **Constraint cues** — EN: `do not, don't, must not, never, without, avoid, only, strictly,
  limit to, at most, at least, no more than, require, restrict, exclude, ensure, must, shall,
  should not`. VI: `không được, đừng, phải, chỉ, tránh, không quá, tối đa, tối thiểu, bắt buộc,
  loại trừ, giới hạn, đảm bảo, không nên`.
- **Filler words** — EN: `please, kindly, thanks, basically, essentially, definitely, absolutely,
  simply, very, quite, somewhat, certainly, actually, literally`. VI: `làm ơn, vui lòng, cảm ơn,
  về cơ bản, thực sự, rất, khá, chắc chắn, đơn giản là`.

## Procedure

1. **Collect** the user turns in order; measure each turn's character length.
2. **Flag per dimension** using the per-message rules above.
3. **Apply the follow-up caveat (important):** a short turn (dim 1) is **not** lazy if it is a
   follow-up with a clear referent in context (e.g. "commit that to main", "yes, do option A").
   Pure length over-flags follow-ups; note these as *clean (follow-up)*, not lazy.
4. **Apply the small-sample caveat (important):** the aggregate triggers were tuned for large
   logs (minSample 10–30). A single chat is almost always below sample. So **report per-message
   flags + a qualitative read**, and only state an aggregate verdict as *advisory*, never as a
   fired rule, unless the sample genuinely meets the minSample.
5. **For non-English prompts**, detect constraints/filler by meaning using the VI cues above (or
   the target language), not the English regex alone.

## Output format

Produce a compact report:

```
## Prompt Quality Check — <scope>

| # | Prompt (truncated) | Chars | Flags |
|---|---|---|---|
| 1 | ...                | 65    | ✅ clean |
| 7 | ...                | 47    | ⚠️ low-constraint |
| 8 | ...                | 27    | ✅ clean (follow-up) |

**By dimension**
- Lazy prompting: <count>/<n> turns flagged (advisory — sample < 10)
- Repeated prompts: <none | list>
- Verbose-no-compression: <none | list>
- Low-constraint usage: <count>/<n> substantial turns lack constraints

**Verdict:** <one-line overall read>
**Top tip:** <the single most useful, concrete suggestion>
```

Keep it honest: if prompts are good, say so plainly. Give **one** concrete tip, not a lecture.

## Notes

- Scope is **prompt quality only** (Coach's `prompt-quality` group). It does not assess session
  hygiene, tool use, or context management — those are other sections of
  [`ai-collaboration-hygiene.md`](../../../.harness/rules/ai-collaboration-hygiene.md).
- This is a **first-party** harness skill (not part of the third-party PM/BA library) — no
  external license attaches; the thresholds are facts borrowed from the MIT-licensed Coach repo.
