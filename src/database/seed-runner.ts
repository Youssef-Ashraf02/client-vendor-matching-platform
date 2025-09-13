import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { seedInitialData } from './seeds/initial-seed';

// Load .env manually
dotenv.config();

export async function runSeeds() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Database connected for seeding...');
    
    await seedInitialData(dataSource);
    
    await dataSource.destroy();
    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runSeeds();
}
