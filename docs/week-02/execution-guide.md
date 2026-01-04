# Week 2 Execution Guide

This document provides a step-by-step guide for running the model topography tests efficiently and consistently.

## 1) Run the tests with a strict, identical response format

When you run each task (T1–T6) in ChatGPT, Claude, and Gemini (AI Studio), prepend this **Output Contract** (copy/paste once per model session):

### Output Contract (prepend once per model session)

* Do not ask clarifying questions.
* Follow the structure exactly.
* Use concise bullets.
* If you cannot verify a factual claim, label it `VERIFY`.

### Required output schema

1. Assumptions (0–3 bullets)
2. Answer (structured)
3. Checklist (actionable)
4. Risks / gotchas
5. Confidence (0–100) and why

This forces consistent outputs and makes scoring much faster.

---

## 2) Execution order and timing (2 hours, low friction)

### 0:00–0:10 — Setup

* Open `prompts/week-02/test-suite.md` and `artifacts/week-02/results.md` side by side.
* Decide a naming convention:
  * ChatGPT = "GPT"
  * Claude = "CL"
  * Gemini = "GEM"

### 0:10–0:55 — Run T1–T3 across all three models

Do not score yet. Just capture.

### 0:55–1:35 — Run T4–T6 across all three models

Again, just capture.

### 1:35–2:00 — Score + synthesize

* Score each output 1–5 in your rubric categories
* Fill `docs/week-02/comparison-table.md`
* Write your initial rules of thumb at the bottom of `artifacts/week-02/results.md`

---

## 3) Where to capture outputs (so it stays clean)

Use `artifacts/week-02/results.md` like this:

* Paste each model's output under the task header
* Immediately add a short "Evaluator notes" section with 3 bullets:
  * Best point
  * Worst point
  * Any hallucination / incorrectness

This prevents "I'll score later" drift.

---

## 4) Scoring guidance (to avoid vibes)

Use these two tie-breakers whenever scores feel subjective:

* **Correctness beats completeness.** A smaller correct answer wins.
* **Operational usefulness beats eloquence.** If it gives you steps you can run, it wins.

---

## 5) Close Week 2 with a reusable "default workflow"

When you finish, add one final section to `docs/week-02/README.md`:

### Default workflow for Weeks 3–10

* Planning model:
* Drafting model:
* Coding model:
* Cross-check model:
* When to use Gemini/AI Studio:

This becomes your Week 9 "context doc" seed.

---

## Quick Reference: Scoring Rubric Categories

Score each model output 1–5 per category (5 = best):

1. **Correctness** (facts, logic, no hallucination)
2. **Completeness** (covers requirements)
3. **Clarity** (readable, structured, actionable)
4. **Follow-instructions** (matches constraints exactly)
5. **Efficiency** (minimal fluff, good prioritization)
6. **Safety/Security** (no risky guidance; sane defaults)
7. **Code Quality** (if code is involved: compiles, idiomatic, maintainable)

---

## Notes

* Record failures and "gotchas" explicitly.
* Prefer concrete examples over opinions.
* If you paste just **one** completed task set (e.g., T4 from all three models) into the chat, you can get:
  * scored output using your rubric,
  * calibrated scores,
  * and a first-pass "rules of thumb" you can reuse for the remaining tasks.

