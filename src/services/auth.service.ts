// services/auth.service.ts
// Business logic cho xác thực: register, login, refresh token, logout

import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

// ==============================
// Helper: Tạo Access Token (ngắn hạn)
// ==============================
const generateAccessToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
    );
};

// ==============================
// Helper: Tạo Refresh Token (dài hạn)
// ==============================
const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: '7d' }
    );
};

// ==============================
// REGISTER — Đăng ký tài khoản
// ==============================
export const registerService = async (data: {
    name: string;
    email: string;
    password: string;
}) => {
    const { name, email, password } = data;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'Email đã được sử dụng');
    }

    // Tạo user mới (password sẽ tự động hash nhờ pre-save hook)
    const user = await User.create({ name, email, password });

    // Tạo tokens
    const accessToken = generateAccessToken(user._id as string);
    const refreshToken = generateRefreshToken(user._id as string);

    // Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save();

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
        accessToken,
        refreshToken,
    };
};

// ==============================
// LOGIN — Đăng nhập
// ==============================
export const loginService = async (data: {
    email: string;
    password: string;
}) => {
    const { email, password } = data;

    // Tìm user theo email, lấy kèm password (vì select: false)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
        throw new ApiError(403, 'Tài khoản đã bị khóa');
    }

    // So sánh password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
    }

    // Tạo tokens
    const accessToken = generateAccessToken(user._id as string);
    const refreshToken = generateRefreshToken(user._id as string);

    // Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save();

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
        accessToken,
        refreshToken,
    };
};

// ==============================
// REFRESH TOKEN — Cấp access token mới
// ==============================
export const refreshTokenService = async (token: string) => {
    // Verify refresh token
    let decoded: jwt.JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload;
    } catch {
        throw new ApiError(401, 'Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Tìm user và kiểm tra refresh token trong DB có khớp không
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
        throw new ApiError(401, 'Refresh token không hợp lệ');
    }

    // Cấp access token mới
    const accessToken = generateAccessToken(user._id as string);

    return { accessToken };
};

// ==============================
// LOGOUT — Đăng xuất
// ==============================
export const logoutService = async (userId: string) => {
    // Xóa refresh token khỏi DB → token cũ không dùng được nữa
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};
