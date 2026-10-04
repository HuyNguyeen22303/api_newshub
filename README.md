# 📰 NewsHub API

RESTful API cho hệ thống quản lý tin tức, xây dựng với **Node.js**, **Express**, **TypeScript** và **MongoDB**.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (Access Token + Refresh Token)
- **Password**: bcryptjs

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
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=y
```

---

## 👤 Tài khoản mẫu (sau khi seed)

| Role | Email | Password |
|------|-------|----------|
| 🔴 Admin | `admin@newshub.com` | `admin123` |
| 🟡 Editor | `editor@newshub.com` | `editor123` |
| 🟢 User | `user@newshub.com` | `user123` |

### Phân quyền

| Quyền | User | Editor | Admin |
|-------|:----:|:------:|:-----:|
| Đọc tin tức | ✅ | ✅ | ✅ |
| Tạo tin tức | ✅ (chờ duyệt) | ✅ | ✅ |
| Sửa tin tức (của mình) | ✅ | ✅ | ✅ |
| Sửa tin tức (của người khác) | ❌ | ❌ | ✅ |
| Xóa tin tức (của mình) | ✅ | ✅ | ✅ |
| Xóa tin tức (của người khác) | ❌ | ❌ | ✅ |
| Duyệt / Từ chối bài | ❌ | ❌ | ✅ |
| Xem bài chờ duyệt | ❌ | ❌ | ✅ |

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
  "data": {
    "news": [
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
        "thumbnail": "...",
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
  "message": "Lấy tin tức thành công",
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

#### Tạo tin tức mới 🔒

```
POST /api/news
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "title": "Tiêu đề bài viết",
  "content": "<p>Nội dung bài viết</p>",
  "summary": "Tóm tắt ngắn",
  "category": "technology",
  "tags": ["tag1", "tag2"],
  "thumbnail": "https://example.com/image.jpg"
}
```

> ⚠️ User thường tạo bài → status tự động = `pending` (chờ admin duyệt).
> Admin/Editor tạo bài → có thể chọn status.

**Response (201):**
```json
{
  "message": "Tạo tin tức thành công",
  "data": { ... }
}
```

---

#### Cập nhật tin tức 🔒

```
PUT /api/news/:id
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body** (chỉ gửi field cần sửa):
```json
{
  "title": "Tiêu đề đã sửa",
  "category": "sports"
}
```

> ⚠️ User/Editor chỉ sửa được bài **của mình**. Admin sửa được tất cả.

**Response (200):**
```json
{
  "message": "Cập nhật tin tức thành công",
  "data": { ... }
}
```

---

#### Xóa tin tức 🔒

```
DELETE /api/news/:id
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

> Sử dụng **soft delete** — bài viết không bị xóa thật, chỉ đánh dấu `isDeleted: true`.

> ⚠️ User/Editor chỉ xóa được bài **của mình**. Admin xóa được tất cả.

**Response (200):**
```json
{
  "message": "Xóa tin tức thành công",
  "data": { ... }
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

> Chỉ duyệt được bài đang ở trạng thái `pending`.

**Response (200):**
```json
{
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
  "reason": "Nội dung chưa phù hợp"
}
```

**Response (200):**
```json
{
  "message": "Từ chối bài viết thành công",
  "data": { ... }
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

**Query Params:** `page`, `limit` (giống GET /api/news)

**Response (200):**
```json
{
  "message": "Lấy danh sách bài chờ duyệt thành công",
  "data": {
    "news": [ ... ],
    "pagination": { ... }
  }
}
```

---

## 📋 Tổng hợp API

| Method | Endpoint | Auth | Quyền | Mô tả |
|--------|----------|:----:|:-----:|-------|
| POST | `/api/auth/register` | ❌ | All | Đăng ký |
| POST | `/api/auth/login` | ❌ | All | Đăng nhập |
| POST | `/api/auth/refresh-token` | ❌ | All | Refresh token |
| POST | `/api/auth/logout` | 🔒 | All | Đăng xuất |
| GET | `/api/news` | ❌ | All | Danh sách tin tức |
| GET | `/api/news/:id` | ❌ | All | Chi tiết tin tức |
| POST | `/api/news` | 🔒 | All | Tạo tin tức |
| PUT | `/api/news/:id` | 🔒 | All | Cập nhật tin tức |
| DELETE | `/api/news/:id` | 🔒 | All | Xóa tin tức (soft) |
| GET | `/api/news/pending` | 🔒 | 👑 Admin | Bài chờ duyệt |
| PATCH | `/api/news/:id/approve` | 🔒 | 👑 Admin | Duyệt bài |
| PATCH | `/api/news/:id/reject` | 🔒 | 👑 Admin | Từ chối bài |

> 🔒 = Cần gửi `Authorization: Bearer <token>` trong headers
>
> 👑 = Chỉ Admin mới được phép

---

## 🗂️ Cấu trúc thư mục

```
src/
├── app.ts                  # Entry point
├── config/
│   └── database.ts         # Kết nối MongoDB
├── constants/
│   └── index.ts            # Hằng số (roles, categories, status)
├── controllers/
│   ├── auth.controller.ts  # Xử lý request auth
│   └── news.controller.ts  # Xử lý request news
├── middlewares/
│   ├── auth.middleware.ts   # Xác thực JWT & phân quyền
│   └── error.middleware.ts  # Xử lý lỗi tập trung
├── models/
│   ├── user.model.ts       # Schema User
│   └── news.model.ts       # Schema News
├── routes/
│   ├── index.ts            # Router chính
│   ├── auth.route.ts       # Routes auth
│   └── news.route.ts       # Routes news
├── seeds/
│   └── seed.ts             # Dữ liệu mẫu
├── services/
│   ├── auth.service.ts     # Business logic auth
│   └── news.service.ts     # Business logic news
└── utils/
    └── ApiError.ts         # Custom error class
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
| `draft` | Bản nháp, chưa gửi duyệt |
| `pending` | Đang chờ admin duyệt |
| `published` | Đã xuất bản, hiển thị công khai |
| `rejected` | Bị từ chối |
| `archived` | Đã lưu trữ |
