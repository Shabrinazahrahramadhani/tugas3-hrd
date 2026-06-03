# Tugas 3 – Pencarian Data Karyawan & Agregasi MongoDB

## Struktur Proyek
```
tugas3-hrd/
├── models/
│   └── Karyawan.js       ← Schema MongoDB
├── routes/
│   └── karyawan.js       ← Semua endpoint API
├── app.js                ← Entry point Express server
├── seed.js               ← Script insert data dummy
└── demo.js               ← Simulasi semua query (tanpa MongoDB)
```

## Instalasi & Menjalankan

```bash
npm install
node seed.js      # Insert 12 data dummy ke MongoDB
node app.js       # Jalankan server di port 3000
```

---

## 1. Data Dummy (12 Karyawan)

| Nama              | Divisi    | Gaji          | Status  | Tahun |
|-------------------|-----------|---------------|---------|-------|
| James Carter      | IT        | Rp 9.500.000  | Tetap   | 2018  |
| Emily Watson      | Finance   | Rp 8.200.000  | Tetap   | 2019  |
| Sarah Mitchell    | HR        | Rp 6.800.000  | Tetap   | 2020  |
| David Reynolds    | IT        | Rp 11.000.000 | Tetap   | 2017  |
| Laura Bennett     | Marketing | Rp 5.500.000  | Kontrak | 2022  |
| Michael Foster    | Finance   | Rp 7.500.000  | Tetap   | 2021  |
| Rachel Greene     | IT        | Rp 6.200.000  | Kontrak | 2023  |
| Thomas Harper     | Marketing | Rp 8.800.000  | Tetap   | 2016  |
| Amanda Collins    | HR        | Rp 5.900.000  | Kontrak | 2022  |
| Robert Sullivan   | Finance   | Rp 9.100.000  | Tetap   | 2018  |
| Natalie Brooks    | IT        | Rp 7.800.000  | Tetap   | 2020  |
| Kevin Thornton    | Marketing | Rp 6.400.000  | Kontrak | 2023  |

---

## 2. Query Operator

### Query 1 – Karyawan Tetap dengan Gaji > 7.000.000 (`$and`, `$gt`)

**Endpoint:** `GET /api/karyawan/tetap-gaji-tinggi`

**MongoDB Query:**
```javascript
db.karyawan.find({
  $and: [
    { status: "Tetap" },
    { gaji: { $gt: 7000000 } }
  ]
}).sort({ gaji: -1 })
```

**Hasil (7 karyawan):**
| Nama             | Divisi    | Gaji          |
|------------------|-----------|---------------|
| David Reynolds   | IT        | Rp 11.000.000 |
| James Carter     | IT        | Rp 9.500.000  |
| Robert Sullivan  | Finance   | Rp 9.100.000  |
| Thomas Harper    | Marketing | Rp 8.800.000  |
| Emily Watson     | Finance   | Rp 8.200.000  |
| Natalie Brooks   | IT        | Rp 7.800.000  |
| Michael Foster   | Finance   | Rp 7.500.000  |

---

### Query 2 – Karyawan Divisi IT atau Finance (`$in`)

**Endpoint:** `GET /api/karyawan/divisi-it-finance`

**MongoDB Query:**
```javascript
db.karyawan.find({
  divisi: { $in: ["IT", "Finance"] }
}).sort({ divisi: 1, nama: 1 })
```

**Hasil (7 karyawan):**
| Nama             | Divisi  | Gaji          | Status  |
|------------------|---------|---------------|---------|
| Emily Watson     | Finance | Rp 8.200.000  | Tetap   |
| Michael Foster   | Finance | Rp 7.500.000  | Tetap   |
| Robert Sullivan  | Finance | Rp 9.100.000  | Tetap   |
| David Reynolds   | IT      | Rp 11.000.000 | Tetap   |
| James Carter     | IT      | Rp 9.500.000  | Tetap   |
| Natalie Brooks   | IT      | Rp 7.800.000  | Tetap   |
| Rachel Greene    | IT      | Rp 6.200.000  | Kontrak |

---

## 3. Aggregation Pipeline

**Endpoint:** `GET /api/karyawan/laporan-divisi`

### Pipeline Lengkap:

```javascript
db.karyawan.aggregate([
  // Tahap 1: $match – filter hanya karyawan Tetap
  { $match: { status: "Tetap" } },

  // Tahap 2: $group – kelompokkan per divisi
  {
    $group: {
      _id: "$divisi",
      jumlah_karyawan: { $sum: 1 },
      rata_rata_gaji:  { $avg: "$gaji" },
      total_gaji:      { $sum: "$gaji" },
      gaji_tertinggi:  { $max: "$gaji" },
      gaji_terendah:   { $min: "$gaji" },
    }
  },

  // Tahap 3 (BONUS): $sort – urutkan rata-rata gaji tertinggi
  { $sort: { rata_rata_gaji: -1 } },

  // $project – rapikan nama field output
  {
    $project: {
      _id: 0,
      divisi:           "$_id",
      jumlah_karyawan:  1,
      rata_rata_gaji:   { $round: ["$rata_rata_gaji", 0] },
      total_gaji:       1,
      gaji_tertinggi:   1,
      gaji_terendah:    1,
    }
  }
])
```

### Hasil Laporan (diurutkan rata-rata gaji tertinggi):

| Divisi    | Jml | Rata-rata Gaji | Total Gaji     |
|-----------|-----|----------------|----------------|
| IT        |   3 | Rp 9.433.333   | Rp 28.300.000  |
| Marketing |   1 | Rp 8.800.000   | Rp 8.800.000   |
| Finance   |   3 | Rp 8.266.667   | Rp 24.800.000  |
| HR        |   1 | Rp 6.800.000   | Rp 6.800.000   |

> **Catatan:** Dari 12 karyawan, hanya 8 berstatus "Tetap" yang masuk ke pipeline setelah `$match`.