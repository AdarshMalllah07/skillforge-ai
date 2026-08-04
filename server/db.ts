import dns from 'node:dns';
import mongoose from 'mongoose';
import process from 'node:process';

// Prefer public DNS + IPv4 in serverless (avoids intermittent Atlas SRV/IPv6 failures on Vercel).
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const rawUri = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cache;

/** Ensure Atlas URIs without a DB path use a stable app database name. */
function withDatabaseName(uri: string, dbName = 'edtech_matrix'): string {
  try {
    const url = new URL(uri);
    if (!url.pathname || url.pathname === '/') {
      url.pathname = `/${dbName}`;
    }
    if (!url.searchParams.has('retryWrites')) {
      url.searchParams.set('retryWrites', 'true');
    }
    if (!url.searchParams.has('w')) {
      url.searchParams.set('w', 'majority');
    }
    return url.toString();
  } catch {
    return uri;
  }
}

function describeUri(uri: string): string {
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.hostname}${url.pathname}`;
  } catch {
    return '(invalid MONGODB_URI)';
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
    await db.createCollection('_app_init');
    await db.dropCollection('_app_init');
    console.log(`MongoDB database created: ${dbName}`);
  } else {
    console.log(`MongoDB database ready: ${dbName}`);
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!rawUri) {
    throw new Error('MONGODB_URI is not set');
  }

  const MONGODB_URI = withDatabaseName(rawUri);
  mongoose.set('strictQuery', true);

  if (!cache.promise) {
    console.log(`Connecting to MongoDB: ${describeUri(MONGODB_URI)}`);
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
      })
      .then(async (m) => {
        await ensureDatabaseExists();
        console.log(`MongoDB connected: ${m.connection.db?.databaseName}`);
        return m;
      })
      .catch((err) => {
        cache.promise = null;
        console.error(`MongoDB connect failed for ${describeUri(MONGODB_URI)}:`, err);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
