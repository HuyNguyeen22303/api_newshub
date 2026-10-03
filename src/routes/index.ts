// routes/index.ts
// Router chính — gom tất cả router con lại 1 chỗ
// Mỗi router con được gắn 1 prefix URL riêng
//
// Sau này thêm route mới chỉ cần:
//   1. Import router con vào
//   2. Thêm 1 dòng router.use('/prefix', routerCon)

import { Router } from 'express';
import authRouter from './auth.route.js';
import newsRouter from './news.route.js';

const router = Router();

// Gắn prefix cho từng nhóm route
router.use('/auth', authRouter);   // /api/auth/register, /api/auth/login
router.use('/news', newsRouter);   // /api/news, /api/news/:id

export default router;
