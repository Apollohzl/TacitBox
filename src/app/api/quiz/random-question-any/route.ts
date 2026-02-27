import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const excludeCategoryId = searchParams.get('excludeCategoryId'); // 可选：排除的分类ID

    connection = await pool.getConnection();
    
    // 构建查询：从所有分类中随机选择一个分类，然后从中获取随机题目
    let query = `
      SELECT q.id, q.question_text, q.options, q.difficulty, q.is_active, q.created_at, q.category_id, c.name as category_name
      FROM quiz_questions q
      JOIN quiz_categories c ON q.category_id = c.id
      WHERE q.is_active = TRUE
    `;
    
    const params: any[] = [];
    
    // 如果指定了要排除的分类ID
    if (excludeCategoryId) {
      query += ' AND q.category_id != ?';
      params.push(parseInt(excludeCategoryId));
    }
    
    // 使用子查询先随机选择一个分类，然后从该分类中随机选择题目
    query += ' ORDER BY RAND() LIMIT 1';
    
    const [rows] = await connection.execute(
      query,
      params
    ) as [any[], any];
    
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '暂无题目' 
      }, { status: 404 });
    }
    
    // 处理JSON字段
    const question = rows[0];
    let parsedOptions = question.options;
    if (typeof question.options === 'string') {
      try {
        parsedOptions = JSON.parse(question.options);
      } catch (e) {
        console.warn('解析选项JSON失败:', e);
        parsedOptions = question.options; // 保持原始值
      }
    }
    
    const result = {
      ...question,
      options: parsedOptions
    };
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    console.error('获取随机题目失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误random-question-any:' +error
    }, { status: 500 });
  } finally {
    // 确保连接被释放，无论是否发生错误
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('释放数据库连接时出错:', releaseError);
      }
    }
  }
}