import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import * as CryptoJS from 'crypto-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { k, participant_user_id, answers } = body;

    // 验證必要參數
    if (!k || !participant_user_id || !answers) {
      return NextResponse.json({
        success: false,
        error: '缺少必要參數'
      }, { status: 400 });
    }

    // 解析答案
    let answers_list: string[];
    if (typeof answers === 'string') {
      try {
        answers_list = JSON.parse(answers);
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: '答案格式錯誤，無法解析JSON'
        }, { status: 400 });
      }
    } else if (Array.isArray(answers)) {
      answers_list = answers;
    } else {
      return NextResponse.json({
        success: false,
        error: '答案格式錯誤'
      }, { status: 400 });
    }

    if (!Array.isArray(answers_list) || answers_list.length !== 10) {
      return NextResponse.json({
        success: false,
        error: '答案必須是包含10個選項的數組'
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      // 1. 提取k值並進行URL編碼儲存為activity_id
      const activity_id = k; // k值已進行過URL編碼
      
      // 4. 請求活動信息
      const activityResponse = await fetch(`${process.env.BASE_URL || 'https://tb.vicral.cn'}/api/quiz/activity-info?id=${activity_id}`);
      const activityResult = await activityResponse.json();
      
      if (!activityResult.success) {
        throw new Error('無法獲取活動信息: ' + activityResult.error);
      }
      
      const { max_reward_count, min_correct, questions } = activityResult.activity;
      
      // 獲取當前獲獎人數，需要查詢quiz_participations表中has_rewarded=1的記錄數
      const [rewardedParticipants] = await connection.execute(
        'SELECT COUNT(*) as count FROM quiz_participations WHERE activity_id = ? AND has_rewarded = 1',
        [activity_id]
      ) as [any[], any];
      const now_get_reward = rewardedParticipants[0]?.count || 0;
      
      // 6. 設計程序對answers_list每一個數據進行批改
      let correct_count = 0;
      for (let i = 0; i < answers_list.length && i < questions.length; i++) {
        if (answers_list[i] === questions[i].correct_answer) {
          correct_count++;
        }
      }

      // 7. 判斷correct_count是否大於等於min_correct
      let has_rewarded: number, is_reward_delivered: number;
      if (correct_count >= min_correct) {
        // 8. 判斷max_reward_count是否大於now_get_reward
        if (max_reward_count > now_get_reward) {
          // 對得獎勵
          has_rewarded = 1;
          is_reward_delivered = 0;
        } else {
          // 沒有獎勵（獎勵已發完）
          has_rewarded = 0;
          is_reward_delivered = 0;
        }
      } else {
        // 沒有獎勵（答題正確數不足）
        has_rewarded = 0;
        is_reward_delivered = 0;
      }

      // 9. 從vercel環境變量獲取SHARE_TODO_KEY的值
      const shareTodoKey = process.env.SHARE_TODO_KEY;
      if (!shareTodoKey) {
        throw new Error('缺少SHARE_TODO_KEY環境變量');
      }
      
      // 10. 拼接現在的時間戳+participant_user_id+activity_id+max_reward_count（轉字符串）+has_rewarded（轉字符串）+現在的時間戳
      const timestamp = Date.now().toString();
      const dataToEncrypt = `${timestamp}${participant_user_id}${activity_id}${max_reward_count.toString()}${has_rewarded.toString()}${timestamp}`;
      
      // 11. 將拼接好的結果用SHARE_TODO_KEY進行對稱加密，儲存為participant_unique_id
      const participant_unique_id = CryptoJS.AES.encrypt(dataToEncrypt, shareTodoKey).toString();

      // 12. 整合結果并向SQLPub數據庫的quiz_participations表添加新數據
      await connection.execute(
        `INSERT INTO quiz_participations 
         (activity_id, participant_user_id, participant_unique_id, answers, correct_count, has_rewarded, is_reward_delivered) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          activity_id,
          participant_user_id,
          participant_unique_id,
          JSON.stringify(answers_list),
          correct_count,
          has_rewarded,
          is_reward_delivered
        ]
      );

      // 更新quiz_activities表中的now_finish（參與人數）
      await connection.execute(
        `UPDATE quiz_activities 
         SET now_finish = now_finish + 1 
         WHERE id = ?`,
        [activity_id]
      );

      connection.release();

      return NextResponse.json({
        success: true,
        message: '提交成功',
        correct_count,
        has_rewarded
      });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('處理提交時發生錯誤:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服務器內部錯誤'
    }, { status: 500 });
  }
}