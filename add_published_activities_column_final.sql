-- 手动执行此SQL脚本以添加published_activities列到users表
-- 请在您的数据库客户端中执行此脚本

-- 检查列是否已存在
SELECT 
  COLUMN_NAME 
FROM 
  INFORMATION_SCHEMA.COLUMNS 
WHERE 
  TABLE_SCHEMA = 'tacitbox' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'published_activities';

-- 添加published_activities列（如果不存在）
-- 请先运行上面的查询检查列是否存在，如果不存在则执行下面的命令
ALTER TABLE users 
ADD COLUMN published_activities JSON DEFAULT JSON_ARRAY() COMMENT '用户发布的所有测试的专属ID列表，存储为JSON数组格式';

-- 验证列是否已成功添加
DESCRIBE users;

-- 检查几个示例用户的published_activities数据
SELECT social_uid, published_activities FROM users LIMIT 5;