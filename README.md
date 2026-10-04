# 📰 NewsHub API

RESTful API cho hệ thống quản lý tin tức, xây dựng với **Node.js**, **Express**, **TypeScript**, **MongoDB** và tích hợp **Telegram Bot Storage** để lưu trữ hình ảnh.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (Access Token + Refresh Token)
- **Password**: bcryptjs
- **File Upload**: Multer (Memory Storage) + Telegram Bot API (Storage Proxy)

## 🚀 Cài đặt & Chạy

```bash
# Clone repo
git clone https://github.com/HuyNguyeen22303/api_newshub.git
cd api_newshub

# Cài dependencies
npm install

# Tạo file .env (xem mẫu bên dưới)

# Chạy dev server
npm run dev

# Seed dữ liệu mẫu
npm run seed
```

### Biến môi trường (`.env`)

```env
PORT=2727
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

---

## 👤 Tài khoản mẫu (sau khi seed)

| Role | Email | Password | Ghi chú |
|------|-------|----------|---------|
| 🔴 Admin | `admin@newshub.com` | `admin123` | Quyền cao nhất hệ thống |
| 🟡 Editor | `editor@newshub.com` | `editor123` | Quản lý & chỉnh sửa tất cả bài viết |
| 🔵 Reporter | `reporter@newshub.com` | `phongvien123` | Tạo bài viết (chờ duyệt/nháp), sửa/xóa bài của mình |
| 🟢 User | `user@newshub.com` | `user123` | Người dùng thông thường (chỉ đọc) |


### Phân quyền

| Quyền | User | Reporter | Editor | Admin |
|-------|:----:|:--------:|:------:|:-----:|
| Đọc tin tức | ✅ | ✅ | ✅ | ✅ |
| Tạo tin tức | ❌ | ✅ (chờ duyệt/nháp) | ✅ | ✅ |
| Sửa tin tức (của mình) | ❌ | ✅ | ✅ | ✅ |
| Sửa tin tức (của người khác) | ❌ | ❌ | ✅ | ✅ |
| Xóa tin tức (của mình) | ❌ | ✅ | ✅ | ✅ |
| Xóa tin tức (của người khác) | ❌ | ❌ | ✅ | ✅ |
| Duyệt / Từ chối bài | ❌ | ❌ | ❌ | ✅ |
| Xem bài chờ duyệt | ❌ | ❌ | ❌ | ✅ |

---

## 📡 API Endpoints

**Base URL**: `http://localhost:2727/api`

### 🔐 Authentication

#### Đăng ký tài khoản

```
POST /api/auth/register
```

**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "_id": "...",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "role": "user",
      "avatar": ""
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### Đăng nhập

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "admin@newshub.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin NewsHub",
      "email": "admin@newshub.com",
      "role": "admin",
      "avatar": "https://i.pravatar.cc/150?img=1"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### Refresh Token

```
POST /api/auth/refresh-token
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "message": "Refresh token thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### Đăng xuất 🔒

```
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "message": "Đăng xuất thành công"
}
```

---

### 📰 News

#### Lấy danh sách tin tức (Public)

```
GET /api/news
```

**Query Params:**

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `page` | number | 1 | Trang hiện tại |
| `limit` | number | 10 | Số tin/trang |
| `search` | string | — | Tìm theo tiêu đề, tóm tắt |
| `category` | string | — | Lọc theo danh mục |
| `sortBy` | string | createdAt | Sắp xếp theo field |
| `order` | string | desc | `asc` hoặc `desc` |

**Danh mục hợp lệ:** `technology`, `sports`, `business`, `entertainment`, `health`, `science`, `politics`, `world`, `education`, `lifestyle`

**Ví dụ:**
```
GET /api/news?category=technology&page=1&limit=5&sortBy=viewCount&order=desc
```

**Response (200):**
```json
{
  "message": "Lấy danh sách tin tức thành công",
  "data": [
    {
      "_id": "...",
      "title": "AI đang thay đổi ngành lập trình",
      "slug": "ai-dang-thay-doi-nganh-lap-trinh-1727901234567",
      "summary": "...",
      "category": "technology",
      "tags": ["ai", "lập trình"],
      "author": { "_id": "...", "name": "Admin NewsHub", "avatar": "..." },
      "status": "published",
      "viewCount": 1520,
      "thumbnail": "/api/upload/image/...",
      "createdAt": "2026-10-02T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "totalPages": 3
  }
}
```

---

#### Lấy chi tiết tin tức (Public)

```
GET /api/news/:id
```

> Mỗi lần gọi API này, `viewCount` tự động tăng 1.

**Response (200):**
```json
{
  "message": "Lấy chi tiết tin tức thành công",
  "data": {
    "_id": "...",
    "title": "...",
    "slug": "...",
    "content": "<p>Nội dung HTML...</p>",
    "summary": "...",
    "category": "technology",
    "tags": ["ai", "công nghệ"],
    "author": { "_id": "...", "name": "Admin NewsHub", "email": "admin@newshub.com", "avatar": "..." },
    "status": "published",
    "viewCount": 1521,
    "publishedAt": "2026-10-02T...",
    "createdAt": "2026-10-02T..."
  }
}
```

---

#### Tạo tin tức mới 🔒 (Reporter, Editor, Admin)

```
POST /api/news
```

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data (nếu kèm ảnh) hoặc application/json
```

**Body (multipart/form-data hoặc JSON):**

| Field | Type | Required | Mô tả |
|-------|------|:--------:|-------|
| `title` | string | ✅ | Tiêu đề bài viết |
| `content` | string | ✅ | Nội dung bài viết (HTML/Text) |
| `category` | string | ✅ | Danh mục thuộc `NEWS_CATEGORIES` |
| `summary` | string | ❌ | Tóm tắt ngắn bài viết |
| `tags` | string[] / string | ❌ | Thẻ tag gắn cho bài viết |
| `thumbnail` | File / string | ❌ | File ảnh thumbnail (form-data field `thumbnail`) hoặc URL ảnh |
| `status` | string | ❌ | `draft` hoặc `pending` (Reporter); `published`, `draft`, `pending` (Admin/Editor) |

> ⚠️ **Quy tắc phân quyền tạo bài:**
> - **Reporter**: Tự động chuyển status = `pending` (chờ duyệt) hoặc `draft` (bản nháp).
> - **Editor / Admin**: Mặc định status = `published` (hoặc có thể tùy chọn `draft`, `pending`).

**Response (201):**
```json
{
  "success": true,
  "message": "Tạo tin tức thành công, đang chờ biên tập viên/admin duyệt",
  "data": {
    "_id": "...",
    "title": "Tiêu đề bài viết",
    "slug": "tieu-de-bai-viet-1728045600000",
    "content": "<p>Nội dung...</p>",
    "summary": "Tóm tắt ngắn",
    "category": "technology",
    "tags": ["tech", "ai"],
    "thumbnail": "/api/upload/image/AgACAgIAAxkBAA...",
    "author": "...",
    "status": "pending",
    "viewCount": 0,
    "createdAt": "2026-10-04T..."
  }
}
```

---

#### Cập nhật tin tức 🔒 (Reporter - bài của mình, Editor/Admin - tất cả)

```
PUT /api/news/:id
```

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data (nếu đính kèm file thumbnail mới) hoặc application/json
```

**Body** (chỉ gửi field cần sửa, có thể đính kèm file `thumbnail`):
```json
{
  "title": "Tiêu đề đã sửa",
  "category": "sports"
}
```

> ⚠️ Reporter chỉ sửa được bài **của mình**. Admin và Editor có quyền sửa tất cả các bài.

**Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật tin tức thành công",
  "data": { ... }
}
```

---

#### Xóa tin tức 🔒 (Reporter - bài của mình, Editor/Admin - tất cả)

```
DELETE /api/news/:id
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

> Sử dụng **soft delete** — bài viết không bị xóa khỏi DB, chỉ đánh dấu `isDeleted: true`.
> ⚠️ Reporter chỉ xóa được bài **của mình**. Admin và Editor có quyền xóa tất cả các bài.

**Response (200):**
```json
{
  "success": true,
  "message": "Xóa tin tức thành công",
  "data": { "id": "..." }
}
```

---

#### Duyệt bài viết 🔒👑 (Admin only)

```
PATCH /api/news/:id/approve
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

> Chỉ duyệt được bài đang ở trạng thái `pending`. Bài viết sau khi duyệt sẽ chuyển sang trạng thái `published` và cập nhật `publishedAt`.

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt bài viết thành công",
  "data": { ... }
}
```

---

#### Từ chối bài viết 🔒👑 (Admin only)

```
PATCH /api/news/:id/reject
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body (optional):**
```json
{
  "reason": "Nội dung chưa đạt yêu cầu kiểm duyệt"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Từ chối bài viết",
  "data": {
    "news": { ... },
    "reason": "Nội dung chưa đạt yêu cầu kiểm duyệt"
  }
}
```

---

#### Xem bài chờ duyệt 🔒👑 (Admin only)

```
GET /api/news/pending
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Params:** `page`, `limit` (tương tự GET /api/news)

**Response (200):**
```json
{
  "success": true,
  "message": "Danh sách bài chờ duyệt",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### 📸 Upload (Lưu trữ ảnh qua Telegram Bot API)

Hệ thống sử dụng **Multer (Memory Storage)** để nhận file và gửi trực tiếp dữ liệu Buffer lên **Telegram Bot API** để lưu trữ mà không tốn dung lượng ổ cứng server. Khi cần hiển thị ảnh, server sẽ làm **proxy** để tải và trả lại dữ liệu ảnh cho client.

#### Upload 1 ảnh 🔒

```
POST /api/upload/image
```

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Form-Data:**
- `image`: File ảnh (định dạng `jpeg`, `png`, `gif`, `webp`; dung lượng tối đa 10MB)

**Response (200):**
```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "url": "/api/upload/image/AgACAgIAAxkBAA...",
    "file_id": "AgACAgIAAxkBAA...",
    "file_unique_id": "AQAD...",
    "originalName": "photo.jpg",
    "size": 245120,
    "mimetype": "image/jpeg"
  }
}
```

---

#### Upload nhiều ảnh (Tối đa 10 ảnh) 🔒

```
POST /api/upload/images
```

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Form-Data:**
- `images`: Danh sách nhiều file ảnh (tối đa 10 file, field name `images`)

**Response (200):**
```json
{
  "success": true,
  "message": "Upload 2 ảnh thành công",
  "data": [
    {
      "url": "/api/upload/image/AgACAgIAAxkBAA1...",
      "file_id": "AgACAgIAAxkBAA1...",
      "file_unique_id": "AQAD...",
      "originalName": "image1.jpg",
      "size": 182300,
      "mimetype": "image/jpeg"
    },
    {
      "url": "/api/upload/image/AgACAgIAAxkBAA2...",
      "file_id": "AgACAgIAAxkBAA2...",
      "file_unique_id": "AQAD...",
      "originalName": "image2.png",
      "size": 310500,
      "mimetype": "image/png"
    }
  ]
}
```

---

#### Serve/Hiển thị ảnh (Public Proxy)

```
GET /api/upload/image/:fileId
```

> API này là public, client (như thẻ `<img>` trong HTML/React) gọi URL `/api/upload/image/:fileId` để tải ảnh. Backend tự động tải stream dữ liệu từ Telegram và trả về cùng header cache 24h (`Cache-Control: public, max-age=86400`).

---

## 📋 Tổng hợp API

| Method | Endpoint | Auth | Quyền | Mô tả |
|--------|----------|:----:|:-----:|-------|
| POST | `/api/auth/register` | ❌ | All | Đăng ký tài khoản |
| POST | `/api/auth/login` | ❌ | All | Đăng nhập |
| POST | `/api/auth/refresh-token` | ❌ | All | Refresh access token |
| POST | `/api/auth/logout` | 🔒 | All | Đăng xuất |
| GET | `/api/news` | ❌ | All | Lấy danh sách tin tức (published) |
| GET | `/api/news/:id` | ❌ | All | Xem chi tiết tin tức (tăng viewCount) |
| POST | `/api/news` | 🔒 | Reporter, Editor, Admin | Tạo tin tức mới (có upload thumbnail) |
| PUT | `/api/news/:id` | 🔒 | Reporter (của mình), Editor, Admin | Cập nhật tin tức (có upload thumbnail) |
| DELETE | `/api/news/:id` | 🔒 | Reporter (của mình), Editor, Admin | Xóa mềm tin tức |
| GET | `/api/news/pending` | 🔒 | 👑 Admin | Danh sách bài chờ duyệt |
| PATCH | `/api/news/:id/approve` | 🔒 | 👑 Admin | Duyệt bài xuất bản |
| PATCH | `/api/news/:id/reject` | 🔒 | 👑 Admin | Từ chối bài viết |
| POST | `/api/upload/image` | 🔒 | All | Upload 1 file ảnh lên Telegram Storage |
| POST | `/api/upload/images` | 🔒 | All | Upload nhiều file ảnh (tối đa 10) |
| GET | `/api/upload/image/:fileId` | ❌ | All | Public Proxy serve ảnh từ Telegram |

> 🔒 = Cần gửi header `Authorization: Bearer <accessToken>`
>
> 👑 = Chỉ Admin mới có quyền thực hiện

---

## 🗂️ Cấu trúc thư mục

```
src/
├── app.ts                  # Entry point Express app & mount router
├── config/
│   └── database.ts         # Kết nối MongoDB (Mongoose)
├── constants/
│   └── index.ts            # Hằng số & Enums (USER_ROLES, NEWS_CATEGORIES, NEWS_STATUS)
├── controllers/
│   ├── auth.controller.ts  # Controller xử lý auth (login, register, logout, refresh)
│   ├── news.controller.ts  # Controller xử lý tin tức & upload thumbnail bài viết
│   └── upload.controller.ts# Controller xử lý upload ảnh đơn/nhiều & serve image proxy
├── middlewares/
│   ├── auth.middleware.ts   # Middleware xác thực JWT & authorize roles
│   ├── error.middleware.ts  # Middleware xử lý lỗi tập trung (ApiError)
│   └── upload.middleware.ts # Middleware cấu hình Multer parse multipart/form-data
├── models/
│   ├── user.model.ts       # Schema User & mã hóa bcrypt password
│   └── news.model.ts       # Schema News, text index & auto-slug generator
├── routes/
│   ├── index.ts            # Router chính gom các sub-router
│   ├── auth.route.ts       # Sub-router Auth
│   ├── news.route.ts       # Sub-router News
│   └── upload.route.ts     # Sub-router Upload
├── seeds/
│   ├── check.ts            # Script kiểm tra DB
│   └── seed.ts             # Script kho dữ liệu mẫu đầy đủ roles & bài viết
├── services/
│   ├── auth.service.ts     # Logic nghiệp vụ xác thực & JWT token
│   ├── news.service.ts     # Logic nghiệp vụ CRUD, phân trang & duyệt bài
│   └── telegram.service.ts # Logic gửi & tải file qua Telegram Bot API
└── utils/
    └── ApiError.ts         # Custom Error Class kế thừa Error
```

---

## 🔑 Trạng thái bài viết

```
draft → pending → published
                → rejected
published → archived
```

| Status | Mô tả |
|--------|-------|
| `draft` | Bản nháp, phóng viên chưa gửi duyệt |
| `pending` | Đang chờ admin duyệt |
| `published` | Đã xuất bản, hiển thị công khai |
| `rejected` | Bị từ chối (kèm lý do từ chối) |
| `archived` | Đã lưu trữ |
