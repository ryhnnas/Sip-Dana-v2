import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.config';

// Import Routes
import authRoutes from './routes/auth.routes'; 
import transactionRoutes from './routes/transaction.routes'; 
import utilityRoutes from './routes/utility.routes';   
import reportRoutes from './routes/report.routes';     
import userRoutes from './routes/user.routes'; 
import targetRoutes from './routes/target.routes'; // <-- Wajib ada!

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); 

// Gunakan Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes); 
app.use('/api/utilities', utilityRoutes);   
app.use('/api/reports', reportRoutes);      
app.use('/api/users', userRoutes); 
app.use('/api/targets', targetRoutes); 

const startServer = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('✅ Koneksi Database MySQL Berhasil!');
        
        app.listen(port, () => {
            console.log(`⚡ Server berjalan di http://localhost:${port}`);
        });

    } catch (error) {
        console.error('❌ Gagal terhubung ke database MySQL:', error);
    }
};

startServer();