import mongoose from 'mongoose';
import process from 'node:process';

const rawUri = process.env.MONGODB_URI;

/** Ensure Atlas URIs without a DB path use a stable app database name. */
function withDatabaseName(uri: string, dbName = 'edtech_matrix'): string {
  try {
    const url = new URL(uri);
    if (!url.pathname || url.pathname === '/') {
      url.pathname = `/${dbName}`;
    }
    return url.toString();
  } catch {
    return uri;
  }
}

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
  if (!rawUri) {
    throw new Error('MONGODB_URI is not set');
  }

  const MONGODB_URI = withDatabaseName(rawUri);
  mongoose.set('strictQuery', true);

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  await ensureDatabaseExists();

  console.log(`MongoDB connected: ${mongoose.connection.db?.databaseName}`);
  return mongoose;
}
