-- Dummy dataset for admin users
-- Compatible with MySQL 5.7+ and restricted DB users (no temporary table)
-- Period: 2019-01-01 .. 2026-05-01

-- ===========================================
-- 1) Seed lahan (6 lahan per admin)
-- ===========================================
INSERT INTO t_sawit_hub_lahan (
  user_id,
  nama_kebun,
  jenis_bibit,
  lokasi,
  luas_ha,
  jumlah_pohon,
  tahun_tanam,
  created_at,
  updated_at
)
SELECT
  a.user_id,
  CONCAT('Kebun Demo Admin ', LPAD(s.idx, 2, '0')) AS nama_kebun,
  CASE s.idx
    WHEN 1 THEN 'DxP Simalungun'
    WHEN 2 THEN 'DxP PPKS 540'
    WHEN 3 THEN 'DxP Marihat'
    WHEN 4 THEN 'DxP Topaz'
    WHEN 5 THEN 'DxP Yangambi'
    ELSE 'DxP Socfin'
  END AS jenis_bibit,
  CASE s.idx
    WHEN 1 THEN 'Bengkulu Utara'
    WHEN 2 THEN 'Mukomuko'
    WHEN 3 THEN 'Seluma'
    WHEN 4 THEN 'Bengkulu Selatan'
    WHEN 5 THEN 'Rejang Lebong'
    ELSE 'Kaur'
  END AS lokasi,
  CASE s.idx
    WHEN 1 THEN 2.40
    WHEN 2 THEN 3.10
    WHEN 3 THEN 4.20
    WHEN 4 THEN 5.50
    WHEN 5 THEN 6.30
    ELSE 3.80
  END AS luas_ha,
  CASE s.idx
    WHEN 1 THEN 235
    WHEN 2 THEN 304
    WHEN 3 THEN 414
    WHEN 4 THEN 543
    WHEN 5 THEN 624
    ELSE 374
  END AS jumlah_pohon,
  CASE s.idx
    WHEN 1 THEN 2013
    WHEN 2 THEN 2015
    WHEN 3 THEN 2011
    WHEN 4 THEN 2017
    WHEN 5 THEN 2010
    ELSE 2014
  END AS tahun_tanam,
  '2019-01-01 08:00:00' AS created_at,
  NOW() AS updated_at
FROM (
  SELECT user_id
  FROM t_sawit_hub_users
  WHERE role = 'admin'
    AND deleted_at IS NULL
) a
JOIN (
  SELECT 1 AS idx UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
) s
LEFT JOIN t_sawit_hub_lahan l
  ON l.user_id = a.user_id
 AND l.nama_kebun = CONCAT('Kebun Demo Admin ', LPAD(s.idx, 2, '0'))
 AND l.deleted_at IS NULL
WHERE l.id_lahan IS NULL;

-- ===========================================
-- 2) Seed harga TBS mingguan
-- ===========================================
INSERT INTO t_sawit_hub_harga_tbs (
  user_id,
  tanggal,
  harga_per_kg,
  sumber,
  catatan,
  created_at
)
SELECT
  a.user_id,
  d.tanggal,
  ROUND(
    GREATEST(
      1450,
      LEAST(
        3900,
        (
          CASE
            WHEN YEAR(d.tanggal) <= 2020 THEN 1550
            WHEN YEAR(d.tanggal) = 2021 THEN 1850
            WHEN YEAR(d.tanggal) = 2022 THEN 2150
            WHEN YEAR(d.tanggal) = 2023 THEN 2350
            WHEN YEAR(d.tanggal) = 2024 THEN 2600
            WHEN YEAR(d.tanggal) = 2025 THEN 3050
            ELSE 2950
          END
          + (MONTH(d.tanggal) - 6) * 32
          + (WEEK(d.tanggal, 3) % 5) * 18
        )
      )
    ),
    2
  ) AS harga_per_kg,
  'Dummy baseline Bengkulu/Sumatra (ANTARA, GAPKI, Agricom 2024-2025)' AS sumber,
  'Generated automatically for admin demo' AS catatan,
  CONCAT(d.tanggal, ' 08:00:00') AS created_at
FROM (
  SELECT user_id
  FROM t_sawit_hub_users
  WHERE role = 'admin'
    AND deleted_at IS NULL
) a
JOIN (
  SELECT DATE_ADD('2019-01-04', INTERVAL seq.n * 7 DAY) AS tanggal
  FROM (
    SELECT (ones.n + tens.n * 10 + hundreds.n * 100) AS n
    FROM
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
      CROSS JOIN
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
      CROSS JOIN
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) hundreds
  ) seq
  WHERE DATE_ADD('2019-01-04', INTERVAL seq.n * 7 DAY) <= '2026-05-01'
) d
LEFT JOIN t_sawit_hub_harga_tbs h
  ON h.user_id = a.user_id
 AND h.tanggal = d.tanggal
WHERE h.id_harga IS NULL;

-- ===========================================
-- 3) Seed panen (2x per bulan: tgl 1 & 15)
-- ===========================================
INSERT INTO t_sawit_hub_panen (
  user_id,
  id_lahan,
  tanggal_panen,
  luas_panen_ha,
  jumlah_janjang,
  berat_kg,
  harga_per_kg,
  biaya_panen,
  catatan,
  created_at,
  updated_at
)
SELECT
  x.user_id,
  x.id_lahan,
  x.tanggal_panen,
  x.luas_ha AS luas_panen_ha,
  GREATEST(120, ROUND((x.base_kg / 16.5), 0)) AS jumlah_janjang,
  ROUND(x.base_kg, 2) AS berat_kg,
  ROUND(
    GREATEST(
      1450,
      LEAST(
        3900,
        (
          CASE
            WHEN YEAR(x.tanggal_panen) <= 2020 THEN 1550
            WHEN YEAR(x.tanggal_panen) = 2021 THEN 1850
            WHEN YEAR(x.tanggal_panen) = 2022 THEN 2150
            WHEN YEAR(x.tanggal_panen) = 2023 THEN 2350
            WHEN YEAR(x.tanggal_panen) = 2024 THEN 2600
            WHEN YEAR(x.tanggal_panen) = 2025 THEN 3050
            ELSE 2950
          END
          + (MONTH(x.tanggal_panen) - 6) * 32
          + (WEEK(x.tanggal_panen, 3) % 5) * 18
        )
      )
    ),
    2
  ) AS harga_per_kg,
  ROUND(x.base_kg * 0.18, 2) AS biaya_panen,
  'Dummy panen rotasi 2 minggu' AS catatan,
  CONCAT(x.tanggal_panen, ' 09:00:00') AS created_at,
  NOW() AS updated_at
FROM (
  SELECT
    l.user_id,
    l.id_lahan,
    l.luas_ha,
    t.tanggal_panen,
    (
      l.luas_ha * (
        760
        + (MONTH(t.tanggal_panen) * 17)
        + (CASE WHEN YEAR(t.tanggal_panen) >= 2024 THEN 90 ELSE 0 END)
        + ((l.id_lahan % 5) * 24)
      )
    ) AS base_kg
  FROM t_sawit_hub_lahan l
  JOIN (
    SELECT u.user_id
    FROM t_sawit_hub_users u
    WHERE u.role = 'admin'
      AND u.deleted_at IS NULL
  ) a ON a.user_id = l.user_id
  JOIN (
    SELECT DATE_ADD(DATE_ADD('2019-01-01', INTERVAL m.n MONTH), INTERVAL d.off DAY) AS tanggal_panen
    FROM (
      SELECT (ones.n + tens.n * 10) AS n
      FROM
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
        CROSS JOIN
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
    ) m
    JOIN (SELECT 0 AS off UNION ALL SELECT 14) d
    WHERE m.n <= 90
      AND DATE_ADD(DATE_ADD('2019-01-01', INTERVAL m.n MONTH), INTERVAL d.off DAY) <= '2026-05-01'
  ) t
  WHERE l.deleted_at IS NULL
    AND l.nama_kebun LIKE 'Kebun Demo Admin %'
) x
ON DUPLICATE KEY UPDATE
  luas_panen_ha = VALUES(luas_panen_ha),
  jumlah_janjang = VALUES(jumlah_janjang),
  berat_kg = VALUES(berat_kg),
  harga_per_kg = VALUES(harga_per_kg),
  biaya_panen = VALUES(biaya_panen),
  catatan = VALUES(catatan),
  updated_at = NOW();

-- ===========================================
-- 4) Seed jadwal perawatan
-- ===========================================
INSERT INTO t_sawit_hub_jadwal_perawatan (
  user_id,
  id_lahan,
  jenis_perawatan,
  deskripsi,
  frequensi_tipe,
  tanggal_mulai,
  tanggal_akhir,
  estimasi_biaya,
  is_active,
  catatan,
  created_at,
  updated_at
)
SELECT
  l.user_id,
  l.id_lahan,
  j.jenis_perawatan,
  CONCAT('Jadwal otomatis ', j.jenis_perawatan, ' (dummy admin)') AS deskripsi,
  j.frequensi_tipe,
  '2019-01-01' AS tanggal_mulai,
  '2026-05-01' AS tanggal_akhir,
  ROUND(j.biaya * l.luas_ha, 2) AS estimasi_biaya,
  1 AS is_active,
  'Generated from seed 2019-2026' AS catatan,
  '2019-01-01 07:00:00' AS created_at,
  NOW() AS updated_at
FROM t_sawit_hub_lahan l
JOIN (
  SELECT u.user_id
  FROM t_sawit_hub_users u
  WHERE u.role = 'admin'
    AND u.deleted_at IS NULL
) a ON a.user_id = l.user_id
JOIN (
  SELECT 'Pemupukan' AS jenis_perawatan, 'tiga_kali_tahunan' AS frequensi_tipe, 2500000 AS biaya
  UNION ALL SELECT 'Pruning', 'dua_kali_tahunan', 1200000
  UNION ALL SELECT 'Semprot', 'tiga_kali_tahunan', 1450000
  UNION ALL SELECT 'Tebas', 'dua_kali_tahunan', 1300000
) j
LEFT JOIN t_sawit_hub_jadwal_perawatan jp
  ON jp.user_id = l.user_id
 AND jp.id_lahan = l.id_lahan
 AND jp.jenis_perawatan = j.jenis_perawatan
 AND jp.tanggal_mulai = '2019-01-01'
 AND jp.deleted_at IS NULL
WHERE l.deleted_at IS NULL
  AND l.nama_kebun LIKE 'Kebun Demo Admin %'
  AND jp.id_jadwal_perawatan IS NULL;

-- ===========================================
-- 5) Seed perawatan (2-3x per tahun)
-- ===========================================
INSERT INTO t_sawit_hub_perawatan (
  user_id,
  id_lahan,
  tanggal_perawatan,
  jenis_perawatan,
  bahan,
  jumlah,
  satuan,
  harga_satuan,
  total_harga_material,
  biaya_pekerja,
  total_biaya_perawatan,
  keterangan,
  created_at,
  updated_at
)
SELECT
  p.user_id,
  p.id_lahan,
  p.tanggal_perawatan,
  p.jenis_perawatan,
  p.bahan,
  p.jumlah,
  p.satuan,
  p.harga_satuan,
  ROUND(p.jumlah * p.harga_satuan, 2) AS total_harga_material,
  p.biaya_pekerja,
  ROUND((p.jumlah * p.harga_satuan) + p.biaya_pekerja, 2) AS total_biaya_perawatan,
  'Dummy aktivitas perawatan mengikuti jadwal' AS keterangan,
  CONCAT(p.tanggal_perawatan, ' 10:00:00') AS created_at,
  NOW() AS updated_at
FROM (
  -- Pemupukan 3x/tahun (tiap 4 bulan)
  SELECT
    l.user_id,
    l.id_lahan,
    DATE_ADD('2019-01-15', INTERVAL m.n MONTH) AS tanggal_perawatan,
    'Pemupukan' AS jenis_perawatan,
    'NPK 15-15-15' AS bahan,
    ROUND(l.luas_ha * 3.8, 2) AS jumlah,
    'zak' AS satuan,
    320000 AS harga_satuan,
    420000 AS biaya_pekerja
  FROM t_sawit_hub_lahan l
  JOIN (
    SELECT u.user_id
    FROM t_sawit_hub_users u
    WHERE u.role = 'admin'
      AND u.deleted_at IS NULL
  ) a ON a.user_id = l.user_id
  JOIN (
    SELECT (ones.n + tens.n * 10) AS n
    FROM
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
      CROSS JOIN
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
  ) m
  WHERE l.deleted_at IS NULL
    AND l.nama_kebun LIKE 'Kebun Demo Admin %'
    AND m.n <= 90
    AND MOD(m.n, 4) = 0
    AND DATE_ADD('2019-01-15', INTERVAL m.n MONTH) <= '2026-05-01'

  UNION ALL

  -- Pruning 2x/tahun (tiap 6 bulan)
  SELECT
    l.user_id,
    l.id_lahan,
    DATE_ADD('2019-02-10', INTERVAL m.n MONTH) AS tanggal_perawatan,
    'Pruning' AS jenis_perawatan,
    'Jasa pruning' AS bahan,
    ROUND(l.luas_ha, 2) AS jumlah,
    'unit' AS satuan,
    350000 AS harga_satuan,
    300000 AS biaya_pekerja
  FROM t_sawit_hub_lahan l
  JOIN (
    SELECT u.user_id
    FROM t_sawit_hub_users u
    WHERE u.role = 'admin'
      AND u.deleted_at IS NULL
  ) a ON a.user_id = l.user_id
  JOIN (
    SELECT (ones.n + tens.n * 10) AS n
    FROM
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
      CROSS JOIN
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
  ) m
  WHERE l.deleted_at IS NULL
    AND l.nama_kebun LIKE 'Kebun Demo Admin %'
    AND m.n <= 90
    AND MOD(m.n, 6) = 0
    AND DATE_ADD('2019-02-10', INTERVAL m.n MONTH) <= '2026-05-01'

  UNION ALL

  -- Semprot 3x/tahun (tiap 4 bulan)
  SELECT
    l.user_id,
    l.id_lahan,
    DATE_ADD('2019-03-05', INTERVAL m.n MONTH) AS tanggal_perawatan,
    'Semprot' AS jenis_perawatan,
    'Herbisida Glyphosate' AS bahan,
    ROUND(l.luas_ha * 1.6, 2) AS jumlah,
    'liter' AS satuan,
    90000 AS harga_satuan,
    240000 AS biaya_pekerja
  FROM t_sawit_hub_lahan l
  JOIN (
    SELECT u.user_id
    FROM t_sawit_hub_users u
    WHERE u.role = 'admin'
      AND u.deleted_at IS NULL
  ) a ON a.user_id = l.user_id
  JOIN (
    SELECT (ones.n + tens.n * 10) AS n
    FROM
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
      CROSS JOIN
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
  ) m
  WHERE l.deleted_at IS NULL
    AND l.nama_kebun LIKE 'Kebun Demo Admin %'
    AND m.n <= 90
    AND MOD(m.n, 4) = 0
    AND DATE_ADD('2019-03-05', INTERVAL m.n MONTH) <= '2026-05-01'

  UNION ALL

  -- Tebas 2x/tahun (tiap 6 bulan)
  SELECT
    l.user_id,
    l.id_lahan,
    DATE_ADD('2019-04-01', INTERVAL m.n MONTH) AS tanggal_perawatan,
    'Tebas' AS jenis_perawatan,
    'Jasa tebas gulma' AS bahan,
    ROUND(l.luas_ha, 2) AS jumlah,
    'unit' AS satuan,
    280000 AS harga_satuan,
    280000 AS biaya_pekerja
  FROM t_sawit_hub_lahan l
  JOIN (
    SELECT u.user_id
    FROM t_sawit_hub_users u
    WHERE u.role = 'admin'
      AND u.deleted_at IS NULL
  ) a ON a.user_id = l.user_id
  JOIN (
    SELECT (ones.n + tens.n * 10) AS n
    FROM
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
      CROSS JOIN
      (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
  ) m
  WHERE l.deleted_at IS NULL
    AND l.nama_kebun LIKE 'Kebun Demo Admin %'
    AND m.n <= 90
    AND MOD(m.n, 6) = 0
    AND DATE_ADD('2019-04-01', INTERVAL m.n MONTH) <= '2026-05-01'
) p
ON DUPLICATE KEY UPDATE
  jumlah = VALUES(jumlah),
  satuan = VALUES(satuan),
  harga_satuan = VALUES(harga_satuan),
  total_harga_material = VALUES(total_harga_material),
  biaya_pekerja = VALUES(biaya_pekerja),
  total_biaya_perawatan = VALUES(total_biaya_perawatan),
  keterangan = VALUES(keterangan),
  updated_at = NOW();
