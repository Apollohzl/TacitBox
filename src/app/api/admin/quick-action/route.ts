import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

// 管理员账号列表（与verify端点保持一致）
const ADMIN_ACCOUNTS = [
  { login_type: 'wx', social_uid: 'oTBkp65yKKGHfmezE_pM5NLKgD5w' },
  { login_type: 'qq', social_uid: '11C455F8209EFDD1E6D8FB99A180866F' },
  { login_type: 'qq', social_uid: '018ECF717DFBCA61BE0E97DF18FE7BC1' }
];

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { type, login_type, social_uid, ...data } = await request.json();

    // 验证用户身份
    if (!login_type || !social_uid) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少身份信息' 
      }, { status: 401 });
    }

    // 验证是否为管理员
    const isAdmin = ADMIN_ACCOUNTS.some(
      admin => admin.login_type === login_type && admin.social_uid === social_uid
    );

    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: '无权限访问' 
      }, { status: 403 });
    }

    // 如果是快捷配置类型
    if (type === 'reward' || type === 'category' || type === 'question') {
      connection = await pool.getConnection();

      if (type === 'reward') {
        const { reward_name, reward_description } = data;
        
        if (!reward_name || !reward_name.trim()) {
          return NextResponse.json({ 
            success: false, 
            error: '奖励名称不能为空' 
          }, { status: 400 });
        }

        const result = await connection.execute(
          'INSERT INTO quiz_reward (name, description) VALUES (?, ?)',
          [reward_name.trim(), reward_description || null]
        ) as [ResultSetHeader, any];

        return NextResponse.json({
          success: true,
          data: { insertedId: result[0].insertId }
        });
      } else if (type === 'category') {
        const { name, description } = data;
        
        if (!name || !name.trim()) {
          return NextResponse.json({ 
            success: false, 
            error: '分类名称不能为空' 
          }, { status: 400 });
        }

        const result = await connection.execute(
          'INSERT INTO quiz_categories (name, description) VALUES (?, ?)',
          [name.trim(), description || null]
        ) as [ResultSetHeader, any];

        return NextResponse.json({
          success: true,
          data: { insertedId: result[0].insertId }
        });
      } else if (type === 'question') {
        const { category_id, question_text, options, correct_answer, difficulty } = data;
        
        if (!category_id || !question_text || !question_text.trim() || !options || !options.length || !correct_answer || !correct_answer.trim()) {
          return NextResponse.json({ 
            success: false, 
            error: '请填写所有必填字段' 
          }, { status: 400 });
        }

        const result = await connection.execute(
          'INSERT INTO quiz_questions (category_id, question_text, options, correct_answer, difficulty, is_active) VALUES (?, ?, ?, ?, ?, 1)',
          [category_id, question_text.trim(), JSON.stringify(options), correct_answer.trim(), difficulty || 'easy']
        ) as [ResultSetHeader, any];

        return NextResponse.json({
          success: true,
          data: { insertedId: result[0].insertId }
        });
      }
    }

    // 原有的action逻辑（保留兼容性）
    const { action } = await request.json();

    if (!action) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少操作类型' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();

    let result: any = { success: true, data: {} };

    switch (action) {
      case 'get_all_users':
        const [users] = await connection.execute(
          'SELECT id, social_uid, social_type, nickname, avatar_url, gender, location, created_at, last_login_at FROM users ORDER BY created_at DESC LIMIT 100'
        ) as [any[], any];
        result.data = { users, count: users.length };
        break;

      case 'get_all_activities':
        const [activities] = await connection.execute(
          'SELECT id, creator_user_id, creator_user_type, reward_id, min_correct, max_reward_count, now_finish, created_at FROM quiz_activities ORDER BY created_at DESC LIMIT 100'
        ) as [any[], any];
        result.data = { activities, count: activities.length };
        break;

      case 'get_all_participations':
        const [participations] = await connection.execute(
          'SELECT id, activity_id, participant_user_id, participant_user_type, correct_count, has_rewarded, participation_time FROM quiz_participations ORDER BY participation_time DESC LIMIT 100'
        ) as [any[], any];
        result.data = { participations, count: participations.length };
        break;

      case 'get_all_questions':
        const [questions] = await connection.execute(
          'SELECT id, question_text, category_id, difficulty, is_active, created_at FROM quiz_questions ORDER BY id LIMIT 100'
        ) as [any[], any];
        result.data = { questions, count: questions.length };
        break;

      case 'get_all_rewards':
        const [rewards] = await connection.execute(
          'SELECT reward_id, name, description, created_at FROM quiz_reward ORDER BY reward_id'
        ) as [any[], any];
        result.data = { rewards, count: rewards.length };
        break;

      case 'cleanup_expired_activities':
        const deleteResult = await connection.execute(
          'DELETE FROM quiz_activities WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
        ) as ResultSetHeader;
        result.data = { deletedCount: deleteResult.affectedRows || 0 };
        break;

      case 'get_system_stats':
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users') as [any[], any];
        const [activityCount] = await connection.execute('SELECT COUNT(*) as count FROM quiz_activities') as [any[], any];
        const [participationCount] = await connection.execute('SELECT COUNT(*) as count FROM quiz_participations') as [any[], any];
        const [questionCount] = await connection.execute('SELECT COUNT(*) as count FROM quiz_questions') as [any[], any];
        const [rewardCount] = await connection.execute('SELECT COUNT(*) as count FROM quiz_reward') as [any[], any];
        
        result.data = {
          users: userCount[0]?.count || 0,
          activities: activityCount[0]?.count || 0,
          participations: participationCount[0]?.count || 0,
          questions: questionCount[0]?.count || 0,
          rewards: rewardCount[0]?.count || 0
        };
        break;

      case 'backup_database':
        // 简单的备份示例，实际应用中应该使用专门的备份工具
        const [allTables] = await connection.execute('SHOW TABLES') as [any[], any];
        const tables = allTables.map((t: any) => Object.values(t)[0]);
        result.data = { tables, backup_time: new Date().toISOString() };
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          error: '未知的操作类型' 
        }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('执行快捷操作失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '服务器内部错误' 
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('释放数据库连接时出错:', releaseError);
      }
    }
  }
}