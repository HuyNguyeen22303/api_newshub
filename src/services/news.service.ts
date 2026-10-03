// services/news.service.ts
// Business logic cho tin tức: CRUD + search + pagination

import News, { INews } from '../models/news.model.js';
import ApiError from '../utils/ApiError.js';

// ==============================
// Interface cho query params
// ==============================
interface GetAllNewsQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

// ==============================
// GET ALL — Danh sách tin tức (có phân trang, lọc, tìm kiếm)
// ==============================
export const getAllNewsService = async (query: GetAllNewsQuery) => {
    const {
        page = 1,
        limit = 10,
        search,
        category,
        sortBy = 'createdAt',
        order = 'desc',
    } = query;

    // Build filter object
    const filter: Record<string, any> = {
        isDeleted: false,
        status: 'published',
    };

    // Lọc theo category
    if (category) {
        filter.category = category;
    }

    // Tìm kiếm theo title hoặc summary (text index)
    if (search) {
        filter.$text = { $search: search };
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {
        [sortBy]: order === 'asc' ? 1 : -1,
    };

    // Tính skip cho phân trang
    const skip = (page - 1) * limit;

    // Query database
    const [news, total] = await Promise.all([
        News.find(filter)
            .populate('author', 'name avatar')  // Chỉ lấy name & avatar của author
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),                              // Trả plain object (nhanh hơn)
        News.countDocuments(filter),
    ]);

    return {
        news,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ==============================
// GET BY ID — Chi tiết 1 tin tức + tăng viewCount
// ==============================
export const getNewsByIdService = async (id: string) => {
    const news = await News.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $inc: { viewCount: 1 } },     // Tăng viewCount lên 1
        { new: true }                    // Trả về document đã cập nhật
    )
        .populate('author', 'name avatar email')
        .lean();

    if (!news) {
        throw new ApiError(404, 'Không tìm thấy tin tức');
    }

    return news;
};

// ==============================
// CREATE — Tạo tin tức mới
// ==============================
export const createNewsService = async (
    data: {
        title: string;
        content: string;
        summary?: string;
        category: string;
        tags?: string[];
        thumbnail?: string;
        status?: string;
    },
    authorId: string,
    userRole: string
) => {
    // User thường → bắt buộc status = 'pending' (chờ admin duyệt)
    // Admin/Editor → được chọn status tùy ý
    let status = data.status || 'draft';
    if (userRole === 'user') {
        status = 'pending';
    }

    const news = await News.create({
        ...data,
        status,
        author: authorId,
    });

    return news;
};

// ==============================
// UPDATE — Cập nhật tin tức
// ==============================
export const updateNewsService = async (
    id: string,
    updateData: Partial<INews>,
    userId: string,
    userRole: string
) => {
    // Tìm tin tức
    const news = await News.findOne({ _id: id, isDeleted: false });

    if (!news) {
        throw new ApiError(404, 'Không tìm thấy tin tức');
    }

    // Kiểm tra quyền: admin sửa được tất cả, user/editor chỉ sửa bài của mình
    if (userRole !== 'admin' && news.author.toString() !== userId) {
        throw new ApiError(403, 'Bạn không có quyền sửa bài viết này');
    }

    // Cập nhật
    Object.assign(news, updateData);
    await news.save(); // Trigger pre-save hook (update slug nếu title đổi)

    return news;
};

// ==============================
// DELETE — Xóa mềm tin tức
// ==============================
export const deleteNewsService = async (id: string, userId: string, userRole: string) => {
    const news = await News.findOne({ _id: id, isDeleted: false });

    if (!news) {
        throw new ApiError(404, 'Không tìm thấy tin tức');
    }

    // Kiểm tra quyền: admin xóa được tất cả, user/editor chỉ xóa bài của mình
    if (userRole !== 'admin' && news.author.toString() !== userId) {
        throw new ApiError(403, 'Bạn không có quyền xóa bài viết này');
    }

    // Soft delete — không xóa thật
    news.isDeleted = true;
    await news.save();

    return news;
};

// ==============================
// APPROVE — Admin duyệt bài viết
// ==============================
export const approveNewsService = async (id: string) => {
    const news = await News.findOne({ _id: id, isDeleted: false });

    if (!news) {
        throw new ApiError(404, 'Không tìm thấy tin tức');
    }

    if (news.status !== 'pending') {
        throw new ApiError(400, `Chỉ duyệt được bài đang ở trạng thái pending. Bài này đang ở: ${news.status}`);
    }

    news.status = 'published';
    news.publishedAt = new Date();
    await news.save();

    return news;
};

// ==============================
// REJECT — Admin từ chối bài viết
// ==============================
export const rejectNewsService = async (id: string, reason?: string) => {
    const news = await News.findOne({ _id: id, isDeleted: false });

    if (!news) {
        throw new ApiError(404, 'Không tìm thấy tin tức');
    }

    if (news.status !== 'pending') {
        throw new ApiError(400, `Chỉ từ chối được bài đang ở trạng thái pending. Bài này đang ở: ${news.status}`);
    }

    news.status = 'rejected';
    await news.save();

    return { news, reason: reason || 'Không đạt yêu cầu' };
};

// ==============================
// GET PENDING — Danh sách bài chờ duyệt (Admin)
// ==============================
export const getPendingNewsService = async (query: { page?: number; limit?: number }) => {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter = { status: 'pending', isDeleted: false };

    const [news, total] = await Promise.all([
        News.find(filter)
            .populate('author', 'name avatar email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        News.countDocuments(filter),
    ]);

    return {
        news,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
