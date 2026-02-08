import mysql from 'mysql2/promise';

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'mysql6.sqlpub.com',
  port: 3311,
  user: 'apollo198',
  password: '3JGjy1JcTEosb1bK',
  database: 'tacitbox',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

export default pool;