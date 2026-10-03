// utils/ApiError.ts
// Custom error class — dùng để throw lỗi có status code

class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';

        // Fix prototype chain cho TypeScript
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export default ApiError;
