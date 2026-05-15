# CLAUDE.md — Project Instructions

## Branch Rules

- **All changes go to `staging` only.** Never commit directly to `main` and never push to `main`.
- Before starting any work, ensure the local `staging` branch is in sync with `origin/staging`:
  ```bash
  git fetch origin
  git rebase origin/staging
  ```
  If the rebase produces conflicts, resolve them before proceeding — do not force-push or discard remote changes.
- After finishing a set of changes, push to `origin/staging`:
  ```bash
  git push origin staging
  ```
- PRs from `staging` → `main` are the only path to production. Do not bypass this.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
