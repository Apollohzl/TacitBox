import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 管理员账号列表
const ADMIN_ACCOUNTS = [
  { login_type: 'wx', social_uid: 'oTBkp65yKKGHfmezE_pM5NLKgD5w' },
  { login_type: 'qq', social_uid: '11C455F8209EFDD1E6D8FB99A180866F' }
];

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { login_type, social_uid } = await request.json();

    if (!login_type || !social_uid) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数: login_type 和 social_uid' 
      }, { status: 400 });
    }

    // 验证是否为管理员账号
    const isAdmin = ADMIN_ACCOUNTS.some(
      admin => admin.login_type === login_type && admin.social_uid === social_uid
    );

    if (isAdmin) {
      return NextResponse.json({
        success: true,
        data: {
          login_type,
          social_uid,
          is_admin: true
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '无权限访问'
      }, { status: 403 });
    }
  } catch (error: any) {
    console.error('管理员验证失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}