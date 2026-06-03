const express = require("express");
const router = express.Router();
const Karyawan = require("../models/Karyawan");

// GET /api/karyawan
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

// GET /api/karyawan/tetap-gaji-tinggi
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

// GET /api/karyawan/divisi-it-finance
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

// GET /api/karyawan/laporan-divisi
router.get("/laporan-divisi", async (req, res) => {
  try {
    const hasil = await Karyawan.aggregate([
      {
        $match: { status: "Tetap" },
      },
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
      {
        $sort: { rata_rata_gaji: -1 },
      },
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

module.exports = router;


