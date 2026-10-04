// services/telegram.service.ts
// Service giao tiếp với Telegram Bot API — upload & serve ảnh

import ApiError from '../utils/ApiError.js';

// ==============================
// Config từ .env
// ==============================
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

/**
 * Kiểm tra Telegram config có sẵn sàng không
 */
const validateConfig = () => {
    if (!BOT_TOKEN || !CHAT_ID) {
        throw new ApiError(
            500,
            'Thiếu cấu hình Telegram. Vui lòng set TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID trong .env'
        );
    }
};

// ==============================
// Interface cho response từ Telegram API
// ==============================
interface TelegramPhotoSize {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
}

interface TelegramSendPhotoResponse {
    ok: boolean;
    result?: {
        photo?: TelegramPhotoSize[];
        document?: {
            file_id: string;
            file_unique_id: string;
            file_name?: string;
            mime_type?: string;
            file_size?: number;
        };
    };
    description?: string;
}

interface TelegramGetFileResponse {
    ok: boolean;
    result?: {
        file_id: string;
        file_unique_id: string;
        file_size?: number;
        file_path?: string;
    };
    description?: string;
}

// ==============================
// Upload ảnh lên Telegram
// ==============================

/**
 * Upload 1 ảnh lên Telegram qua sendPhoto API
 * @param buffer - Buffer của file ảnh
 * @param filename - Tên file gốc
 * @param mimetype - MIME type (ví dụ: image/jpeg)
 * @returns { file_id, file_unique_id, url } — url là proxy URL để serve ảnh
 */
export const uploadToTelegram = async (
    buffer: Buffer,
    filename: string,
    mimetype: string
): Promise<{ file_id: string; file_unique_id: string }> => {
    validateConfig();

    // Tạo FormData để gửi multipart/form-data
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID!);

    // Tạo Blob từ buffer
    const blob = new Blob([new Uint8Array(buffer)], { type: mimetype });
    formData.append('photo', blob, filename);

    // Gọi Telegram API
    const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
        method: 'POST',
        body: formData,
    });

    const data = (await response.json()) as TelegramSendPhotoResponse;

    if (!data.ok || !data.result?.photo) {
        console.error('❌ Telegram sendPhoto error:', data.description);
        throw new ApiError(
            500,
            `Upload ảnh lên Telegram thất bại: ${data.description || 'Unknown error'}`
        );
    }

    // Lấy ảnh có resolution cao nhất (phần tử cuối mảng)
    const photo = data.result.photo[data.result.photo.length - 1];

    return {
        file_id: photo.file_id,
        file_unique_id: photo.file_unique_id,
    };
};

// ==============================
// Lấy URL download tạm thời từ file_id
// ==============================

/**
 * Gọi getFile API → lấy file_path → trả về URL download
 * Lưu ý: URL này chỉ có hiệu lực ~1 giờ
 */
export const getFileUrl = async (fileId: string): Promise<string> => {
    validateConfig();

    const response = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
    const data = (await response.json()) as TelegramGetFileResponse;

    if (!data.ok || !data.result?.file_path) {
        throw new ApiError(
            500,
            `Không lấy được file từ Telegram: ${data.description || 'Unknown error'}`
        );
    }

    return `${TELEGRAM_FILE_API}/${data.result.file_path}`;
};

// ==============================
// Download file từ Telegram → trả về Buffer
// ==============================

/**
 * Download ảnh từ Telegram servers
 * @param fileId - file_id từ Telegram
 * @returns { buffer, contentType } — dùng để serve cho client
 */
export const downloadFile = async (
    fileId: string
): Promise<{ buffer: Buffer; contentType: string }> => {
    // Bước 1: Lấy URL download
    const fileUrl = await getFileUrl(fileId);

    // Bước 2: Download file
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new ApiError(500, 'Download ảnh từ Telegram thất bại');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return { buffer, contentType };
};
