import dns from 'dns';
import mongoose from 'mongoose';

const DEFAULT_MONGO_DNS_SERVERS = ['1.1.1.1', '8.8.8.8'];
const MONGO_CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 50000,
  socketTimeoutMS: 60000,
};

function parseDnsServers(value) {
  return String(value || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
}

function isSrvMongoUri(uri) {
  return String(uri || '').trim().toLowerCase().startsWith('mongodb+srv://');
}

function redactMongoUri(uri) {
  try {
    const parsed = new URL(uri);
    if (parsed.username) parsed.username = '<username>';
    if (parsed.password) parsed.password = '<password>';
    return parsed.toString();
  } catch {
    return '<invalid MongoDB URI>';
  }
}

function configureDnsForSrvLookup(uri) {
  if (!isSrvMongoUri(uri)) return;

  const servers = parseDnsServers(process.env.MONGO_DNS_SERVERS);
  const dnsServers = servers.length > 0 ? servers : DEFAULT_MONGO_DNS_SERVERS;

  try {
    dns.setServers(dnsServers);
    console.log(`[MongoDB] Using DNS servers for SRV lookup: ${dnsServers.join(', ')}`);
  } catch (error) {
    console.warn(`[MongoDB] Could not configure DNS servers: ${error.message}`);
  }
}

function logMongoTroubleshooting(error, uri) {
  if (error?.syscall !== 'querySrv') return;

  console.error('[MongoDB] DNS SRV lookup failed before a database connection could be opened.');
  console.error(`[MongoDB] URI: ${redactMongoUri(uri)}`);

  if (error.code === 'ECONNREFUSED') {
    console.error(
      '[MongoDB] Your DNS resolver refused the Atlas SRV lookup. Try another network, disable VPN/proxy DNS filtering, or set MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8 in Backend/.env.'
    );
  }
}

export async function connectMongo({ mongoUri: overrideMongoUri, dbName: overrideDbName } = {}) {
  const mongoUri = overrideMongoUri?.trim() || process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to Backend/.env before starting the server.');
  }

  configureDnsForSrvLookup(mongoUri);

  try {
    const connectOptions = { ...MONGO_CONNECT_OPTIONS };

    if (overrideDbName?.trim()) {
      connectOptions.dbName = overrideDbName.trim();
    }

    const conn = await mongoose.connect(mongoUri, connectOptions);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    if (conn.connection.name) {
      console.log(`[MongoDB] Connected database: ${conn.connection.name}`);
    }
    return conn;
  } catch (error) {
    logMongoTroubleshooting(error, mongoUri);
    throw error;
  }
}
