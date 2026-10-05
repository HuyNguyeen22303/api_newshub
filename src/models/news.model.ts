// models/news.model.ts
// Schema News — Quản lý bài viết tin tức

import mongoose, { Schema, Document } from 'mongoose';
import { NEWS_CATEGORIES, NEWS_STATUS, NewsCategory, NewsStatus } from '../constants/index.js';

// ==============================
// Interface
// ==============================
export interface INews extends Document {
    title: string;
    slug: string;
    content: string;
    summary: string;
    thumbnail: string;
    category: NewsCategory;
    tags: string[];
    author: mongoose.Types.ObjectId;
    status: NewsStatus;
    viewCount: number;
    isDeleted: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// ==============================
// Schema
// ==============================
const newsSchema = new Schema<INews>(
    {
        title: {
            type: String,
            required: [true, 'Tiêu đề là bắt buộc'],
            trim: true,
            maxlength: [200, 'Tiêu đề không được quá 200 ký tự'],
        },
        slug: {
            type: String,
            unique: true,
        },
        content: {
            type: String,
            required: [true, 'Nội dung là bắt buộc'],
        },
        summary: {
            type: String,
            default: '',
            maxlength: [500, 'Tóm tắt không được quá 500 ký tự'],
        },
        thumbnail: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            required: [true, 'Danh mục là bắt buộc'],
            enum: {
                values: NEWS_CATEGORIES,
                message: 'Danh mục {VALUE} không hợp lệ. Các giá trị hợp lệ: ' + NEWS_CATEGORIES.join(', '),
            },
        },
        tags: {
            type: [String],
            default: [],
            set: (tags: unknown): string[] => {
                if (!tags) return [];
                let tagList: string[] = [];
                if (Array.isArray(tags)) {
                    tagList = tags.map((t) => String(t));
                } else if (typeof tags === 'string') {
                    const trimmed = tags.trim();
                    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                        try {
                            const parsed = JSON.parse(trimmed);
                            if (Array.isArray(parsed)) {
                                tagList = parsed.map((t) => String(t));
                            } else {
                                tagList = [trimmed];
                            }
                        } catch {
                            tagList = trimmed.split(',').map((t) => t.trim()).filter(Boolean);
                        }
                    } else if (trimmed.includes(',')) {
                        tagList = trimmed.split(',').map((t) => t.trim()).filter(Boolean);
                    } else if (trimmed.length > 0) {
                        tagList = [trimmed];
                    }
                }
                return tagList.map((tag) => tag.toLowerCase().trim()).filter(Boolean);
            },
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Tác giả là bắt buộc'],
        },
        status: {
            type: String,
            enum: {
                values: NEWS_STATUS,
                message: 'Trạng thái {VALUE} không hợp lệ',
            },
            default: 'draft',
        },
        viewCount: {
            type: Number,
            default: 0,
            min: [0, 'Lượt xem không thể âm'],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// ==============================
// Pre-save hook: Auto-generate slug từ title
// ==============================
newsSchema.pre('save', function () {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .normalize('NFD')                     // Tách dấu tiếng Việt
            .replace(/[\u0300-\u036f]/g, '')      // Xóa dấu
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .replace(/[^a-z0-9\s-]/g, '')         // Xóa ký tự đặc biệt
            .replace(/\s+/g, '-')                 // Thay space bằng -
            .replace(/-+/g, '-')                  // Xóa dấu - liên tiếp
            .trim()
            + '-' + Date.now();                   // Thêm timestamp tránh trùng slug
    }

    // Tự set publishedAt khi status chuyển sang published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

// ==============================
// Indexes — Tối ưu truy vấn
// ==============================
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ author: 1 });
newsSchema.index({ isDeleted: 1, status: 1 });
newsSchema.index({ title: 'text', summary: 'text' });

const News = mongoose.model<INews>('News', newsSchema);
export default News;
