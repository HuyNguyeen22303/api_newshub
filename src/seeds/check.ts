import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/user.model.js';

async function check() {
    await mongoose.connect(process.env.MONGODB_URI!);
    const users = await User.find({}, 'name email role createdAt').lean();
    console.log('=== TẤT CẢ USERS TRONG DB ===');
    users.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} | ${u.role} | ${u.name} | created: ${u.createdAt}`);
    });
    console.log(`\nTổng: ${users.length} users`);
    await mongoose.connection.close();
}

check();
