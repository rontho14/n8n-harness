---
name: refinar-specs
description: >-
  One question at a time with a recommended answer; updates specs/<slug>/ on disk
  as decisions land. Keeps TRUTH.md business-only. Use to grill an n8n workflow plan
  against conventions and existing specs before or after planning.
  Aliases: refinar-specs.
---

# Refinar specs (n8n)

Interactive refinement session for workflow specifications. Adapted for n8n: triggers, payloads, credentials, idempotency, and error paths — not application UI code.

## When to use

User wants to stress-test or clarify a plan in `specs/<slug>/` before approving `VALIDATION.md`, or to resolve ambiguities found during verify rejects.

## Protocol

1. **One question at a time** — wait for the user’s answer before the next question.
2. **Recommend an answer** with each question (your best default).
3. **Explore before asking** — read `specs/<slug>/`, `workflows/`, `docs/best-practices.md`, and related specs; prefer docs/code over guessing.
4. **Update files immediately** when a decision is made — do not batch updates to the end.

## Where decisions go

| Decision type | File |
|---------------|------|
| Business rules, acceptance, scope | `TRUTH.md` |
| Graph, retries, error workflow, node responsibilities | `ARCHITECTURE.md` |
| APIs, auth names, URLs, credential setup steps | `INTEGRATION.md` |
| Message copy, templates, labels | `DESIGN.md` |
| Build readiness gaps | `VALIDATION.md` open items |

**TRUTH.md must stay free of implementation detail** (no node types, no HTTP methods, no credential IDs).

## Question themes

- Trigger: who sends what, and when is a duplicate a no-op?
- Error workflow: which global handler applies, or why is local Error Trigger justified?
- Sub-workflows: should this be reusable (strict I/O)? Which existing reusable fits (e.g. user profile by email)?
- Naming: can each node name be read as a sentence (`Does user have email?`)?
- Failure: what happens if a downstream (Slack, directory API) is down?
- Credentials: exact **names** in n8n dev vs prod; who creates them?
- Idempotency: duplicate events — one side effect or many?
- Reusable governance: who may edit a shared workflow vs view-only?
- Non-goals: what similar automations are explicitly out of scope?

## Terminology

If the user’s words conflict with `TRUTH.md` or `ARCHITECTURE.md`, call it out: define the canonical term and update the spec.

## Forbidden

- Editing `workflows/*.json` (that is **`n8n-build`**).
- Multiple questions in one message.
- Implementing or deploying to n8n.

## After the session

Remind the user to clear remaining **Open items** and set **Approval** in `VALIDATION.md` before **`n8n-build`**.
