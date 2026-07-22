# ADR-006: MySQL Generated Columns for Derived Financial Values

**Status:** Accepted

## Context

Several financial fields in the palm oil farm data are pure arithmetic derivations:

| Table | Derived field | Formula |
|---|---|---|
| `t_sawit_hub_panen` | `berat_ton` | `berat_kg / 1000` |
| `t_sawit_hub_panen` | `berat_rata_janjang` | `berat_kg / jumlah_janjang` |
| `t_sawit_hub_panen` | `total_pendapatan` | `berat_kg * harga_per_kg` |
| `t_sawit_hub_panen` | `hasil_bersih` | `total_pendapatan - biaya_panen` |
| `t_sawit_hub_pendapatan` | `pendapatan_bersih` | `pendapatan_kotor - biaya_total` |

Options for where to compute these values:

| Option | Tradeoffs |
|---|---|
| Application layer (compute in Go handler) | Flexible; but derived values must be recomputed every read; inconsistency risk if multiple code paths write the same table |
| Store as regular columns, update on write | Simpler reads; but derived values can diverge from source columns if update logic has a bug |
| MySQL generated columns (`GENERATED ALWAYS AS`) | Computed by DB engine; always consistent with source columns; can be indexed; zero application logic |

## Decision

Use MySQL `GENERATED ALWAYS AS (expr) STORED` for all arithmetic derivations.

Generated columns are:
- `STORED` (not `VIRTUAL`) so they can be indexed and appear in `SELECT *`
- Computed at write time by MySQL — application code never sets them
- Consistent by construction — if `berat_kg` changes in an UPDATE, `berat_ton` updates automatically

**Rule in application code:** Never set generated columns in INSERT or UPDATE statements. The Go handlers explicitly omit them from write queries. Any attempt to set a generated column causes a MySQL error.

## Consequences

**Benefits:**
- Derived values are always mathematically consistent with their source columns — no background job or trigger needed to keep them in sync
- Dashboard and report queries can directly aggregate generated columns without recomputing in SQL
- Reduces handler complexity — handlers don't need to compute and write derived values

**Trade-offs:**
- Generated column expressions are defined in the migration SQL — changing a formula requires a new migration
- `STORED` generated columns use disk space (same as a regular column)
- Developers unfamiliar with generated columns may try to set them in INSERT and get a confusing MySQL error — this is documented in the handler comments and in CONTRIBUTING.md
- `berat_rata_janjang` (weight per bunch) can produce a division-by-zero condition if `jumlah_janjang = 0` — MySQL handles this as NULL in the generated column, which is the correct behavior
