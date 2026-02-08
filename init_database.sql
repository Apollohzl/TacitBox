-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    social_uid VARCHAR(255) UNIQUE NOT NULL COMMENT '第三方登录UID',
    social_type VARCHAR(50) NOT NULL COMMENT '登录方式，如：wx, qq, alipay等',
    nickname VARCHAR(255) NOT NULL COMMENT '用户昵称',
    avatar_url TEXT COMMENT '用户头像URL',
    gender VARCHAR(10) COMMENT '用户性别',
    location VARCHAR(255) COMMENT '用户所在地',
    access_token VARCHAR(255) COMMENT '第三方登录token',
    ip_address VARCHAR(45) COMMENT '用户登录IP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后登录时间'
);

-- 创建用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '关联users表的ID',
    username VARCHAR(255) COMMENT '用户名',
    email VARCHAR(255) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '电话',
    birthday DATE COMMENT '生日',
    bio TEXT COMMENT '个人简介',
    preferences JSON COMMENT '用户偏好设置',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX idx_social_uid_type ON users(social_uid, social_type);
CREATE INDEX idx_last_login ON users(last_login_at);