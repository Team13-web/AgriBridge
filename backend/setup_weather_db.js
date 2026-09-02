import { query } from './config/db.js';

async function setup() {
  await query(`
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
  console.log('✅ weather_cache table verified and created in MySQL!');
  process.exit(0);
}

setup().catch(err => {
  console.error('DB Setup Error:', err);
  process.exit(1);
});
