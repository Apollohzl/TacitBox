-- 检查并添加published_activities列到users表
-- 首先检查列是否存在
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'tacitbox' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'published_activities';

-- 如果上面的查询没有返回结果，则执行以下语句添加列
ALTER TABLE users 
ADD COLUMN published_activities JSON DEFAULT JSON_ARRAY() COMMENT '用户发布的所有测试的专属ID列表，存储为JSON数组格式';

-- 验证列是否添加成功
DESCRIBE users;