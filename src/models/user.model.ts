// models/user.model.ts
// Schema User — Quản lý người dùng, xác thực, phân quyền

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, UserRole } from '../constants/index.js';

// ==============================
// Interface
// ==============================
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: string;
    role: UserRole;
    isActive: boolean;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// ==============================
// Schema
// ==============================
const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Tên là bắt buộc'],
            trim: true,
            minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
            maxlength: [50, 'Tên không được quá 50 ký tự'],
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc'],
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
            select: false, // Không trả password khi query
        },
        avatar: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: {
                values: USER_ROLES,
                message: 'Role {VALUE} không hợp lệ',
            },
            default: 'user',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refreshToken: {
            type: String,
            default: null,
            select: false, // Không trả refreshToken khi query
        },
    },
    {
        timestamps: true, // Tự động tạo createdAt & updatedAt
    }
);

// ==============================
// Pre-save hook: Hash password
// ==============================
userSchema.pre('save', async function () {
    // Chỉ hash khi password thay đổi (hoặc tạo mới)
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ==============================
// Method: So sánh password
// ==============================
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
