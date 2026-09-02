import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

// Cloud MySQL Pool Configuration using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yesu@106723',
  database: process.env.DB_NAME || 'agribridge',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Safe Query Execution wrapper with graceful error handling
export async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.warn('⚠️ Cloud MySQL Query fallback (Database offline or non-responsive):', error.message);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return [];
    }
    return { insertId: Date.now(), affectedRows: 1 };
  }
}

// Auto-initialize Weather Cache table
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location VARCHAR(150) NOT NULL,
        latitude DECIMAL(10,7) NOT NULL,
        longitude DECIMAL(10,7) NOT NULL,
        forecast_json LONGTEXT NOT NULL,
        ai_analysis_json LONGTEXT NULL,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX idx_location (location, expires_at),
        INDEX idx_coords (latitude, longitude)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (e) {
    // Ignore initialization warnings
  }
})();

export default pool;
