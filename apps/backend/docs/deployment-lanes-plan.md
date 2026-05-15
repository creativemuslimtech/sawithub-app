# Deployment Lanes Plan

Status: draft (parked for later discussion)

## Current Architecture

- `frontend-sawithub` <-> `backend-sawithub` (public lane)
- `admin-frontend-sawithub` <-> `admin-backend-sawithub` (admin lane)

## Main Principle

Operate as two isolated deployment lanes:

- Public lane changes do not impact admin lane.
- Admin lane changes do not impact public lane.
- No cross-target API URL between lanes.

## Routing and Domains

- Public frontend must call only public backend endpoint.
- Admin frontend must call only admin backend endpoint.
- Recommended stable hostnames:
  - Public API: `api.sawithub.com`
  - Admin API: `admin-api.sawithub.com`

## Deployment Order

For each lane:

1. Deploy backend first.
2. Run backend smoke checks.
3. Deploy frontend.
4. Run end-to-end smoke checks.

## API Change Safety

- Use versioning and/or backward-compatible aliases for endpoint renames.
- Keep old endpoint aliases for at least 1-2 release cycles.
- Add deprecation + sunset communication before removal.

## Release Governance

- Enforce PR-only merge flow.
- Keep required status checks enabled.
- Keep backend-target guard scripts in build pipeline.

## Runbook (to be detailed later)

- Repo-by-repo deploy matrix:
  - trigger
  - required env vars
  - smoke endpoints
  - rollback steps

## Notes

This file is intentionally lightweight and is a placeholder for the next planning session.
