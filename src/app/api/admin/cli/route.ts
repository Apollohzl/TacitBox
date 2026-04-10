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

    // 检查是否是SQL命令（以SELECT、INSERT、UPDATE、DELETE等开头）
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'SHOW', 'DESCRIBE', 'EXPLAIN'];
    const isSQL = sqlKeywords.some(keyword => command.trim().toUpperCase().startsWith(keyword));

    let output = '';
    let success = true;
    let error = null;

    if (isSQL) {
      // 直接执行SQL命令
      try {
        const result = await connection.execute(command);
        
        // 处理结果
        if (Array.isArray(result) && result.length > 0) {
          const [rows, fields] = result;
          if (rows && Array.isArray(rows)) {
            output = JSON.stringify(rows, null, 2);
          } else if (fields && typeof fields === 'object' && 'affectedRows' in fields) {
            output = `执行成功，影响 ${fields.affectedRows} 行`;
          } else {
            output = '执行成功';
          }
        } else if (typeof result === 'object' && 'affectedRows' in result) {
          output = `执行成功，影响 ${result.affectedRows} 行`;
        } else {
          output = '执行成功';
        }
      } catch (sqlError: any) {
        success = false;
        output = `SQL执行错误: ${sqlError.message}`;
        error = sqlError.message;
      }
    } else {
      // 原有的命令行逻辑
      const parts = command.trim().split(/\s+/);
      const mainCommand = parts[0];
      const args = parts.slice(1);

      switch (mainCommand) {
        case 'help':
          output = `可用命令列表:\n` +
                   `SQL命令: 直接输入SQL语句执行\n` +
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
          output = `错误: 未知命令 "${mainCommand}"\n输入 "help" 查看可用命令，或直接输入SQL语句`;
          success = false;
      }
    }

    return NextResponse.json({
      success,
      output,
      error
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