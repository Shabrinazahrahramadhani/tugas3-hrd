const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/hrd_perusahaan";

// Middleware
app.use(express.json());

// Koneksi MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Terhubung ke MongoDB:", MONGO_URI))
  .catch((err) => console.error("❌ Gagal koneksi MongoDB:", err.message));

// Routes
const karyawanRoutes = require("./routes/karyawan");
app.use("/api/karyawan", karyawanRoutes);

// Root endpoint - dokumentasi API
app.get("/", (req, res) => {
  res.json({
    judul: "Tugas 3 - Sistem HRD Karyawan",
    endpoints: [
      {
        method: "GET",
        url: "/api/karyawan",
        deskripsi: "Ambil semua data karyawan",
      },
      {
        method: "GET",
        url: "/api/karyawan/tetap-gaji-tinggi",
        deskripsi: "Karyawan Tetap dengan gaji > 7.000.000 ($and, $gt)",
      },
      {
        method: "GET",
        url: "/api/karyawan/divisi-it-finance",
        deskripsi: "Karyawan di divisi IT atau Finance ($in)",
      },
      {
        method: "GET",
        url: "/api/karyawan/laporan-divisi",
        deskripsi: "Laporan agregasi per divisi ($match, $group, $sort)",
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
