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
    const code = searchParams.get('code');

    // 验证参数
    if (!appid || !appkey || !type || !code) {
      return NextResponse.json({ 
        error: '缺少必要参数' 
      }, { status: 400 });
    }

    // 构造目标URL
    const targetUrl = `https://u.zibll1.com/connect.php?act=callback&appid=${appid}&appkey=${appkey}&type=${type}&code=${code}`;

    // 发起请求到目标服务器
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return NextResponse.json({ 
        error: `请求失败: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('代理回调请求失败:', error);
    return NextResponse.json({ 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}