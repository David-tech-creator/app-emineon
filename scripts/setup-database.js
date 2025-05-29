#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Emineon ATS Database...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📋 Please copy env.example to .env and update the DATABASE_URL\n');
  console.log('Commands to run:');
  console.log('  cp env.example .env');
  console.log('  # Then edit .env with your database credentials\n');
  process.exit(1);
}

try {
  console.log('1️⃣ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  console.log('2️⃣ Checking database connection...');
  execSync('npx prisma db ping', { stdio: 'inherit' });
  console.log('✅ Database connection successful\n');

  console.log('3️⃣ Applying database migrations...');
  execSync('npx prisma migrate dev --name setup', { stdio: 'inherit' });
  console.log('✅ Migrations applied\n');

  console.log('4️⃣ Seeding database with sample data...');
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded\n');

  console.log('🎉 Database setup complete!');
  console.log('🚀 You can now start the development server with: npm run dev');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Check your DATABASE_URL in .env file');
  console.log('2. Ensure your database is running and accessible');
  console.log('3. For Prisma Accelerate issues, regenerate your API key');
  console.log('4. Consider using a direct PostgreSQL connection for development');
  process.exit(1);
} 