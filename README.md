# Sip-Dana-v2
<img width="1842" height="998" alt="image" src="https://github.com/user-attachments/assets/cb3d7f2d-531a-4034-be7e-8dc11c07648e" />

# 🏦 SipDana: Smart Personal Finance Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

**SipDana** adalah platform manajemen keuangan pribadi modern yang dirancang untuk membantu pengguna menguasai arus kas mereka. Dengan fitur pelacakan transaksi real-time, visualisasi data cerdas, dan sistem rekomendasi strategi finansial, SipDana membuat pengelolaan uang menjadi lebih "Sip" dan terukur.

---

## ✨ Fitur Utama (End-to-End)

1. **Sistem Autentikasi Ketat:**
   - Registrasi dengan validasi password (Min. 8 karakter, Huruf Kapital, Angka).
   - Login berbasis JWT (JSON Web Token) untuk keamanan sesi.
2. **Dashboard Finansial:**
   - Ringkasan saldo kumulatif, total pemasukan, dan pengeluaran bulan berjalan.
   - Grafik tren keuangan interaktif menggunakan Chart.js.
3. **Manajemen Transaksi:**
   - Pencatatan pemasukan dan pengeluaran dengan kategori yang spesifik.
   - Update saldo otomatis secara real-time menggunakan sistem *database transaction*.
4. **Target Menabung (Saving Goals):**
   - Membuat target tabungan spesifik dengan tenggat waktu.
   - Alokasi saldo virtual ke target tertentu untuk memantau progres persentase.
5. **Analisis Keuangan & Rekomendasi:**
   - Penghitungan Neto otomatis.
   - Rekomendasi metode pengelolaan keuangan (seperti *50/30/20 Rule* atau *Pay Yourself First*) berdasarkan kondisi keuangan user.
6. **Pengaturan Akun:**
   - Update profil (Username & Email) serta perubahan kata sandi dengan validasi keamanan tinggi.

---

## 🛠️ Stack Teknologi & Arsitektur

Aplikasi ini menggunakan arsitektur **Monorepo** yang memisahkan logika server dan antarmuka pengguna secara modular.

| Layer | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | UI responsif, performa tinggi, & Type-safe. |
| **Styling** | React Bootstrap, Bootstrap Icons | Konsistensi desain modern dan minimalis. |
| **Backend** | Node.js, Express.js | API RESTful modular dan scalable. |
| **Database** | MySQL (via `mysql2`) | Penyimpanan data relasional dengan integritas tinggi. |
| **Security** | JWT, BcryptJS | Proteksi password dan otorisasi akses API. |

---

## 📂 Struktur Proyek

```text
Sip_dana/
├── backend/                # API Server (Node.js/Express)
│   ├── src/
│   │   ├── controllers/    # Logika bisnis (Auth, Report, Target, Transaksi, User)
│   │   ├── routes/         # Definisi endpoint API (Routing)
│   │   ├── middleware/     # Proteksi rute (Auth JWT Middleware)
│   │   ├── config/         # Koneksi database MySQL
│   │   └── types/          # Definisi interface/type TypeScript
│   └── .env                # Konfigurasi database & JWT secret
└── frontend/               # User Interface (React/Vite)
    ├── src/
    │   ├── components/     # Komponen UI (Sidebar, Modal, Charts)
    │   ├── pages/          # Halaman utama (Login, Dashboard, Analisis, dll)
    │   ├── services/       # Integrasi API (Axios instance & Services)
    │   ├── context/        # Global state management (AuthContext)
    │   ├── hooks/          # Custom hooks (useTimeFilter, dll)
    │   └── assets/         # Aset gambar, SVG, dan global styling
```
---

## 💾 Skema Database Utama

| Tabel | Keterangan | Hubungan |
| :--- | :--- | :--- |
| `user` | Data akun & password terenkripsi | `id_user` (PK) |
| `transaksi` | Catatan aliran uang | FK: `id_user`, `id_kategori` |
| `saldo` | Total dana kumulatif user | FK: `id_user` |
| `targetmenabung` | Data rencana tabungan & progres | FK: `id_user` |
| `kategori` | Master data kategori transaksi | - |
| `metodemengelola`| Strategi rekomendasi finansial | - |

---

## ⚙️ Cara Instalasi

### 1. Setup Database
* Buat database baru bernama `sip_dana` di MySQL (XAMPP/Laragon).
* Pastikan tabel sudah terkonfigurasi sesuai skema.

### 2. Konfigurasi Backend
Buat file `.env` di dalam folder `backend/`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=sip_dana
JWT_SECRET=rahasia_sipdana_123
```

### 3. Jalankan Aplikasi
Buka dua terminal terpisah untuk menjalankan server dan client:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
---

## 🧪 Catatan Pengujian (QA)

* **Keamanan:** Password di-hash menggunakan **Bcrypt** dan divalidasi ketat di sisi server (Backend).
* **Integritas:** Implementasi **SQL Transaction (ACID)** menjamin saldo tetap akurat meski terjadi kegagalan sistem saat mencatat transaksi.
* **Stabilitas:** Optimasi query menggunakan `ORDER BY` tetap (Fixed Ordering) agar data grafik dan rekomendasi tidak berubah-ubah saat halaman dimuat ulang.
* **User Experience:** Dilengkapi penanganan *state loading* (Spinner) dan notifikasi error yang informatif bagi pengguna.

---
© 2025 **SipDana Team**. Dikembangkan untuk Proyek Mata Kuliah Implementasi dan Pengujian Perangkat Lunak (IPPL).
