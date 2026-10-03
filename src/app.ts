import express from 'express';

// Load biến môi trường từ file .env
import 'dotenv/config';

// Import router chính (gom tất cả routes)
import router from './routes/index.js';

// Import kết nối database
import connectDB from './config/database.js';

// Import error handler middleware
import errorHandler from './middlewares/error.middleware.js';

const app = express();
const port = process.env.PORT || 2727;

// ========================
// Middlewares toàn cục
// ========================

// express.json() — cho phép đọc dữ liệu JSON từ body request
// Ví dụ: client gửi { "email": "abc@mail.com" } → req.body.email = "abc@mail.com"
app.use(express.json());

// express.urlencoded() — cho phép đọc dữ liệu từ form HTML
app.use(express.urlencoded({ extended: true }));

// ========================
// Routes
// ========================

// Mount tất cả routes với prefix /api
// Kết quả: /api/auth/register, /api/auth/login, /api/news, ...
app.use('/api', router);

// Route mặc định để kiểm tra server chạy chưa
app.get('/', (req, res) => { res.send('NewsHub API is running! 🚀'); });

// ========================
// Error Handler (phải đặt SAU tất cả routes)
// ========================
app.use(errorHandler);

// ========================
// Start server + Connect DB
// ========================
const startServer = async () => {
    // Kết nối MongoDB trước khi start server
    await connectDB();

    app.listen(port, () => {
        return console.log(`Express is listening at http://localhost:${port}`);
    });
};

startServer();