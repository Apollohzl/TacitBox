import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');

    connection = await pool.getConnection();

    if (table) {
      // 获取表的总行数
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM ${table}`
      ) as [any[], any];
      const totalCount = countResult[0]?.total || 0;
      
      // 获取指定表的所有数据
      const [rows] = await connection.execute(`SELECT * FROM ${table}`) as [any[], any];
      
      // 获取表结构
      const [columns] = await connection.execute(`DESCRIBE ${table}`) as [any[], any];
      
      return NextResponse.json({
        success: true,
        data: {
          table,
          columns: columns.map((col: any) => col.Field),
          rows,
          rowCount: totalCount // 使用真实的总行数
        }
      });
    } else {
      // 获取所有表
      const [tables] = await connection.execute('SHOW TABLES') as [any[], any];
      const tableNames = tables.map((t: any) => Object.values(t)[0]);
      
      // 获取每个表的行数
      const tableStats = await Promise.all(
        tableNames.map(async (tableName: string) => {
          const [count] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${tableName}`
          ) as [any[], any];
          return {
            name: tableName,
            count: count[0]?.count || 0
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          tables: tableStats
        }
      });
    }
  } catch (error: any) {
    console.error('获取数据库数据失败:', error);
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

// POST方法用于执行SQL
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { sql, params } = await request.json();

    if (!sql) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少SQL语句' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();

    let result: any = null;
    
    // 如果有参数，使用参数化查询
    if (params && Array.isArray(params)) {
      result = await connection.execute(sql, params);
    } else {
      result = await connection.execute(sql);
    }
    
    let data: any = null;
    
    if (Array.isArray(result) && result.length > 0) {
      const [rows] = result;
      if (rows && Array.isArray(rows)) {
        data = rows;
      } else if (typeof result[1] === 'object' && 'affectedRows' in result[1]) {
        data = { affectedRows: result[1].affectedRows };
      }
    } else if (typeof result === 'object' && 'affectedRows' in result) {
      data = { affectedRows: result.affectedRows };
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('执行SQL失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
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