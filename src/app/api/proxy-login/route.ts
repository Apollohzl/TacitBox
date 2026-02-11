import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appid = searchParams.get('appid');
    const appkey = searchParams.get('appkey');
    const type = searchParams.get('type');
    const redirect_uri = searchParams.get('redirect_uri');

    // 验证参数
    if (!appid || !appkey || !type || !redirect_uri) {
      return NextResponse.json({ 
        error: '缺少必要参数' 
      }, { status: 400 });
    }

    // 构造目标URL
    const targetUrl = `https://u.daib.cn/connect.php?act=login&appid=${appid}&appkey=${appkey}&type=${type}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    
    console.log('代理登录请求URL:', targetUrl); // 添加调试信息

    // 由于目标服务器 u.daib.cn 使用了 Cloudflare 的安全保护，
    // 服务器端请求会被拦截并返回需要 JavaScript 验证的页面
    // 因此返回一个错误信息，提示前端直接跳转到登录URL
    const loginUrl = targetUrl;
    
    return NextResponse.json({ 
      code: -1,
      msg: '由于安全验证，需要直接跳转到登录页面',
      url: loginUrl  // 返回登录URL，前端可以直接跳转
    });
  } catch (error) {
    console.error('代理登录请求失败:', error);
    return NextResponse.json({ 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}