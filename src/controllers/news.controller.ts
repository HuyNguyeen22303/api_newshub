// news.controller.ts
// Controller tin tức — nhận request, gọi service, trả response

import { Request, Response, NextFunction } from 'express';
import {
    getAllNewsService,
    getNewsByIdService,
    createNewsService,
    updateNewsService,
    deleteNewsService,
    approveNewsService,
    rejectNewsService,
    getPendingNewsService,
} from '../services/news.service.js';
import { uploadToTelegram } from '../services/telegram.service.js';
import ApiError from '../utils/ApiError.js';

// =============================================
// GET /api/news — Lấy danh sách tin tức (PUBLIC)
// =============================================
export const getAllNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page, limit, search, category, sortBy, order } = req.query;

        const result = await getAllNewsService({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search: search as string,
            category: category as string,
            sortBy: sortBy as string,
            order: order as 'asc' | 'desc',
        });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách tin tức thành công',
            data: result.news,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// GET /api/news/:id — Lấy chi tiết 1 tin tức (PUBLIC)
// =============================================
export const getNewsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const news = await getNewsByIdService(id as string);

        res.status(200).json({
            success: true,
            message: 'Lấy chi tiết tin tức thành công',
            data: news,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// POST /api/news — Tạo tin tức mới (PRIVATE)
// =============================================
export const createNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, content, summary, category, tags, status } = req.body;

        if (!title || !content || !category) {
            throw new ApiError(400, 'Vui lòng nhập đầy đủ title, content, category');
        }

        // Nếu có file ảnh thumbnail → upload lên Telegram
        let thumbnail: string | undefined;
        if (req.file) {
            const { file_id } = await uploadToTelegram(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype
            );
            thumbnail = `/api/upload/image/${file_id}`;
        }

        const news = await createNewsService(
            { title, content, summary, category, tags, thumbnail, status },
            req.user!._id,
            req.user!.role
        );

        const message = req.user!.role === 'reporter'
            ? 'Tạo tin tức thành công, đang chờ biên tập viên/admin duyệt'
            : 'Tạo tin tức thành công';

        res.status(201).json({
            success: true,
            message,
            data: news,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// PUT /api/news/:id — Cập nhật tin tức (PRIVATE)
// =============================================
export const updateNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Nếu có file ảnh thumbnail mới → upload lên Telegram
        if (req.file) {
            const { file_id } = await uploadToTelegram(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype
            );
            req.body.thumbnail = `/api/upload/image/${file_id}`;
        }

        const news = await updateNewsService(id as string, req.body, req.user!._id, req.user!.role);

        res.status(200).json({
            success: true,
            message: 'Cập nhật tin tức thành công',
            data: news,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// DELETE /api/news/:id — Xóa tin tức (PRIVATE)
// =============================================
export const deleteNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        await deleteNewsService(id as string, req.user!._id, req.user!.role);

        res.status(200).json({
            success: true,
            message: 'Xóa tin tức thành công',
            data: { id },
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// PATCH /api/news/:id/approve — Admin duyệt bài (ADMIN ONLY)
// =============================================
export const approveNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const news = await approveNewsService(id as string);

        res.status(200).json({
            success: true,
            message: 'Duyệt bài viết thành công',
            data: news,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// PATCH /api/news/:id/reject — Admin từ chối bài (ADMIN ONLY)
// =============================================
export const rejectNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const result = await rejectNewsService(id as string, reason);

        res.status(200).json({
            success: true,
            message: 'Từ chối bài viết',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// GET /api/news/pending — Danh sách bài chờ duyệt (ADMIN ONLY)
// =============================================
export const getPendingNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page, limit } = req.query;
        const result = await getPendingNewsService({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
        });

        res.status(200).json({
            success: true,
            message: 'Danh sách bài chờ duyệt',
            data: result.news,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};
