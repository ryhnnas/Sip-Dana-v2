import { Router } from 'express';
// FIX: Hapus import 'getTransactions' yang tidak ada
import { createTransaction } from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // Lindungi semua endpoint transaksi

router.post('/', createTransaction); // POST /api/transactions

// Jika Anda ingin menambahkan GET /api/transactions (untuk daftar transaksi), 
// Anda harus menambahkan fungsi 'getTransactions' di controller terlebih dahulu.

export default router;