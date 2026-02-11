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
        // 如果活动已存在，生成新的ID
        const newTimestamp = Date.now() + Math.floor(Math.random() * 1000);
        const newUnicodeStr = `${newTimestamp}${creator_user_id}`;
        
        // 使用AES加密
        const newEncrypted = CryptoJS.AES.encrypt(newUnicodeStr, go_to_key).toString();
        let finalActivityId = encodeURIComponent(newEncrypted);
        let idExists = true;
        let attempts = 0;
        
        while (idExists && attempts < 10) {
          const [checkQuery] = await connection.execute(
            'SELECT id FROM quiz_activities WHERE id = ?',
            [finalActivityId]
          ) as [any[], any];
          
          if (checkQuery.length === 0) {
            idExists = false;
          } else {
            // 生成一个稍微不同的ID
            const retryTimestamp = Date.now() + Math.floor(Math.random() * 1000) + attempts;
            const retryUnicodeStr = `${retryTimestamp}${creator_user_id}`;
            const retryEncrypted = CryptoJS.AES.encrypt(retryUnicodeStr, go_to_key).toString();
            finalActivityId = encodeURIComponent(retryEncrypted);
            attempts++;
          }
        }
        
        if (idExists) {
          throw new Error('无法生成唯一活动ID');
        }
        
        activityId = finalActivityId;  // 现在可以重新分配，因为activityId是let声明的
      }

      // 插入新活动
      await connection.execute(
        `INSERT INTO quiz_activities 
         (id, creator_user_id, questions, reward_id, min_correct, max_reward_count) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          activityId,
          creator_user_id,
          JSON.stringify(questions),
          String(reward_id), // 确保奖励ID以字符串形式存储
          min_correct,
          max_reward_count
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
      } catch (updateError) {
        console.error('更新用户发布的活动列表失败:', updateError);
        // 这里可能是因为published_activities列不存在，可以忽略此错误或记录日志
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