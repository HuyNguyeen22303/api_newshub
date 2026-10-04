// constants/index.ts
// Tập trung tất cả hằng số, enum values

// ==============================
// News Categories — String enum
// ==============================
export const NEWS_CATEGORIES = [
    'technology',
    'sports',
    'business',
    'entertainment',
    'health',
    'science',
    'politics',
    'world',
    'education',
    'lifestyle',
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

// ==============================
// News Status
// ==============================
export const NEWS_STATUS = ['draft', 'pending', 'published', 'rejected', 'archived'] as const;
export type NewsStatus = (typeof NEWS_STATUS)[number];

// ==============================
// User Roles
// ==============================
export const USER_ROLES = ['user', 'admin', 'editor', 'reporter'] as const;
export type UserRole = (typeof USER_ROLES)[number];
