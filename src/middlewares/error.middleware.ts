// middlewares/error.middleware.ts
// Error handler tập trung — bắt tất cả lỗi và trả response thống nhất

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log lỗi ra console (debug)
    console.error('❌ Error:', err.message);

    // Lỗi Multer (file upload)
    if (err instanceof multer.MulterError) {
        const multerMessages: Record<string, string> = {
            LIMIT_FILE_SIZE: 'File quá lớn. Kích thước tối đa cho phép là 10MB',
            LIMIT_FILE_COUNT: 'Số lượng file vượt quá giới hạn cho phép',
            LIMIT_UNEXPECTED_FILE: 'Tên field upload không đúng hoặc vượt quá số lượng file',
            LIMIT_PART_COUNT: 'Quá nhiều phần trong form data',
            LIMIT_FIELD_KEY: 'Tên field quá dài',
            LIMIT_FIELD_VALUE: 'Giá trị field quá dài',
            LIMIT_FIELD_COUNT: 'Quá nhiều field trong form',
        };

        res.status(400).json({
            success: false,
            message: multerMessages[err.code] || `Lỗi upload file: ${err.message}`,
        });
        return;
    }

    // Nếu là ApiError (lỗi do mình throw)
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Lỗi validation của Mongoose
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: err.message,
        });
        return;
    }

    // Lỗi duplicate key (email trùng, slug trùng, ...)
    if ((err as any).code === 11000) {
        res.status(409).json({
            success: false,
            message: 'Dữ liệu đã tồn tại (trùng lặp)',
        });
        return;
    }

    // Lỗi CastError (ObjectId không hợp lệ)
    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: 'ID không hợp lệ',
        });
        return;
    }

    // Lỗi không xác định → 500 Internal Server Error
    res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống, vui lòng thử lại sau',
    });
};

export default errorHandler;
