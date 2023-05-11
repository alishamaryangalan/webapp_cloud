const Pool = require('pg').Pool

const pool = new Pool({
  user: 'alisha',
  host: 'localhost',
  database: 'webappdb',
  password: 'password',
  port: 5432
})

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    ID SERIAL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    password VARCHAR(200), 
    username VARCHAR(30),
    account_created VARCHAR(200),
    account_updated VARCHAR(200)
  );
`;
pool.query(createTableQuery, (error, response) => {
  console.log(error ? error.stack : 'Table is successfully created/already exists');
});

module.exports = pool;
