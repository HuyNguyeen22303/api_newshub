// auth.route.ts
// Router xác thực — đăng ký, đăng nhập, refresh token, đăng xuất

import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRouter = Router();

// 🌐 PUBLIC ROUTES
authRouter.post('/register', register);           // POST /api/auth/register
authRouter.post('/login', login);                  // POST /api/auth/login
authRouter.post('/refresh-token', refreshToken);   // POST /api/auth/refresh-token

// 🔒 PRIVATE ROUTES (cần đăng nhập)
authRouter.post('/logout', authMiddleware, logout); // POST /api/auth/logout

export default authRouter;
