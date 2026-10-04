// controllers/upload.controller.ts
// Controller upload ảnh — nhận file từ Multer, gửi lên Telegram, trả URL proxy

import { Request, Response, NextFunction } from 'express';
import { uploadToTelegram, downloadFile } from '../services/telegram.service.js';
import ApiError from '../utils/ApiError.js';

// =============================================
// POST /api/upload/image — Upload 1 ảnh (PRIVATE)
// =============================================
export const uploadImage = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Multer đã parse file → req.file
        if (!req.file) {
            throw new ApiError(400, 'Vui lòng chọn file ảnh để upload');
        }

        // Upload lên Telegram
        const { file_id, file_unique_id } = await uploadToTelegram(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        // Trả về URL proxy để client sử dụng
        const imageUrl = `/api/upload/image/${file_id}`;

        res.status(200).json({
            success: true,
            message: 'Upload ảnh thành công',
            data: {
                url: imageUrl,
                file_id,
                file_unique_id,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// POST /api/upload/images — Upload nhiều ảnh (PRIVATE)
// =============================================
export const uploadImages = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            throw new ApiError(400, 'Vui lòng chọn ít nhất 1 file ảnh để upload');
        }

        // Upload từng file lên Telegram song song
        const uploadPromises = files.map(async (file) => {
            const { file_id, file_unique_id } = await uploadToTelegram(
                file.buffer,
                file.originalname,
                file.mimetype
            );

            return {
                url: `/api/upload/image/${file_id}`,
                file_id,
                file_unique_id,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
            };
        });

        const results = await Promise.all(uploadPromises);

        res.status(200).json({
            success: true,
            message: `Upload ${results.length} ảnh thành công`,
            data: results,
        });
    } catch (error) {
        next(error);
    }
};

// =============================================
// GET /api/upload/image/:fileId — Serve ảnh qua proxy (PUBLIC)
// =============================================
export const serveImage = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { fileId } = req.params;

        if (!fileId) {
            throw new ApiError(400, 'Thiếu file ID');
        }

        // Download ảnh từ Telegram
        const { buffer, contentType } = await downloadFile(fileId as string);

        // Set headers cho response
        res.set({
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=86400', // Cache 24 giờ
        });

        // Gửi binary data
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};
