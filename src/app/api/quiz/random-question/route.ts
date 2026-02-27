import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    
    if (!categoryId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少分类ID参数' 
      }, { status: 400 });
    }

    const categoryIdNum = parseInt(categoryId);
    if (isNaN(categoryIdNum)) {
      return NextResponse.json({ 
        success: false, 
        error: '分类ID必须是有效数字' 
      }, { status: 400 });
    }

    // 确保参数是数字类型，以避免MySQL参数类型错误
    const categoryIdForQuery = Number(categoryIdNum);

    connection = await pool.getConnection();
    
    // 获取指定分类下的随机题目
    const [rows] = await connection.execute(
      'SELECT id, question_text, options, difficulty, is_active, created_at FROM quiz_questions WHERE category_id = ? AND is_active = TRUE ORDER BY RAND() LIMIT 1', 
      [categoryIdForQuery+ ""]
    ) as [any[], any];
    
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '该分类下暂无题目' 
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
      error: '服务器内部错误random-question:' +error
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