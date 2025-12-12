# Sip-Dana-v2
# SipDana: Aplikasi Manajemen Keuangan Pribadi (Full-Stack)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Aplikasi SipDana adalah alat manajemen keuangan pribadi berbasis web yang dirancang untuk membantu pengguna melacak pemasukan, pengeluaran, menetapkan target tabungan, dan menganalisis kesehatan finansial melalui visualisasi data (Dashboard dan Laporan Analisis).

Proyek ini dibangun menggunakan arsitektur Monorepo sederhana dengan dua layanan utama: Frontend (React/Vite) dan Backend (Node.js/Express).

## 🛠️ Stack Teknologi

| Bagian | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | UI/UX responsif, Fast Refresh development. |
| **Styling** | React Bootstrap | Komponen UI yang siap pakai dan mudah diakses. |
| **Visualisasi** | Chart.js, react-chartjs-2 | Untuk menampilkan tren keuangan (Bar Chart). |
| **Backend** | Node.js, Express.js | API RESTful untuk komunikasi data. |
| **Database** | MySQL (via `mysql2`) | Penyimpanan data pengguna, transaksi, saldo, dan target. |
| **Autentikasi** | JWT (JSON Web Tokens) | Untuk otorisasi pengguna pada rute terproteksi. |

## 🚀 Fitur Utama

* **Autentikasi Aman:** Login dan Registrasi pengguna dengan hash password (bcryptjs) dan otorisasi JWT.
* **Dashboard Real-Time:** Menampilkan saldo kumulatif dan ringkasan Pemasukan/Pengeluaran bulan berjalan.
* **Pencatatan Transaksi:** Modal input cepat untuk mencatat Pemasukan dan Pengeluaran.
* **Riwayat Transaksi:** Sidebar kanan menampilkan riwayat terbaru di semua halaman.
* **Laporan Analisis:** Grafik Bar Chart historis, total Neto, Top Kategori Pengeluaran, dan rekomendasi metode pengelolaan keuangan (misalnya, Pay Yourself First).
* **Target Menabung:** Membuat dan melacak progres target tabungan spesifik.
* **Pengaturan Akun:** Mengubah nama, email, dan kata sandi pengguna.

## 💾 Struktur Database (MySQL)

Berikut adalah tabel inti yang digunakan untuk menjalankan fungsionalitas aplikasi:

| Tabel | Keterangan | Hubungan Kunci |
| :--- | :--- | :--- |
| `user` | Data pengguna (Auth). | `id_user` |
| `kategori` | Data master untuk klasifikasi transaksi. | `id_kategori` |
| `saldo` | **Total saldo kumulatif** (satu baris per user). | `id_user` |
| `transaksi` | Semua catatan pemasukan/pengeluaran. | `id_user`, `id_kategori` |
| `targetmenabung` | Tujuan menabung spesifik pengguna. | `id_user` |
| `metodemengelola`| Data master untuk rekomendasi strategi keuangan. | - |

## ⚙️ Panduan Instalasi dan Menjalankan Proyek

Pastikan Anda memiliki Node.js, npm, dan server MySQL aktif di sistem Anda (misalnya, XAMPP, Laragon, atau MySQL Workbench).

### Langkah 1: Clone Repositori

```bash
git clone [https://github.com/](https://github.com/)<USERNAME>/sip-dana-app.git
cd sip-dana-app
