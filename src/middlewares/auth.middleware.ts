// middlewares/auth.middleware.ts
// Middleware xác thực JWT — bảo vệ các route private

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

// Mở rộng Request để thêm trường user
declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: string;
                name: string;
                email: string;
                role: string;
            };
        }
    }
}

// ==============================
// Auth Middleware — Verify Access Token
// ==============================
export const authMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Lấy token từ header: "Bearer <token>"
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'Không tìm thấy token xác thực');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload;

        // Tìm user trong DB
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            throw new ApiError(401, 'Token không hợp lệ hoặc tài khoản đã bị khóa');
        }

        // Gắn user info vào request để controller dùng
        req.user = {
            _id: (user._id as string).toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(401, 'Token không hợp lệ hoặc đã hết hạn'));
        }
    }
};

// ==============================
// Admin Middleware — Chỉ cho phép admin
// Phải dùng SAU authMiddleware
// ==============================
export const adminMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    if (req.user?.role !== 'admin') {
        next(new ApiError(403, 'Chỉ admin mới có quyền thực hiện thao tác này'));
        return;
    }
    next();
};
