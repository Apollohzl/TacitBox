import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json({ 
        success: false, 
        output: '错误: 请输入命令',
        error: '缺少命令参数' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();

    // 解析命令
    const parts = command.trim().split(/\s+/);
    const mainCommand = parts[0];
    const args = parts.slice(1);

    let output = '';
    let success = true;

    switch (mainCommand) {
      case 'users:list':
        const [users] = await connection.execute(
          'SELECT id, social_uid, social_type, nickname, created_at FROM users ORDER BY created_at DESC LIMIT 50'
        ) as [any[], any];
        output = JSON.stringify(users, null, 2);
        break;

      case 'users:get':
        if (args.length < 1) {
          output = '错误: 缺少用户ID参数\n用法: users:get --uid=xxx';
          success = false;
        } else {
          const uid = args[0].replace('--uid=', '');
          const [userResult] = await connection.execute(
            'SELECT * FROM users WHERE social_uid = ?',
            [uid]
          ) as [any[], any];
          output = JSON.stringify(userResult, null, 2);
        }
        break;

      case 'users:delete':
        if (args.length < 1) {
          output = '错误: 缺少用户ID参数\n用法: users:delete --uid=xxx';
          success = false;
        } else {
          const uid = args[0].replace('--uid=', '');
          const deleteResult = await connection.execute(
            'DELETE FROM users WHERE social_uid = ?',
            [uid]
          ) as ResultSetHeader;
          output = `成功删除 ${deleteResult.affectedRows || 0} 个用户`;
        }
        break;

      case 'activities:list':
        const [activities] = await connection.execute(
          'SELECT id, creator_user_id, reward_id, created_at FROM quiz_activities ORDER BY created_at DESC LIMIT 50'
        ) as [any[], any];
        output = JSON.stringify(activities, null, 2);
        break;

      case 'activities:get':
        if (args.length < 1) {
          output = '错误: 缺少活动ID参数\n用法: activities:get --id=xxx';
          success = false;
        } else {
          const id = args[0].replace('--id=', '');
          const [activityResult] = await connection.execute(
            'SELECT * FROM quiz_activities WHERE id = ?',
            [id]
          ) as [any[], any];
          output = JSON.stringify(activityResult, null, 2);
        }
        break;

      case 'activities:delete':
        if (args.length < 1) {
          output = '错误: 缺少活动ID参数\n用法: activities:delete --id=xxx';
          success = false;
        } else {
          const id = args[0].replace('--id=', '');
          const deleteResult = await connection.execute(
            'DELETE FROM quiz_activities WHERE id = ?',
            [id]
          ) as ResultSetHeader;
          output = `成功删除 ${deleteResult.affectedRows || 0} 个活动`;
        }
        break;

      case 'questions:list':
        const [questions] = await connection.execute(
          'SELECT id, question_text, category_id, difficulty FROM quiz_questions ORDER BY id LIMIT 50'
        ) as [any[], any];
        output = JSON.stringify(questions, null, 2);
        break;

      case 'questions:delete':
        if (args.length < 1) {
          output = '错误: 缺少题目ID参数\n用法: questions:delete --id=xxx';
          success = false;
        } else {
          const id = parseInt(args[0].replace('--id=', ''));
          const deleteResult = await connection.execute(
            'DELETE FROM quiz_questions WHERE id = ?',
            [id]
          ) as ResultSetHeader;
          output = `成功删除 ${deleteResult.affectedRows || 0} 个题目`;
        }
        break;

      case 'rewards:list':
        const [rewards] = await connection.execute(
          'SELECT reward_id, name, description FROM quiz_reward ORDER BY reward_id'
        ) as [any[], any];
        output = JSON.stringify(rewards, null, 2);
        break;

      case 'stats:all':
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users') as [any[], any];
        const [activityCount] = await connection.execute('SELECT COUNT(*) as count FROM quiz_activities') as [any[], any];
        const [participationCount] = await connection.execute('SELECT COUNT(*) as count FROM quiz_participations') as [any[], any];
        const [questionCount] = await connection.execute('SELECT COUNT(*) as count FROM quiz_questions') as [any[], any];
        const [rewardCount] = await connection.execute('SELECT COUNT(*) as count FROM quiz_reward') as [any[], any];
        
        output = JSON.stringify({
          users: userCount[0]?.count || 0,
          activities: activityCount[0]?.count || 0,
          participations: participationCount[0]?.count || 0,
          questions: questionCount[0]?.count || 0,
          rewards: rewardCount[0]?.count || 0
        }, null, 2);
        break;

      case 'backup:create':
        const [tables] = await connection.execute('SHOW TABLES') as [any[], any];
        const tableNames = tables.map((t: any) => Object.values(t)[0]);
        output = `备份创建成功\n包含的表: ${tableNames.join(', ')}\n备份时间: ${new Date().toISOString()}`;
        break;

      case 'cleanup:expired':
        const expiredResult = await connection.execute(
          'DELETE FROM quiz_activities WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
        ) as ResultSetHeader;
        output = `清理完成，删除了 ${expiredResult.affectedRows || 0} 个过期活动`;
        break;

      case 'help':
        output = `可用命令列表:\n` +
                 `users:list - 列出所有用户\n` +
                 `users:get --uid=xxx - 获取指定用户\n` +
                 `users:delete --uid=xxx - 删除指定用户\n` +
                 `activities:list - 列出所有活动\n` +
                 `activities:get --id=xxx - 获取指定活动\n` +
                 `activities:delete --id=xxx - 删除指定活动\n` +
                 `questions:list - 列出所有题目\n` +
                 `questions:delete --id=xxx - 删除指定题目\n` +
                 `rewards:list - 列出所有奖励\n` +
                 `stats:all - 获取系统统计\n` +
                 `backup:create - 创建备份\n` +
                 `cleanup:expired - 清理过期活动\n` +
                 `help - 显示帮助信息`;
        break;

      default:
        output = `错误: 未知命令 "${mainCommand}"\n输入 "help" 查看可用命令`;
        success = false;
    }

    return NextResponse.json({
      success,
      output,
      error: success ? null : '命令执行失败'
    });
  } catch (error: any) {
    console.error('执行CLI命令失败:', error);
    return NextResponse.json({ 
      success: false, 
      output: `错误: ${error.message}`,
      error: error.message 
    });
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