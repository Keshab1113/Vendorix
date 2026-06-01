import initDatabase from './schema.js';
import seedDatabase from './seed.js';

export const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    await initDatabase();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const seedData = async () => {
  try {
    console.log('Seeding database...');
    await seedDatabase();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

export const setupDatabase = async () => {
  try {
    console.log('Setting up database (init + seed)...');
    await initDatabase();
    await seedDatabase();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};

export default {
  runMigrations,
  initializeDatabase,
  seedData,
  setupDatabase
};