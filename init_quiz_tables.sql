-- 创建题库分类表
CREATE TABLE IF NOT EXISTS quiz_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建题目表
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSON,
  correct_answer VARCHAR(255),
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES quiz_categories(id) ON DELETE CASCADE
);

-- 插入题库分类数据
INSERT INTO quiz_categories (name) VALUES
('学校生活'),
('个人喜好'),
('游戏世界'),
('中奖率高'),
('美食口味'),
('择偶标准'),
('你懂我吗'),
('性格特征'),
('心理匹配'),
('人际交往'),
('有趣灵魂'),
('日常了解'),
('生活细节'),
('三观匹配'),
('情侣测试');

-- 插入学校生活分类的题目
INSERT INTO quiz_questions (category_id, question_text, options, correct_answer, difficulty) VALUES
(1, '你最喜欢的校园角落是哪里？', JSON_ARRAY('图书馆', '操场', '食堂', '教室'), '图书馆', 'medium'),
(1, '你最难忘的一堂课是哪一节？', JSON_ARRAY('体育课', '数学课', '语文课', '实验课'), '实验课', 'medium'),
(1, '你在学校最喜欢的季节是？', JSON_ARRAY('春天（开学季）', '夏天（暑假前）', '秋天（开学典礼）', '冬天（寒假前）'), '秋天（开学典礼）', 'medium'),
(1, '你通常如何度过课间十分钟？', JSON_ARRAY('和朋友聊天', '做作业', '去小卖部', '在教室里休息'), '和朋友聊天', 'easy'),
(1, '你最擅长的学科是？', JSON_ARRAY('理科（数学、物理、化学等）', '文科（语文、历史、地理等）', '外语', '体育艺术'), '文科（语文、历史、地理等）', 'medium'),
(1, '你最希望学校增加的设施是？', JSON_ARRAY('更多实验室', '健身房', '休闲活动区', '电子阅览室'), '健身房', 'medium'),
(1, '你如何处理同学间的小矛盾？', JSON_ARRAY('直接沟通解决', '找老师帮助', '暂时冷处理', '请共同朋友调解'), '直接沟通解决', 'hard'),
(1, '你最喜欢哪种学习方式？', JSON_ARRAY('独自学习', '小组讨论', '听老师讲解', '实践操作'), '小组讨论', 'medium'),
(1, '你对课后作业的态度是？', JSON_ARRAY('认真完成，追求质量', '按时完成，保证数量', '有选择性地做', '临时抱佛脚'), '认真完成，追求质量', 'easy'),
(1, '你最期待学校的哪种活动？', JSON_ARRAY('运动会', '文艺演出', '学科竞赛', '社团活动'), '运动会', 'medium');