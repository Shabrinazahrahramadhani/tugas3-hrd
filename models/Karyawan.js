const mongoose = require("mongoose");

const karyawanSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  divisi: { type: String, required: true },
  gaji: { type: Number, required: true },
  status: { type: String, enum: ["Tetap", "Kontrak"], required: true },
  tahun_masuk: { type: Number, required: true },
});

module.exports = mongoose.model("Karyawan", karyawanSchema);
