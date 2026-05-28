---
name: commit
description: >-
  Split staged and unstaged changes into logical, dependency-ordered commits
  grouped by harness phase (harness, specs, workflow JSON, deploy). Never add
  Cursor co-author trailers. Use when the user says /commit, "commit these
  changes", or "separate into commits".
---

# Commit

Split all pending changes into logical, dependency-ordered commits with short messages. Follow the user's git safety rules: never commit secrets, never amend unless explicitly allowed, never update git config.

**Never co-author with Cursor** — commits must attribute only the human author. Do not add `Co-authored-by` trailers (especially `Co-authored-by: Cursor <cursoragent@cursor.com>`). Use plain `git commit -m "message"` only; never `--trailer`, `-t`, or a multi-line message body for co-authors.

## Workflow

1. Run `git status` and `git diff --name-only HEAD` to list every changed file.
2. **Secret scan** — do not stage or commit:
   - `.env` (only `.env.example` is safe)
   - Files containing API keys, tokens, passwords, or credential payloads
   - Workflow JSON with embedded secret values (credential **names** only are OK)
3. Group files into phases (dependency order below). Read diffs when grouping is unclear.
4. Unstage everything if needed: `git reset HEAD` (or `git restore --staged .` on newer Git).
5. For each phase, in order:
   - Stage only that phase's files
   - Commit with a one-line message (under 60 characters)
6. Show `git log --oneline -n <count>` for the new commits.

On Windows PowerShell, use `git commit -m "message"` (no HEREDOC required). If a wrapper injects `--trailer` or co-author lines, override with an explicit `-m` only and no trailers.

## Phase order (n8n-harness)

Commit in this order when multiple areas changed:

| Order | Phase | Paths (typical) |
|-------|--------|-----------------|
| 1 | **Harness foundation** | `STRUCTURE.md`, root `README.md`, `.cursor/rules/` |
| 2 | **Harness tooling** | `scripts/`, `docs/` (conventions, rubric, best-practices, invoke-cheatsheet) |
| 3 | **Agent skills** | `.cursor/skills/<skill>/` — one commit per skill, or one for new skills batch |
| 4 | **Spec templates** | `specs/_templates/` |
| 5 | **Workflow specs (plan)** | `specs/<slug>/` — see intra-spec order below |
| 6 | **Workflow JSON (build)** | `workflows/<slug>.json` |
| 7 | **Deploy log** | `deployments/DEPLOYMENTS.md` |
| 8 | **Config / chore** | `.gitignore`, `.env.example`, formatting-only or unrelated cleanup |

### Intra-spec order (`specs/<slug>/`)

When a slug has multiple spec files in one session, prefer separate commits in this order:

1. `TRUTH.md`, `ARCHITECTURE.md`
2. `INTEGRATION.md`, `DESIGN.md`
3. `TASKS.md`, `VALIDATION.md`
4. `CHANGELOG.md`, `STRUCTURAL_REEVAL.md`

If the user touched only one or two files, a single `docs: …` commit for the whole `specs/<slug>/` folder is fine.

### Workflow JSON

- One commit per slug unless the user explicitly batched tasks.
- If `CHANGELOG.md` entries map to distinct build tasks, you may split `workflows/<slug>.json` commits to match (still one slug per commit message).
- Never commit workflow JSON in the same commit as draft specs that are not yet approved — specs first, JSON after.

## Commit message rules

- One line only, no body
- Conventional prefix: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`
- Describe **what** changed, not why
- **No Cursor co-authors** — never `Co-authored-by: Cursor` or any Cursor/agent trailer; human author only
- No other co-author lines unless the user explicitly requests them in chat
- No ticket URLs unless the user supplied them in the message style
- Scope with slug when helpful: `feat(onboarding-webhook): add trigger node`

### Examples (this repo)

- `docs: add spec templates and validation rubric`
- `feat(n8n-plan): add planning skill`
- `docs: plan specs for slack-user-lookup`
- `feat(slack-user-lookup): implement directory fetch task`
- `chore: add validate-workflow script`
- `docs: log deploy for slack-user-lookup`

## Grouping principles

- A skill directory and its reference files (e.g. `n8n-cli/` + `workflow-json.md`) belong in one commit.
- All files under one `specs/<slug>/` plan session can be one commit if small; split by intra-spec order when the diff is large.
- `workflows/<slug>.json` stays separate from `specs/<slug>/` unless the user asks for a single squashed commit.
- `deployments/DEPLOYMENTS.md` only with deploy-related changes, never mixed with plan or build.
- Prefer granular commits over one large commit.
- Never mix unrelated slugs, unrelated skills, or feature work with drive-by cleanup.

## After committing

Summarize for the user:

- Number of commits created
- One-line subject per commit
- Any files left unstaged (secrets, intentional skips) and why
