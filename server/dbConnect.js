const { Pool } = require('pg');

const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dojoDB',
  password: 'postgres',
  port: 5432,
  max: 3,
  idleTimeoutMillis: 30000,
});

db.connect((err, client, release) => {
  if (err) return console.error('Error acquiring client', err.stack);
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) return console.error('Error executing query', err.stack);
    console.log('PostgreSQL connection successful', result.rows);
  });
});

module.exports = db;
