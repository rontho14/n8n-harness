# Deployment log

Append-only record of workflows deployed to n8n via `n8n-cli`.

| Date | Workflow | Remote ID | Action | File | Project | Go live |
|------|----------|-----------|--------|------|---------|---------|

## Template (copy for each deploy)

```markdown
## YYYY-MM-DD — <workflow name>

- **Action**: create | update
- **Remote ID**: `<id>`
- **File**: `workflows/<slug>.json`
- **Project**: `<projectId or n/a>`
- **Go live**: yes | no
- **Verified**: yes (`n8n-cli workflow get <id>`)
- **Notes**: (credential setup, follow-ups)
```
