-- 创建测试活动表 (储存用户出的题数据)
CREATE TABLE quiz_activities (
  id VARCHAR(255) PRIMARY KEY,  -- 使用生成的专属ID作为主键
  creator_user_id VARCHAR(255) NOT NULL,  -- 发布测试的用户ID
  questions JSON NOT NULL,  -- 储存10道题目的数据 {question_text, options: [4个选项], correct_answer}
  reward_id INT DEFAULT 0,  -- 用户设置的奖励ID（数字索引）
  min_correct INT DEFAULT 8,  -- 用户设置的至少正确几题
  max_reward_count INT DEFAULT 1,  -- 用户设置的最大奖励数量
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建测试参与记录表 (储存参与测试的用户数据)
CREATE TABLE quiz_participations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id VARCHAR(255) NOT NULL,  -- 测试活动ID (关联quiz_activities表)
  participant_user_id VARCHAR(255),  -- 参与测试的用户ID (可选，未登录用户可为空)
  participant_unique_id VARCHAR(255) NOT NULL,  -- 参与后生成的对应用户专属ID
  answers JSON,  -- 储存用户回答的10道题目的选项
  correct_count INT DEFAULT 0,  -- 答对数量
  has_rewarded TINYINT(1) DEFAULT 0,  -- 是否获得奖励 (1=true/0=false)
  is_reward_delivered TINYINT(1) DEFAULT 0,  -- 出题者是否已经兑现奖励 (1=true/0=false)
  participation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 参与时间
  FOREIGN KEY (activity_id) REFERENCES quiz_activities(id) ON DELETE CASCADE
);

-- 修改用户表，添加答过的活动数据列表
-- 注意：如果您已有users表，请使用ALTER TABLE而不是CREATE TABLE
-- ALTER TABLE users ADD COLUMN participated_activities JSON DEFAULT NULL;

-- 创建索引以提高查询性能
CREATE INDEX idx_quiz_activities_creator ON quiz_activities(creator_user_id);
CREATE INDEX idx_quiz_activities_created_at ON quiz_activities(created_at);
CREATE INDEX idx_quiz_participations_activity ON quiz_participations(activity_id);
CREATE INDEX idx_quiz_participations_user ON quiz_participations(participant_user_id);
CREATE INDEX idx_quiz_participations_unique_id ON quiz_participations(participant_unique_id);
CREATE INDEX idx_quiz_participations_time ON quiz_participations(participation_time);

-- 示例插入数据
-- 插入一个测试活动
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
--   1,  -- reward_id
--   8,  -- min_correct
--   5   -- max_reward_count
-- );

-- 插入一个参与记录
-- INSERT INTO quiz_participations (
--   activity_id,
--   participant_user_id,
--   participant_unique_id,
--   answers,
--   correct_count,
--   has_rewarded
-- ) VALUES (
--   'ENCRYPTED_ID_EXAMPLE',
--   'PARTICIPANT_SOCIAL_UID_EXAMPLE',
--   'PARTICIPANT_UNIQUE_ID_EXAMPLE',
--   JSON_ARRAY(1, 2, 0, 1, 3, 2, 1, 0, 1, 3),  -- 用户选择的答案索引
--   7,  -- 答对数量
--   0   -- 是否获得奖励
-- );