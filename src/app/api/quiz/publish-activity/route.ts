import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import * as CryptoJS from 'crypto-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      creator_user_id,
      questions,
      reward_id,
      min_correct,
      max_reward_count
    } = body;

    // 验证必要参数
    if (!creator_user_id || !questions || reward_id === undefined || min_correct === undefined || max_reward_count === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 });
    }

    // 验证题目数据格式
    if (!Array.isArray(questions) || questions.length !== 10) {
      return NextResponse.json({ 
        success: false, 
        error: '题目数据格式不正确，必须包含10道题目' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      // 生成加密ID - 使用时间戳和用户ID生成唯一ID
      const timestamp = Date.now();
      const go_to_key = process.env.GO_TO_KEY || 'default_key';
      const unicodeStr = `${timestamp}${creator_user_id}`;
      
      // 使用AES加密
      const encrypted = CryptoJS.AES.encrypt(unicodeStr, go_to_key).toString();
      // 将加密结果转换为十六进制表示
      let activityId = encodeURIComponent(encrypted); // 使用let而不是const，这样可以重新分配

      // 检查活动是否已存在
      const [existingActivities] = await connection.execute(
        'SELECT id FROM quiz_activities WHERE id = ?',
        [activityId]
      ) as [any[], any];

      if (existingActivities.length > 0) {
        // 如果活动已存在，直接报错
        throw new Error('生成的活动ID已存在，请重试');
      }

      // 插入新活动
      await connection.execute(
        `INSERT INTO quiz_activities 
         (id, creator_user_id, questions, reward_id, min_correct, max_reward_count, now_finish) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          activityId,
          creator_user_id,
          JSON.stringify(questions),
          String(reward_id), // 确保奖励ID以字符串形式存储
          min_correct,
          max_reward_count,
          0  // 初始化now_finish为0
        ]
      );

      // 将活动ID添加到用户的published_activities列表中
      try {
        await connection.execute(
          `UPDATE users 
           SET published_activities = JSON_ARRAY_APPEND(published_activities, '$', ?) 
           WHERE social_uid = ?`,
          [activityId, creator_user_id]
        );
      } catch (updateError: any) {
        console.error('更新用户发布的活动列表失败:', updateError);
        // 检查是否是因为published_activities列不存在导致的错误
        if (updateError.message && (updateError.message.includes('Unknown column') || updateError.message.includes('published_activities'))) {
          console.log('警告: 数据库users表中不存在published_activities列，需要手动执行数据库更新脚本');
          // 注意：由于权限限制，我们无法在此处自动创建列
          // 需要管理员手动运行SQL脚本来添加该列
          console.log('请运行以下SQL命令添加列:');
          console.log('ALTER TABLE users ADD COLUMN published_activities JSON DEFAULT JSON_ARRAY() COMMENT \'用户发布的所有测试的专属ID列表，存储为JSON数组格式\';');
        } else {
          console.error('更新published_activities时发生其他错误:', updateError);
        }
      }

      connection.release();

      return NextResponse.json({ 
        success: true,
        message: '题目发布成功',
        activityId: activityId  // 返回生成的活动ID
      });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('发布题目时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器内部错误' 
    }, { status: 500 });
  }
}