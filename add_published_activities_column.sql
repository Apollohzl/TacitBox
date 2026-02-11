-- 为 users 表添加 published_activities 列，用于存储用户发布的所有测试的专属ID列表
ALTER TABLE users 
ADD COLUMN published_activities JSON DEFAULT JSON_ARRAY() COMMENT '用户发布的所有测试的专属ID列表，存储为JSON数组格式';

-- 验证列是否添加成功
DESCRIBE users;