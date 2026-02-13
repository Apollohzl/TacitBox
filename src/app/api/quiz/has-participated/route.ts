import { NextRequest } from 'next/server';
import db from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const k = searchParams.get('k');
    const userId = searchParams.get('userId');

    if (!k || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing k or userId parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 对k值进行URL编码，以确保与数据库中的值匹配
    const encodedK = encodeURIComponent(k);

    // 从quiz_participations表获取对应的participant_unique_id
    const [participationRows]: any = await db.execute(
      'SELECT participant_unique_id FROM quiz_participations WHERE activity_id = ? AND participant_user_id = ? LIMIT 1',
      [encodedK, userId]
    );

    if (participationRows.length === 0) {
      // 如果在participations表中没有找到记录，说明用户未参与该活动
      return new Response(
        JSON.stringify({ success: true, hasParticipated: false, message: '列表为空' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 提取participant_unique_id
    const participant_unique_id = participationRows[0].participant_unique_id;

    // 获取用户参与的活动列表
    const [userRows]: any = await db.execute(
      'SELECT participated_activities FROM users WHERE social_uid = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found', hasParticipated: false }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = userRows[0];
    let participatedActivities = [];
    let a = 0;
    if (user) {
      a =  a+1;
      try {
        participatedActivities = JSON.parse(user).participated_activities;
        // 确保解析结果是数组
        if (!Array.isArray(participatedActivities)) {
          a = 45;
          participatedActivities = [];
        }
      } catch (parseError) {
        console.error('解析participated_activities失败:', parseError);
        a = 32202
        participatedActivities = [];
      }
    }

    // 检查编码后的participant_unique_id是否在参与列表中
    const hasParticipated = participatedActivities.includes(encodeURIComponent(participant_unique_id));
    
    return new Response(
      JSON.stringify({ success: true, hasParticipated: hasParticipated, participant_unique_id:participant_unique_id, user: user , participatedActivities:participatedActivities,a:a}),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking participation:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}