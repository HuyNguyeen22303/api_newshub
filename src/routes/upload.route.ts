// routes/upload.route.ts
// Router upload ảnh — PUBLIC (serve) + PRIVATE (upload)

import { Router } from 'express';
import { uploadImage, uploadImages, serveImage } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.middleware.js';

const uploadRouter = Router();

// ==================
// 🌐 PUBLIC ROUTES
// ==================
uploadRouter.get('/image/:fileId', serveImage);   // GET /api/upload/image/:fileId — Serve ảnh

// ==================
// 🔒 PRIVATE ROUTES (cần đăng nhập)
// ==================
uploadRouter.post(
    '/image',
    authMiddleware,
    uploadSingle('image'),
    uploadImage
);   // POST /api/upload/image — Upload 1 ảnh

uploadRouter.post(
    '/images',
    authMiddleware,
    uploadMultiple('images', 10),
    uploadImages
);  // POST /api/upload/images — Upload nhiều ảnh (tối đa 10)

export default uploadRouter;
