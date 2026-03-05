import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import User from '../models/User';

async function seedAdmin() {
  try {
    // Connect to database
    await connectDB();
    console.log('📦 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@vjn.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@vjn.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@vjn.com');
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  Please change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
