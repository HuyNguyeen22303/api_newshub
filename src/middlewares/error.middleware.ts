// middlewares/error.middleware.ts
// Error handler tập trung — bắt tất cả lỗi và trả response thống nhất

import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError.js';

const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log lỗi ra console (debug)
    console.error('❌ Error:', err.message);

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
