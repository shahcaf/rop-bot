const Database = require('better-sqlite3');
const logger = require('../utils/logger');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

logger.success('Connected to Local SQLite Database');

async function query(text, params = []) {
    // Map PostgreSQL parameter arrays to SQLite object parameters for native $1, $2 support
    let sqliteParams = params;
    if (Array.isArray(params)) {
        sqliteParams = {};
        for(let i = 0; i < params.length; i++) {
            let val = params[i];
            if (typeof val === 'boolean') val = val ? 1 : 0;
            sqliteParams[(i+1).toString()] = val;
        }
    }

    try {
        if (text.trim().toUpperCase().startsWith('SELECT') || text.trim().toUpperCase().startsWith('PRAGMA')) {
            const rows = db.prepare(text).all(sqliteParams);
            return { rows: rows, rowCount: rows.length };
        } else {
            const result = db.prepare(text).run(sqliteParams);
            return { rows: [], rowCount: result.changes };
        }
    } catch (err) {
        logger.error(`SQLite Error: ${err.message} \nQuery: ${text}`);
        throw err;
    }
}

// Function to initialize tables
async function initDB() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS guild_settings (
            guild_id TEXT PRIMARY KEY,
            welcome_channel TEXT,
            leave_channel TEXT,
            welcome_message TEXT,
            leave_message TEXT,
            auto_role TEXT,
            mod_log_channel TEXT,
            verify_role TEXT,
            anti_spam BOOLEAN DEFAULT 0,
            anti_link BOOLEAN DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            moderator_id TEXT NOT NULL,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS levels (
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            PRIMARY KEY (guild_id, user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS level_settings (
            guild_id TEXT PRIMARY KEY,
            level_channel_id TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS giveaways (
            message_id TEXT PRIMARY KEY,
            guild_id TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            prize TEXT NOT NULL,
            ends_at TIMESTAMP NOT NULL,
            winners_count INTEGER DEFAULT 1,
            host_id TEXT NOT NULL,
            ended BOOLEAN DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS tickets (
            channel_id TEXT PRIMARY KEY,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            claimer_id TEXT
        )`
    ];

    for (let q of queries) {
        try {
            await query(q);
        } catch (e) {
            logger.error('Failed to init table:', e.message);
        }
    }
    logger.info('Database tables initialized locally.');
}

module.exports = {
    query,
    initDB,
    db
};
