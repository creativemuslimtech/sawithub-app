# ADR-001: PII Encryption Strategy (AES-256 + SHA-256 Hash Columns)

**Status:** Accepted

## Context

SawitHub stores personally identifiable information (PII) for 12,400+ farmers: full name, email address, and phone number. Indonesian regulations (UU PDP) and our B2B partners (banks, cooperatives, government programs like PSR) require that user PII not be stored in plaintext. A database breach must not expose usable personal data.

The challenge: these fields are also used for:
- Email lookup during login and password reset
- Phone lookup for SMS/WhatsApp reminders
- Username uniqueness enforcement

Pure encryption makes index-based lookup impossible. Hashing makes it possible, but standard bcrypt is too slow for lookup operations and cannot be used with SQL `WHERE` clauses efficiently.

## Decision

We use a dual-column strategy for each PII field:

| Logical field | Encrypted column | Lookup column |
|---|---|---|
| `email` | `email_enc` (AES-256-GCM) | `email_hash` (SHA-256, hex) |
| `phone` | `phone_enc` (AES-256-GCM) | `phone_hash` (SHA-256, hex) |
| `full_name` | `full_name_enc` (AES-256-GCM) | — (not used for lookup) |

**Encryption:** AES-256-GCM with a random 12-byte nonce prepended to the ciphertext. Key is `ENCRYPTION_KEY` (32 bytes). The key is the same across both backend and admin-backend services.

**Lookup hashing:** SHA-256 of the normalized value (lowercase email, raw phone digits). The hash is deterministic so `WHERE email_hash = ?` works as a fast indexed lookup. The hash cannot be reversed to recover the original value.

**Redis prohibition:** Any Redis key matching `*email*`, `*phone*`, or `*password*` is forbidden by policy. PII must never be cached.

## Consequences

**Benefits:**
- A raw database dump exposes no usable email or phone — only ciphertext blobs and hashes
- SQL lookups remain efficient via indexed hash columns
- Decryption happens in application memory on read, transparent to the API response

**Trade-offs:**
- Each write requires two operations: encrypt → store in `_enc`; hash → store in `_hash`
- Changing the `ENCRYPTION_KEY` requires a re-encryption migration of all rows — this is a high-stakes operational event
- SHA-256 hashes of common emails (e.g. gmail.com addresses) could theoretically be rainbow-table attacked — we accept this risk because hashes are only used for equality lookup, not exposed in any API response
- `full_name` has no hash column — full-name search by admin is not supported without a full table decrypt

**Operational note:** The `ENCRYPTION_KEY` is a 32-byte secret managed in Railway environment variables. It is never committed to the repository. Loss of this key means PII for all users becomes permanently unreadable.
