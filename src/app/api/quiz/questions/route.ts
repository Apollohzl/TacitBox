import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const limit = searchParams.get('limit') || '10';
    
    if (!categoryId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少分类ID参数' 
      }, { status: 400 });
    }

    const categoryIdNum = parseInt(categoryId);
    const limitNum = parseInt(limit);

    if (isNaN(categoryIdNum) || isNaN(limitNum)) {
      return NextResponse.json({ 
        success: false, 
        error: '分类ID和限制数必须是有效数字' 
      }, { status: 400 });
    }

    // 确保参数是数字类型，以避免MySQL参数类型错误
    const categoryIdForQuery = Number(categoryIdNum);
    const limitForQuery = Number(limitNum);

    const connection = await pool.getConnection();
    
    // 获取指定分类下的题目
    const [rows] = await connection.execute(
      'SELECT id, question_text, options, difficulty, is_active, created_at FROM quiz_questions WHERE category_id = ? AND is_active = TRUE ORDER BY id LIMIT ?', 
      [categoryIdForQuery, limitForQuery]
    ) as [any[], any];
    
    connection.release();
    
    // 处理JSON字段
    const questions = rows.map((row: any) => {
      // 如果options是JSON字符串，解析它
      let parsedOptions = row.options;
      if (typeof row.options === 'string') {
        try {
          parsedOptions = JSON.parse(row.options);
        } catch (e) {
          console.warn('解析选项JSON失败:', e);
          parsedOptions = row.options; // 保持原始值
        }
      }
      
      return {
        ...row,
        options: parsedOptions
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      data: questions 
    });
  } catch (error: any) {
    console.error('获取题目失败:', error);
    // 为了安全起见，我们不返回具体的错误信息给客户端
    // 但在服务器端记录详细错误
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}