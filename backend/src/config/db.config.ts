import mysql, { PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

// Muat variabel lingkungan dari file .env
dotenv.config();

// Konfigurasi koneksi
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Buat pool koneksi 
const pool = mysql.createPool(dbConfig);

// Fungsi untuk menguji koneksi database saat server berjalan
export const testDbConnection = async () => {
    try {
        // Tipe data yang diambil dari pool.getConnection() adalah PoolConnection
        const connection: PoolConnection = await pool.getConnection(); 
        
        console.log('✅ Koneksi Database MySQL Berhasil!');
        connection.release(); // Sekarang .release() dikenali
    } catch (error) {
        console.error('❌ Gagal terhubung ke database MySQL:', error);
        // Hentikan aplikasi jika koneksi DB gagal
        process.exit(1); 
    }
};

// Ekspor pool untuk digunakan di Controllers/Services
export default pool;