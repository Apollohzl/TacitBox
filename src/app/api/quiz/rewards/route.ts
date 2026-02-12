import { NextRequest } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    
    // 从quiz_reward表中获取所有奖励
    const [rewards] = await connection.execute(
      'SELECT reward_id, name, reward_message FROM quiz_reward'
    ) as [any[], any];
    
    connection.release();
    
    return new Response(JSON.stringify({ 
      success: true, 
      rewards: rewards 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('获取奖励列表失败:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: '获取奖励列表失败' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}