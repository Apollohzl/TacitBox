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

    // 发起请求到目标服务器
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://tb.vicral.cn/' // 添加Referer头部
      }
    });

    console.log('代理登录响应状态:', response.status, response.statusText); // 添加调试信息
    
    if (!response.ok) {
      // 尝试读取响应体以获取更多错误信息
      let errorText = '';
      try {
        errorText = await response.text();
        console.log('代理登录错误响应:', errorText);
      } catch (e) {
        console.log('无法读取错误响应体:', e);
      }
      
      return NextResponse.json({ 
        error: `请求失败: ${response.status} ${response.statusText}`, 
        errorDetails: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('代理登录成功响应:', data); // 添加调试信息

    // 确保返回的数据格式符合API文档要求
    return NextResponse.json(data);
  } catch (error) {
    console.error('代理登录请求失败:', error);
    return NextResponse.json({ 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}