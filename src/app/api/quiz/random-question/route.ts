import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request: NextRequest) {
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

    const connection = await pool.getConnection();
    
    // 获取指定分类下的随机题目
    const [questions] = await connection.execute(
      'SELECT id, question_text, options, difficulty, is_active, created_at FROM quiz_questions WHERE category_id = ? AND is_active = TRUE ORDER BY RAND() LIMIT 1', 
      [categoryIdNum]
    ) as [any[], any];
    
    connection.release();
    
    if (questions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '该分类下暂无题目' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: questions[0] 
    });
  } catch (error: any) {
    console.error('获取随机题目失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}