# database-sawithub

Repository khusus skema dan data SQL untuk database `sawit_hub_db`.

## Struktur

- `sawit_hub_db/ddl/.dbconfig`: config/initial database SQL
- `sawit_hub_db/ddl`: migrasi DDL (schema, table, index) per nama tabel
- `sawit_hub_db/dml`: migrasi DML (seed, data patch)
- `.github/workflows/sql-validate.yml`: validasi SQL saat PR
- `.github/workflows/sql-apply.yml`: apply SQL saat merge ke `main`

## Urutan Eksekusi

- `.dbconfig` dijalankan lebih dulu (jika ada)
- lalu semua file `.sql` di `ddl` (urut lexical)
- lalu semua file `.sql` di `dml` (urut lexical)

## Secrets GitHub Actions

Set secrets ini di repo:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER` (disarankan user khusus GitHub Actions)
- `DB_PASSWORD`

Koneksi action dipaksa TLS dengan `--ssl-mode=REQUIRED`.

## User Khusus GitHub Actions

Command pembuatan user **tidak disimpan di repo**.
Jalankan manual di environment aman dengan prinsip:

- user khusus automation (bukan root)
- host dibatasi sesuai kebutuhan
- `REQUIRE SSL`
- password dirotasi berkala

## Redis Policy Reference

Standar Redis production untuk ekosistem SawitHub didokumentasikan terpisah di:

- `../redis-sawithub/README.md`
