import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    
    // 获取所有题库分类
    const [categories] = await connection.execute(
      'SELECT id, name, created_at FROM quiz_categories ORDER BY id'
    ) as [any[], any];
    
    connection.release();
    
    return NextResponse.json({ 
      success: true, 
      data: categories 
    });
  } catch (error: any) {
    console.error('获取题库分类失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误，\categories获取题库分类失败:'+error 
    }, { status: 500 });
  }
}