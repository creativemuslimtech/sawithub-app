#!/usr/bin/env python3
"""Migrate env vars from Railway JSON to Infisical project."""
import sys
import json
import urllib.request
import urllib.error

INFISICAL_URL = "https://infisical-production-95d0.up.railway.app"
INFISICAL_TOKEN = sys.argv[1]

# Skip Railway-injected variables
SKIP_PREFIXES = ("RAILWAY_",)
SKIP_KEYS = {"PORT"}


def push_secrets(workspace_id: str, environment: str, vars_json: str):
    raw = json.loads(vars_json)
    secrets = [
        {"secretKey": k, "secretValue": v, "secretComment": ""}
        for k, v in raw.items()
        if not any(k.startswith(p) for p in SKIP_PREFIXES) and k not in SKIP_KEYS
    ]

    payload = json.dumps({
        "workspaceId": workspace_id,
        "environment": environment,
        "secrets": secrets,
    }).encode()

    req = urllib.request.Request(
        f"{INFISICAL_URL}/api/v3/secrets/batch/raw",
        data=payload,
        headers={
            "Authorization": f"Bearer {INFISICAL_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as res:
            body = json.loads(res.read())
            print(f"  ✓ {len(secrets)} secrets pushed to {environment}")
            return body
    except urllib.error.HTTPError as e:
        print(f"  ✗ Error {e.code}: {e.read().decode()}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: migrate.py <token> <workspace_id> <environment> <vars_json>")
        sys.exit(1)

    _, token, workspace_id, environment, vars_json = sys.argv
    INFISICAL_TOKEN = token
    push_secrets(workspace_id, environment, vars_json)
