import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

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
      const encodedStr = encodeURIComponent(unicodeStr);
      
      // 简单的字符位移加密（实际项目中应使用crypto库进行AES等加密）
      let encryptedValue = '';
      for (let i = 0; i < unicodeStr.length; i++) {
        const charCode = unicodeStr.charCodeAt(i);
        const keyChar = go_to_key.charCodeAt(i % go_to_key.length);
        encryptedValue += String.fromCharCode(charCode + keyChar);
      }
      
      // 将加密后的字符串转换为十六进制表示
      let hexString = '';
      for (let i = 0; i < encryptedValue.length; i++) {
        hexString += encryptedValue.charCodeAt(i).toString(16).padStart(4, '0');
      }
      
      const activityId = hexString; // 使用加密后的字符串作为活动ID

      // 检查活动是否已存在
      const [existingActivities] = await connection.execute(
        'SELECT id FROM quiz_activities WHERE id = ?',
        [activityId]
      ) as [any[], any];

      if (existingActivities.length > 0) {
        // 如果活动已存在，生成新的ID
        const newTimestamp = Date.now() + Math.floor(Math.random() * 1000);
        const newUnicodeStr = `${newTimestamp}${creator_user_id}`;
        let newEncryptedValue = '';
        for (let i = 0; i < newUnicodeStr.length; i++) {
          const charCode = newUnicodeStr.charCodeAt(i);
          const keyChar = go_to_key.charCodeAt(i % go_to_key.length);
          newEncryptedValue += String.fromCharCode(charCode + keyChar);
        }
        
        let newHexString = '';
        for (let i = 0; i < newEncryptedValue.length; i++) {
          newHexString += newEncryptedValue.charCodeAt(i).toString(16).padStart(4, '0');
        }
        
        // 确保ID唯一
        let finalActivityId = newHexString;
        let idExists = true;
        let attempts = 0;
        
        while (idExists && attempts < 10) {
          const checkQuery = await connection.execute(
            'SELECT id FROM quiz_activities WHERE id = ?',
            [finalActivityId]
          ) as [any[], any];
          
          if (checkQuery.length === 0) {
            idExists = false;
          } else {
            // 生成一个稍微不同的ID
            finalActivityId = `${newHexString}${attempts}`;
            attempts++;
          }
        }
        
        if (idExists) {
          throw new Error('无法生成唯一活动ID');
        }
        
        activityId = finalActivityId;
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
          reward_id,
          min_correct,
          max_reward_count
        ]
      );

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