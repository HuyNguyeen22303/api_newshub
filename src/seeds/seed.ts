// seeds/seed.ts
// Script tạo dữ liệu mẫu cho database
// Chạy: npx tsx src/seeds/seed.ts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import User from '../models/user.model.js';
import News from '../models/news.model.js';

// ==============================
// Dữ liệu mẫu: Users
// ==============================
const usersData = [
    {
        name: 'Admin NewsHub',
        email: 'admin@newshub.com',
        password: 'admin123',
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
        name: 'Nguyễn Văn Editor',
        email: 'editor@newshub.com',
        password: 'editor123',
        role: 'editor',
        avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
        name: 'Trần Thị User',
        email: 'user@newshub.com',
        password: 'user123',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
        name: 'Lê Minh Phóng Viên',
        email: 'reporter@newshub.com',
        password: 'phongvien123',
        role: 'reporter',
        avatar: 'https://i.pravatar.cc/150?img=4',
    },
    {
        name: 'Phạm Hoàng User',
        email: 'hoang@newshub.com',
        password: 'hoang123',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=5',
    },
];

// ==============================
// Dữ liệu mẫu: News
// ==============================
const generateNewsData = (authorIds: string[]) => [
    // === TECHNOLOGY ===
    {
        title: 'AI đang thay đổi ngành lập trình như thế nào trong năm 2026',
        content: `<p>Trí tuệ nhân tạo (AI) đang cách mạng hóa ngành công nghiệp phần mềm. Các công cụ AI coding assistant như GitHub Copilot, Cursor đã trở thành tiêu chuẩn trong mọi IDE.</p>
<p>Theo khảo sát mới nhất, 85% lập trình viên sử dụng AI hàng ngày trong công việc. Năng suất tăng trung bình 40% so với trước đây.</p>
<p>Tuy nhiên, các chuyên gia cảnh báo rằng AI chỉ là công cụ hỗ trợ, không thể thay thế hoàn toàn tư duy logic và khả năng thiết kế hệ thống của con người.</p>`,
        summary: 'AI đang thay đổi cách lập trình viên làm việc, tăng năng suất 40% nhưng không thể thay thế con người.',
        category: 'technology',
        tags: ['ai', 'lập trình', 'công nghệ', 'github copilot'],
        author: authorIds[0],
        status: 'published',
        viewCount: 1520,
        thumbnail: 'https://picsum.photos/seed/tech1/800/400',
    },
    {
        title: 'TypeScript 7.0 ra mắt với nhiều tính năng đột phá',
        content: `<p>Microsoft vừa chính thức phát hành TypeScript 7.0 với nhiều cải tiến đáng chú ý. Phiên bản mới mang đến hiệu suất biên dịch nhanh hơn 50%.</p>
<p>Một số tính năng nổi bật: Pattern Matching nâng cao, Decorator metadata cải tiến, và hỗ trợ tốt hơn cho các framework hiện đại.</p>
<p>Cộng đồng đón nhận tích cực, nhiều dự án lớn đã bắt đầu migrate lên phiên bản mới.</p>`,
        summary: 'TypeScript 7.0 mang đến hiệu suất biên dịch nhanh hơn 50% và nhiều tính năng mới.',
        category: 'technology',
        tags: ['typescript', 'javascript', 'microsoft', 'web development'],
        author: authorIds[1],
        status: 'published',
        viewCount: 890,
        thumbnail: 'https://picsum.photos/seed/tech2/800/400',
    },
    {
        title: 'React Server Components đã thay đổi cách xây dựng web app',
        content: `<p>React Server Components (RSC) đã trở thành tiêu chuẩn mới trong phát triển web. Next.js và các framework khác đã tích hợp sâu RSC vào core.</p>
<p>Với RSC, developers có thể render component trên server, giảm bundle size đáng kể và cải thiện trải nghiệm người dùng.</p>`,
        summary: 'React Server Components trở thành tiêu chuẩn mới, giảm bundle size và cải thiện UX.',
        category: 'technology',
        tags: ['react', 'nextjs', 'web', 'frontend'],
        author: authorIds[3],
        status: 'published',
        viewCount: 2100,
        thumbnail: 'https://picsum.photos/seed/tech3/800/400',
    },

    // === SPORTS ===
    {
        title: 'Đội tuyển Việt Nam giành chiến thắng lịch sử tại vòng loại World Cup',
        content: `<p>Đội tuyển bóng đá Việt Nam vừa có chiến thắng ấn tượng 2-1 trước đối thủ mạnh trong khuôn khổ vòng loại World Cup 2026.</p>
<p>Bàn thắng quyết định được ghi ở phút 89 bởi tiền đạo trẻ đầy triển vọng. Đây là chiến thắng quan trọng giúp Việt Nam tiến gần hơn tới giấc mơ World Cup.</p>
<p>HLV trưởng phát biểu sau trận: "Các cầu thủ đã thể hiện tinh thần chiến đấu tuyệt vời. Chúng tôi sẽ tiếp tục nỗ lực."</p>`,
        summary: 'Việt Nam thắng 2-1 với bàn thắng phút 89, tiến gần hơn tới World Cup 2026.',
        category: 'sports',
        tags: ['bóng đá', 'việt nam', 'world cup', 'vòng loại'],
        author: authorIds[3],
        status: 'published',
        viewCount: 5300,
        thumbnail: 'https://picsum.photos/seed/sport1/800/400',
    },
    {
        title: 'Giải Marathon quốc tế TP.HCM thu hút hơn 10.000 vận động viên',
        content: `<p>Giải Marathon quốc tế TP.HCM 2026 đã diễn ra thành công tốt đẹp với sự tham gia của hơn 10.000 vận động viên đến từ 30 quốc gia.</p>
<p>Kỷ lục mới được thiết lập ở cự ly full marathon với thành tích 2 giờ 15 phút.</p>`,
        summary: 'Marathon quốc tế TPHCM 2026 quy tụ 10.000+ VĐV từ 30 quốc gia.',
        category: 'sports',
        tags: ['marathon', 'thể thao', 'tphcm', 'chạy bộ'],
        author: authorIds[1],
        status: 'published',
        viewCount: 1200,
        thumbnail: 'https://picsum.photos/seed/sport2/800/400',
    },

    // === BUSINESS ===
    {
        title: 'Startup Việt Nam gọi vốn thành công 50 triệu USD vòng Series B',
        content: `<p>Một startup công nghệ tài chính (fintech) của Việt Nam vừa hoàn tất vòng gọi vốn Series B trị giá 50 triệu USD, do quỹ đầu tư lớn từ Singapore dẫn dắt.</p>
<p>Đây là một trong những vòng gọi vốn lớn nhất của startup Việt trong năm 2026. Công ty dự kiến sử dụng số vốn này để mở rộng sang thị trường Đông Nam Á.</p>
<p>CEO cho biết: "Chúng tôi tin rằng thị trường fintech Đông Nam Á còn rất nhiều tiềm năng phát triển."</p>`,
        summary: 'Startup fintech Việt Nam gọi vốn 50 triệu USD Series B, mở rộng Đông Nam Á.',
        category: 'business',
        tags: ['startup', 'fintech', 'gọi vốn', 'đầu tư'],
        author: authorIds[0],
        status: 'published',
        viewCount: 3400,
        thumbnail: 'https://picsum.photos/seed/biz1/800/400',
    },
    {
        title: 'Thị trường bất động sản Việt Nam phục hồi mạnh mẽ quý 3/2026',
        content: `<p>Thị trường bất động sản Việt Nam ghi nhận sự phục hồi đáng kể trong quý 3/2026 với lượng giao dịch tăng 35% so với cùng kỳ năm trước.</p>
<p>Phân khúc căn hộ trung cấp và nhà phố vẫn dẫn đầu về thanh khoản. Các chuyên gia dự báo xu hướng tăng sẽ tiếp tục trong quý 4.</p>`,
        summary: 'BĐS Việt Nam phục hồi Q3/2026, giao dịch tăng 35% so với cùng kỳ.',
        category: 'business',
        tags: ['bất động sản', 'kinh tế', 'đầu tư', 'thị trường'],
        author: authorIds[3],
        status: 'published',
        viewCount: 2800,
        thumbnail: 'https://picsum.photos/seed/biz2/800/400',
    },

    // === ENTERTAINMENT ===
    {
        title: 'Phim Việt Nam lần đầu đạt doanh thu 500 tỷ đồng tại phòng vé',
        content: `<p>Bộ phim hành động - hài mới nhất của đạo diễn Việt đã lập kỷ lục phòng vé khi cán mốc 500 tỷ đồng chỉ sau 3 tuần công chiếu.</p>
<p>Đây là lần đầu tiên một phim Việt đạt được con số này, đánh dấu bước tiến lớn của điện ảnh trong nước.</p>`,
        summary: 'Phim Việt lập kỷ lục 500 tỷ doanh thu phòng vé sau 3 tuần công chiếu.',
        category: 'entertainment',
        tags: ['phim', 'điện ảnh', 'giải trí', 'phòng vé'],
        author: authorIds[1],
        status: 'published',
        viewCount: 4500,
        thumbnail: 'https://picsum.photos/seed/ent1/800/400',
    },

    // === HEALTH ===
    {
        title: 'Nghiên cứu mới: Ngủ đủ 7-8 tiếng giảm 40% nguy cơ bệnh tim',
        content: `<p>Một nghiên cứu quy mô lớn từ Đại học Y Hà Nội cho thấy người ngủ đủ 7-8 tiếng mỗi đêm có nguy cơ mắc bệnh tim mạch thấp hơn 40% so với người ngủ dưới 6 tiếng.</p>
<p>Nghiên cứu được thực hiện trên 50.000 người Việt Nam trong vòng 5 năm. Các bác sĩ khuyến cáo nên duy trì thói quen ngủ sớm và đủ giấc.</p>`,
        summary: 'Ngủ đủ 7-8 tiếng/đêm giảm 40% nguy cơ bệnh tim theo nghiên cứu 50.000 người.',
        category: 'health',
        tags: ['sức khỏe', 'giấc ngủ', 'tim mạch', 'nghiên cứu'],
        author: authorIds[0],
        status: 'published',
        viewCount: 3200,
        thumbnail: 'https://picsum.photos/seed/health1/800/400',
    },

    // === SCIENCE ===
    {
        title: 'Việt Nam phóng thành công vệ tinh quan sát Trái Đất thế hệ mới',
        content: `<p>Việt Nam vừa phóng thành công vệ tinh quan sát Trái Đất VNREDSat-2 từ bãi phóng tại Nhật Bản. Vệ tinh có khả năng chụp ảnh độ phân giải cao phục vụ giám sát môi trường và thiên tai.</p>
<p>Đây là bước tiến quan trọng trong chương trình không gian quốc gia, nâng tổng số vệ tinh Việt Nam đang hoạt động lên 5 chiếc.</p>`,
        summary: 'Việt Nam phóng thành công vệ tinh VNREDSat-2, nâng tổng số vệ tinh lên 5.',
        category: 'science',
        tags: ['vệ tinh', 'không gian', 'khoa học', 'công nghệ'],
        author: authorIds[3],
        status: 'published',
        viewCount: 1800,
        thumbnail: 'https://picsum.photos/seed/sci1/800/400',
    },

    // === EDUCATION ===
    {
        title: 'Bộ GD&ĐT công bố phương án thi tốt nghiệp THPT 2027',
        content: `<p>Bộ Giáo dục và Đào tạo vừa chính thức công bố phương án thi tốt nghiệp THPT năm 2027 với nhiều thay đổi quan trọng.</p>
<p>Theo đó, thí sinh sẽ thi 4 môn bắt buộc và được chọn 2 môn tự chọn. Hình thức thi kết hợp trắc nghiệm và tự luận.</p>
<p>Các trường đại học sẽ sử dụng kết quả thi kết hợp với xét học bạ để tuyển sinh.</p>`,
        summary: 'Thi tốt nghiệp THPT 2027: 4 môn bắt buộc + 2 môn tự chọn, kết hợp trắc nghiệm và tự luận.',
        category: 'education',
        tags: ['giáo dục', 'thi tốt nghiệp', 'thpt', 'tuyển sinh'],
        author: authorIds[1],
        status: 'published',
        viewCount: 6200,
        thumbnail: 'https://picsum.photos/seed/edu1/800/400',
    },

    // === LIFESTYLE ===
    {
        title: 'Top 10 quán cà phê view đẹp nhất Đà Lạt 2026',
        content: `<p>Đà Lạt luôn là điểm đến yêu thích của những tín đồ cà phê. Dưới đây là 10 quán cà phê có view đẹp nhất thành phố ngàn hoa năm 2026.</p>
<p>Từ những quán nằm trên đồi cao nhìn xuống thung lũng, đến quán ven hồ Xuân Hương thơ mộng, mỗi quán đều mang một nét đặc trưng riêng.</p>`,
        summary: '10 quán cà phê view đẹp nhất Đà Lạt, từ đồi cao đến ven hồ Xuân Hương.',
        category: 'lifestyle',
        tags: ['đà lạt', 'cà phê', 'du lịch', 'ẩm thực'],
        author: authorIds[0],
        status: 'published',
        viewCount: 7800,
        thumbnail: 'https://picsum.photos/seed/life1/800/400',
    },

    // === POLITICS ===
    {
        title: 'Quốc hội thông qua Luật Bảo vệ dữ liệu cá nhân',
        content: `<p>Quốc hội vừa chính thức thông qua Luật Bảo vệ dữ liệu cá nhân với tỷ lệ tán thành 92%. Luật sẽ có hiệu lực từ ngày 01/01/2027.</p>
<p>Theo luật mới, các tổ chức thu thập dữ liệu cá nhân phải có sự đồng ý rõ ràng của người dùng. Vi phạm có thể bị phạt đến 5% doanh thu hàng năm.</p>`,
        summary: 'Luật Bảo vệ dữ liệu cá nhân được thông qua, phạt đến 5% doanh thu nếu vi phạm.',
        category: 'politics',
        tags: ['luật', 'dữ liệu cá nhân', 'quốc hội', 'chính sách'],
        author: authorIds[3],
        status: 'published',
        viewCount: 2400,
        thumbnail: 'https://picsum.photos/seed/pol1/800/400',
    },

    // === WORLD ===
    {
        title: 'Hội nghị G20 đạt thỏa thuận lịch sử về biến đổi khí hậu',
        content: `<p>Các nhà lãnh đạo G20 đã đạt được thỏa thuận lịch sử cam kết giảm 60% lượng khí thải carbon trước năm 2035.</p>
<p>Quỹ hỗ trợ chuyển đổi xanh trị giá 500 tỷ USD sẽ được thành lập để giúp các nước đang phát triển thực hiện mục tiêu này.</p>`,
        summary: 'G20 cam kết giảm 60% khí thải carbon trước 2035, lập quỹ 500 tỷ USD.',
        category: 'world',
        tags: ['g20', 'khí hậu', 'quốc tế', 'môi trường'],
        author: authorIds[0],
        status: 'published',
        viewCount: 1900,
        thumbnail: 'https://picsum.photos/seed/world1/800/400',
    },

    // === DRAFT (bài nháp, chưa publish) ===
    {
        title: 'Bài viết nháp: Xu hướng công nghệ 2027',
        content: '<p>Đây là bài viết đang soạn, chưa xuất bản...</p>',
        summary: 'Bài nháp về xu hướng công nghệ.',
        category: 'technology',
        tags: ['draft', 'xu hướng'],
        author: authorIds[1],
        status: 'draft',
        viewCount: 0,
        thumbnail: '',
    },

    // === ARCHIVED (bài đã lưu trữ) ===
    {
        title: 'Tin cũ: Kết quả thi THPT 2025',
        content: '<p>Bài viết đã được lưu trữ...</p>',
        summary: 'Bài đã archived.',
        category: 'education',
        tags: ['archived', 'thi thpt'],
        author: authorIds[0],
        status: 'archived',
        viewCount: 15000,
        thumbnail: '',
    },
];

// ==============================
// Hàm seed chính
// ==============================
const seedDB = async () => {
    try {
        // Kết nối MongoDB
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI chưa được cấu hình trong .env');
        }

        console.log('🔌 Đang kết nối MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Kết nối MongoDB thành công!');

        // Xóa dữ liệu cũ
        console.log('\n🗑️  Đang xóa dữ liệu cũ...');
        await User.deleteMany({});
        await News.deleteMany({});
        console.log('✅ Đã xóa dữ liệu cũ!');

        // Tạo Users
        console.log('\n👤 Đang tạo Users...');
        const createdUsers: any[] = [];
        for (const userData of usersData) {
            const user = await User.create(userData as any);
            createdUsers.push(user);
            console.log(`   ✅ ${user.role.padEnd(6)} | ${user.email}`);
        }

        // Tạo News
        const authorIds = createdUsers.map((u) => u._id as string);
        const newsData = generateNewsData(authorIds);

        console.log('\n📰 Đang tạo News...');
        for (const article of newsData) {
            const news = await News.create(article as any);
            const statusIcon = news.status === 'published' ? '🟢' : news.status === 'draft' ? '🟡' : '⚪';
            console.log(`   ${statusIcon} [${news.category.padEnd(13)}] ${news.title.substring(0, 50)}...`);
        }

        // Thống kê
        const userCount = await User.countDocuments();
        const newsCount = await News.countDocuments();
        const publishedCount = await News.countDocuments({ status: 'published' });

        console.log('\n' + '='.repeat(55));
        console.log('🎉 SEED HOÀN TẤT!');
        console.log('='.repeat(55));
        console.log(`👤 Users:          ${userCount}`);
        console.log(`📰 News (tổng):    ${newsCount}`);
        console.log(`🟢 Published:      ${publishedCount}`);
        console.log(`🟡 Draft:          ${await News.countDocuments({ status: 'draft' })}`);
        console.log(`⚪ Archived:       ${await News.countDocuments({ status: 'archived' })}`);
        console.log('='.repeat(55));

        console.log('\n📋 Tài khoản test:');
        console.log('   Admin:  admin@newshub.com    / admin123');
        console.log('   Editor: editor@newshub.com   / editor123');
        console.log('   User:   user@newshub.com     / user123');

    } catch (error) {
        console.error('❌ Lỗi khi seed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Đã đóng kết nối MongoDB.');
        process.exit(0);
    }
};

// Chạy seed
seedDB();
