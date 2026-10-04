// middlewares/upload.middleware.ts
// Cấu hình Multer — parse file upload từ multipart/form-data

import multer from 'multer';
import ApiError from '../utils/ApiError.js';

// ==============================
// Allowed MIME types — chỉ chấp nhận file ảnh
// ==============================
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];

// ==============================
// Multer config
// ==============================
const upload = multer({
    // memoryStorage: giữ file trong RAM dưới dạng Buffer
    // Không ghi file ra disk → gửi thẳng buffer lên Telegram
    storage: multer.memoryStorage(),

    // Giới hạn kích thước file tối đa 10MB
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },

    // File filter — validate loại file trước khi upload
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ApiError(
                400,
                `Định dạng file không hợp lệ: ${file.mimetype}. Chỉ chấp nhận: ${ALLOWED_MIME_TYPES.join(', ')}`
            ));
        }
    },
});

// ==============================
// Export middleware functions
// ==============================

/**
 * Upload 1 ảnh — dùng cho thumbnail, avatar
 * @param fieldName - tên field trong form-data (ví dụ: 'image', 'avatar')
 */
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

/**
 * Upload nhiều ảnh — dùng cho ảnh trong nội dung bài viết
 * @param fieldName - tên field trong form-data
 * @param maxCount - số lượng file tối đa (mặc định 10)
 */
export const uploadMultiple = (fieldName: string, maxCount: number = 10) =>
    upload.array(fieldName, maxCount);

export default upload;
