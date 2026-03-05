import bcrypt from 'bcryptjs';
import { initializeDatabase } from '../config/database';
import userRepository from '../repositories/userRepository';

async function seedAdmin() {
  try {
    initializeDatabase();
    console.log('Connected to SQLite');

    const existingAdmin = userRepository.findByEmail('admin@vjn.com');

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    userRepository.create({
      email: 'admin@vjn.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@vjn.com');
    console.log('Password: admin123');
    console.log('Please change this password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
