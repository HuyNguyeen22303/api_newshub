// news.route.ts
// Router tin tức — PUBLIC (đọc) + PRIVATE (thêm/sửa/xóa) + ADMIN (duyệt bài)

import { Router } from 'express';
import {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    approveNews,
    rejectNews,
    getPendingNews,
} from '../controllers/news.controller.js';
import { authMiddleware, adminMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const newsRouter = Router();

// ==================
// 🌐 PUBLIC ROUTES
// ==================
newsRouter.get('/', getAllNews);           // GET /api/news         — Danh sách tin tức
newsRouter.get('/pending', authMiddleware, adminMiddleware, getPendingNews);  // GET /api/news/pending — Bài chờ duyệt (ADMIN)
newsRouter.get('/:id', getNewsById);      // GET /api/news/:id     — Chi tiết 1 tin

// ==================
// 🔒 AUTHORIZED ROUTES (chỉ phóng viên, biên tập viên, admin)
// ==================
const newsCreators = authorizeRoles('admin', 'editor', 'reporter');

newsRouter.post('/', authMiddleware, newsCreators, uploadSingle('thumbnail'), createNews);         // POST   /api/news      — Tạo tin mới
newsRouter.put('/:id', authMiddleware, newsCreators, uploadSingle('thumbnail'), updateNews);       // PUT    /api/news/:id  — Cập nhật tin
newsRouter.delete('/:id', authMiddleware, newsCreators, deleteNews);    // DELETE /api/news/:id  — Xóa tin

// ==================
// 👑 ADMIN ROUTES (chỉ admin)
// ==================
newsRouter.patch('/:id/approve', authMiddleware, adminMiddleware, approveNews);   // PATCH /api/news/:id/approve — Duyệt bài
newsRouter.patch('/:id/reject', authMiddleware, adminMiddleware, rejectNews);     // PATCH /api/news/:id/reject  — Từ chối bài

export default newsRouter;
