const express = require("express");
const router = express.Router();
const Karyawan = require("../models/Karyawan");

// ============================================================
// ENDPOINT 1: GET semua karyawan
// GET /api/karyawan
// ============================================================
router.get("/", async (req, res) => {
  try {
    const data = await Karyawan.find().sort({ nama: 1 });
    res.json({
      status: "success",
      total: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ============================================================
// ENDPOINT 2: Karyawan status "Tetap" DAN gaji > 7.000.000
// GET /api/karyawan/tetap-gaji-tinggi
// Query Operator: $and, $gt
// ============================================================
router.get("/tetap-gaji-tinggi", async (req, res) => {
  try {
    const data = await Karyawan.find({
      $and: [
        { status: "Tetap" },
        { gaji: { $gt: 7000000 } },
      ],
    }).sort({ gaji: -1 });

    res.json({
      status: "success",
      deskripsi: "Karyawan berstatus Tetap dengan gaji di atas Rp 7.000.000",
      operator_digunakan: ["$and", "$gt"],
      total: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ============================================================
// ENDPOINT 3: Karyawan dari divisi "IT" ATAU "Finance"
// GET /api/karyawan/divisi-it-finance
// Query Operator: $in
// ============================================================
router.get("/divisi-it-finance", async (req, res) => {
  try {
    const data = await Karyawan.find({
      divisi: { $in: ["IT", "Finance"] },
    }).sort({ divisi: 1, nama: 1 });

    res.json({
      status: "success",
      deskripsi: "Karyawan yang berada di divisi IT atau Finance",
      operator_digunakan: ["$in"],
      total: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ============================================================
// ENDPOINT 4: Laporan agregasi per divisi (hanya karyawan Tetap)
// GET /api/karyawan/laporan-divisi
// Aggregation Pipeline: $match → $group → $sort (bonus)
// ============================================================
router.get("/laporan-divisi", async (req, res) => {
  try {
    const hasil = await Karyawan.aggregate([
      // Tahap 1 - $match: hanya karyawan berstatus "Tetap"
      {
        $match: { status: "Tetap" },
      },
      // Tahap 2 - $group: kelompokkan per divisi, hitung jumlah & rata-rata gaji
      {
        $group: {
          _id: "$divisi",
          jumlah_karyawan: { $sum: 1 },
          rata_rata_gaji: { $avg: "$gaji" },
          total_gaji: { $sum: "$gaji" },
          gaji_tertinggi: { $max: "$gaji" },
          gaji_terendah: { $min: "$gaji" },
        },
      },
      // Tahap 3 (BONUS) - $sort: urutkan berdasarkan rata-rata gaji tertinggi
      {
        $sort: { rata_rata_gaji: -1 },
      },
      // Tahap 4 - $project: rapikan output
      {
        $project: {
          _id: 0,
          divisi: "$_id",
          jumlah_karyawan: 1,
          rata_rata_gaji: { $round: ["$rata_rata_gaji", 0] },
          total_gaji: 1,
          gaji_tertinggi: 1,
          gaji_terendah: 1,
        },
      },
    ]);

    res.json({
      status: "success",
      deskripsi: "Laporan ringkasan gaji per divisi (hanya karyawan Tetap)",
      pipeline: ["$match", "$group", "$sort (bonus)", "$project"],
      total_divisi: hasil.length,
      data: hasil,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});



