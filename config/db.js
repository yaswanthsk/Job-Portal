const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConnection: true,
    enableArithAbort: true,
    instancename: process.env.DB_INSTANCE
  },
  port: Number(process.env.DB_PORT) // Convert port to number
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => console.log('✅ Connected with SQL Authentication'))
  .catch(err => console.error('❌ DB Connection Failed:', err));

module.exports = { sql, poolConnect, pool };
