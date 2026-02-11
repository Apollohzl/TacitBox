const mysql = require('mysql2/promise');

// 从环境变量或默认值获取数据库配置
const pool = mysql.createPool({
  host: 'mysql6.sqlpub.com',
  port: 3311,
  user: 'apollo198',
  password: process.env.SQLPub_password || process.env.SQL_PASSWORD, // 尝试两个可能的环境变量
  database: 'tacitbox',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function addPublishedActivitiesColumn() {
  try {
    console.log('连接到数据库...');
    const connection = await pool.getConnection();
    
    console.log('正在添加 published_activities 列...');
    const query = `
      ALTER TABLE users 
      ADD COLUMN published_activities JSON DEFAULT JSON_ARRAY() COMMENT '用户发布的所有测试的专属ID列表，存储为JSON数组格式'
    `;
    
    const [results] = await connection.execute(query);
    console.log('列添加成功:', results);
    
    // 检查列是否已添加
    console.log('验证列是否添加成功...');
    const [columns] = await connection.execute('DESCRIBE users');
    const publishedActivitiesColumn = columns.find(col => col.Field === 'published_activities');
    
    if (publishedActivitiesColumn) {
      console.log('✅ published_activities 列已成功添加到 users 表中');
      console.log('列信息:', publishedActivitiesColumn);
    } else {
      console.log('❌ published_activities 列未找到');
    }
    
    connection.release();
    console.log('数据库连接已释放');
  } catch (error) {
    console.error('添加列时出错:', error);
  } finally {
    await pool.end();
    console.log('数据库连接池已关闭');
  }
}

// 执行函数
addPublishedActivitiesColumn();