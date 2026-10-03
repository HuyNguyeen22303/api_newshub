// auth.controller.ts
// Controller xác thực — nhận request, gọi service, trả response

import { Request, Response, NextFunction } from 'express';
import {
    registerService,
    loginService,
    refreshTokenService,
    logoutService,
} from '../services/auth.service.js';
import ApiError from '../utils/ApiError.js';

// =============================================
// POST /api/auth/register — Đăng ký tài khoản
// =============================================
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Validate input cơ bản
        if (!name || !email || !password) {
            throw new ApiError(400, 'Vui lòng nhập đầy đủ name, email, password');
        }

        const result = await registerService({ name, email, password });

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// POST /api/auth/login — Đăng nhập
// =============================================
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, 'Vui lòng nhập email và password');
        }

        const result = await loginService({ email, password });

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// POST /api/auth/refresh-token — Cấp access token mới
// =============================================
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ApiError(400, 'Refresh token là bắt buộc');
        }

        const result = await refreshTokenService(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Cấp token mới thành công',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// POST /api/auth/logout — Đăng xuất
// =============================================
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await logoutService(req.user!._id);

        res.status(200).json({
            success: true,
            message: 'Đăng xuất thành công',
        });
    } catch (error) {
        next(error);
    }
};
