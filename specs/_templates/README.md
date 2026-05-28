# Spec templates

Copy these files into `specs/<slug>/` when starting a workflow, or ask the agent to use the **n8n-plan** skill.

```text
specs/<slug>/
  TRUTH.md
  ARCHITECTURE.md
  INTEGRATION.md
  DESIGN.md          # optional — omit if no messaging copy
  TASKS.md
  VALIDATION.md
  CHANGELOG.md
  STRUCTURAL_REEVAL.md   # only after 4 verify rejects on one task
```

Each file has section headings and brief placeholders. Planning fills them in; see [docs/validation-rubric.md](../../docs/validation-rubric.md) for build-ready criteria.
