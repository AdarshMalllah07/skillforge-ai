import mongoose from 'mongoose';
import process from 'node:process';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://adarshmallah1357_db_user:bWWliUwYt5IS9COY@cluster0.acff7ci.mongodb.net"
  ;

/** Ensures the configured database exists (MongoDB creates DBs on first write). */
async function ensureDatabaseExists(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection has no database handle');
  }

  const dbName = db.databaseName;
  const collections = await db.listCollections().toArray();

  if (collections.length === 0) {
    // Creating a collection materializes the database if it does not exist yet
    await db.createCollection('_app_init');
    await db.dropCollection('_app_init');
    console.log(`MongoDB database created: ${dbName}`);
  } else {
    console.log(`MongoDB database ready: ${dbName}`);
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(MONGODB_URI);
  await ensureDatabaseExists();

  console.log(`MongoDB connected: ${MONGODB_URI}`);
  return mongoose;
}
