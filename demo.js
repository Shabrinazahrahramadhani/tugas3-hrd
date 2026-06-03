// ============================================================
// DEMO SIMULASI - Tugas 3: Pencarian Data Karyawan & Agregasi
// Menjalankan semua query operator & aggregation pipeline
// tanpa memerlukan koneksi MongoDB
// ============================================================

// ---- DATA DUMMY (12 karyawan) --------------------------------
const karyawan = [
  { nama: "James Carter",    divisi: "IT",        gaji: 9500000,  status: "Tetap",   tahun_masuk: 2018 },
  { nama: "Emily Watson",    divisi: "Finance",   gaji: 8200000,  status: "Tetap",   tahun_masuk: 2019 },
  { nama: "Sarah Mitchell",  divisi: "HR",        gaji: 6800000,  status: "Tetap",   tahun_masuk: 2020 },
  { nama: "David Reynolds",  divisi: "IT",        gaji: 11000000, status: "Tetap",   tahun_masuk: 2017 },
  { nama: "Laura Bennett",   divisi: "Marketing", gaji: 5500000,  status: "Kontrak", tahun_masuk: 2022 },
  { nama: "Michael Foster",  divisi: "Finance",   gaji: 7500000,  status: "Tetap",   tahun_masuk: 2021 },
  { nama: "Rachel Greene",   divisi: "IT",        gaji: 6200000,  status: "Kontrak", tahun_masuk: 2023 },
  { nama: "Thomas Harper",   divisi: "Marketing", gaji: 8800000,  status: "Tetap",   tahun_masuk: 2016 },
  { nama: "Amanda Collins",  divisi: "HR",        gaji: 5900000,  status: "Kontrak", tahun_masuk: 2022 },
  { nama: "Robert Sullivan", divisi: "Finance",   gaji: 9100000,  status: "Tetap",   tahun_masuk: 2018 },
  { nama: "Natalie Brooks",  divisi: "IT",        gaji: 7800000,  status: "Tetap",   tahun_masuk: 2020 },
  { nama: "Kevin Thornton",  divisi: "Marketing", gaji: 6400000,  status: "Kontrak", tahun_masuk: 2023 },
];

const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");
const separator = "─".repeat(60);

// ---- TAMPILKAN SEMUA DATA ------------------------------------
console.log("\n" + separator);
console.log("📋  SEMUA DATA KARYAWAN (12 data)");
console.log(separator);
console.log(
  "No | Nama               | Divisi    | Gaji        | Status  | Tahun"
);
console.log(
  "---|--------------------|-----------|--------------|---------|-----------"
);
karyawan.forEach((k, i) => {
  console.log(
    `${String(i + 1).padStart(2)} | ${k.nama.padEnd(18)} | ${k.divisi.padEnd(9)} | ${rupiah(k.gaji).padEnd(12)} | ${k.status.padEnd(7)} | ${k.tahun_masuk}`
  );
});

// ============================================================
// QUERY 1: Karyawan Tetap DAN gaji > 7.000.000
// MongoDB: { $and: [{ status: "Tetap" }, { gaji: { $gt: 7000000 } }] }
// ============================================================
console.log("\n" + separator);
console.log("🔍  QUERY 1: Status = Tetap AND Gaji > 7.000.000");
console.log("    MongoDB Query: { $and: [{ status: 'Tetap' }, { gaji: { $gt: 7000000 } }] }");
console.log(separator);

const query1 = karyawan
  .filter((k) => k.status === "Tetap" && k.gaji > 7000000)
  .sort((a, b) => b.gaji - a.gaji);

console.log(`✅ Ditemukan: ${query1.length} karyawan\n`);
query1.forEach((k) => {
  console.log(
    `  • ${k.nama.padEnd(18)} | ${k.divisi.padEnd(10)} | ${rupiah(k.gaji)} | ${k.status}`
  );
});

// ============================================================
// QUERY 2: Karyawan divisi "IT" ATAU "Finance"
// MongoDB: { divisi: { $in: ["IT", "Finance"] } }
// ============================================================
console.log("\n" + separator);
console.log('🔍  QUERY 2: Divisi = "IT" OR "Finance"');
console.log('    MongoDB Query: { divisi: { $in: ["IT", "Finance"] } }');
console.log(separator);

const query2 = karyawan
  .filter((k) => ["IT", "Finance"].includes(k.divisi))
  .sort((a, b) => a.divisi.localeCompare(b.divisi) || a.nama.localeCompare(b.nama));

console.log(`✅ Ditemukan: ${query2.length} karyawan\n`);
query2.forEach((k) => {
  console.log(
    `  • ${k.nama.padEnd(18)} | ${k.divisi.padEnd(10)} | ${rupiah(k.gaji)} | ${k.status}`
  );
});

// ============================================================
// AGGREGATION PIPELINE:
// Tahap 1 - $match  : hanya karyawan status "Tetap"
// Tahap 2 - $group  : kelompokkan per divisi
// Tahap 3 - $sort   : urutkan rata-rata gaji tertinggi (BONUS)
// ============================================================
console.log("\n" + separator);
console.log("📊  AGGREGATION PIPELINE: Laporan Gaji per Divisi");
console.log("    Pipeline: $match → $group → $sort (bonus)");
console.log(separator);

// Tahap 1: $match - hanya karyawan Tetap
const stage1_match = karyawan.filter((k) => k.status === "Tetap");
console.log(`\n  ▶ Tahap 1 [$match] status:"Tetap" → ${stage1_match.length} dokumen lolos`);

// Tahap 2: $group - kelompokkan per divisi
const grouped = {};
stage1_match.forEach((k) => {
  if (!grouped[k.divisi]) {
    grouped[k.divisi] = { jumlah: 0, totalGaji: 0, min: Infinity, max: 0 };
  }
  grouped[k.divisi].jumlah += 1;
  grouped[k.divisi].totalGaji += k.gaji;
  grouped[k.divisi].min = Math.min(grouped[k.divisi].min, k.gaji);
  grouped[k.divisi].max = Math.max(grouped[k.divisi].max, k.gaji);
});

let stage2_group = Object.entries(grouped).map(([divisi, val]) => ({
  divisi,
  jumlah_karyawan: val.jumlah,
  rata_rata_gaji: Math.round(val.totalGaji / val.jumlah),
  total_gaji: val.totalGaji,
  gaji_tertinggi: val.max,
  gaji_terendah: val.min,
}));

console.log(`  ▶ Tahap 2 [$group]   grouped by divisi → ${stage2_group.length} grup`);

// Tahap 3 (BONUS): $sort - urutkan rata-rata gaji tertinggi
const stage3_sort = stage2_group.sort((a, b) => b.rata_rata_gaji - a.rata_rata_gaji);
console.log(`  ▶ Tahap 3 [$sort]    rata_rata_gaji: -1 (tertinggi ke terendah)\n`);

// Tampilkan hasil
console.log(
  "  Divisi      | Jml | Rata-rata Gaji  | Total Gaji      | Tertinggi     | Terendah"
);
console.log(
  "  ------------|-----|-----------------|-----------------|---------------|----------------"
);
stage3_sort.forEach((r) => {
  console.log(
    `  ${r.divisi.padEnd(11)} | ${String(r.jumlah_karyawan).padStart(3)} | ${rupiah(r.rata_rata_gaji).padEnd(15)} | ${rupiah(r.total_gaji).padEnd(15)} | ${rupiah(r.gaji_tertinggi).padEnd(13)} | ${rupiah(r.gaji_terendah)}`
  );
});

console.log("\n" + separator);
console.log("✅  Demo selesai. Semua query & aggregation pipeline berjalan.");
console.log(separator + "\n");
