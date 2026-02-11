-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS quiz_activities;

-- 创建测试活动表 (储存用户出的题数据)
CREATE TABLE quiz_activities (
  id VARCHAR(255) PRIMARY KEY,  -- 使用生成的专属ID作为主键
  creator_user_id VARCHAR(255) NOT NULL,  -- 发布测试的用户ID
  title VARCHAR(255) DEFAULT '默契测试',  -- 测试标题
  questions JSON NOT NULL,  -- 储存10道题目的数据 {question_text, options: [4个选项], correct_answer}
  reward_id VARCHAR(50) DEFAULT 'cofep',  -- 用户设置的奖励ID（字符串索引）
  min_correct INT DEFAULT 8,  -- 用户设置的至少正确几题
  max_reward_count INT DEFAULT 1,  -- 用户设置的最大奖励数量
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_quiz_activities_creator ON quiz_activities(creator_user_id);
CREATE INDEX idx_quiz_activities_created_at ON quiz_activities(created_at);

-- 示例插入数据
-- INSERT INTO quiz_activities (
--   id, 
--   creator_user_id, 
--   questions, 
--   reward_id, 
--   min_correct, 
--   max_reward_count
-- ) VALUES (
--   'ENCRYPTED_ID_EXAMPLE',
--   'USER_SOCIAL_UID_EXAMPLE',
--   JSON_ARRAY(
--     JSON_OBJECT('question_text', '你最喜欢的颜色是什么？', 'options', JSON_ARRAY('红色', '蓝色', '绿色', '黄色'), 'correct_answer', '蓝色'),
--     JSON_OBJECT('question_text', '你最喜欢的食物是什么？', 'options', JSON_ARRAY('披萨', '寿司', '面条', '汉堡'), 'correct_answer', '面条'),
--     JSON_OBJECT('question_text', '你最喜欢的季节是？', 'options', JSON_ARRAY('春季', '夏季', '秋季', '冬季'), 'correct_answer', '秋季'),
--     JSON_OBJECT('question_text', '你最想去的地方是？', 'options', JSON_ARRAY('海滩', '山区', '城市', '乡村'), 'correct_answer', '山区'),
--     JSON_OBJECT('question_text', '你最喜欢的休闲活动是？', 'options', JSON_ARRAY('读书', '运动', '看电影', '游戏'), 'correct_answer', '读书'),
--     JSON_OBJECT('question_text', '你最擅长的技能是？', 'options', JSON_ARRAY('编程', '绘画', '音乐', '写作'), 'correct_answer', '编程'),
--     JSON_OBJECT('question_text', '你最重视的品质是？', 'options', JSON_ARRAY('诚实', '善良', '智慧', '勇敢'), 'correct_answer', '善良'),
--     JSON_OBJECT('question_text', '你的性格偏向是？', 'options', JSON_ARRAY('外向', '内向', '中间', '情境性'), 'correct_answer', '中间'),
--     JSON_OBJECT('question_text', '你最看重友谊中的什么？', 'options', JSON_ARRAY('信任', '理解', '支持', '陪伴'), 'correct_answer', '理解'),
--     JSON_OBJECT('question_text', '你的人生格言是？', 'options', JSON_ARRAY('努力', '坚持', '善良', '成长'), 'correct_answer', '成长')
--   ),
--   'cofep',  -- reward_id
--   8,  -- min_correct
--   5   -- max_reward_count
-- );