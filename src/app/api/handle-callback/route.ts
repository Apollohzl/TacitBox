import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const code = searchParams.get('code');

    // 检查是否同时拥有type和code参数及数据
    if (!type || !code) {
      return NextResponse.json({ 
        success: false,
        error: '回调数据失败'
      }, { status: 400 });
    }

    // 获取环境变量
    const juheAppkey = process.env.JUHE_Appkey;
    const juheAppid = process.env.JUHE_Appid;

    if (!juheAppkey || !juheAppid) {
      return NextResponse.json({ 
        success: false,
        error: '环境变量异常'
      }, { status: 500 });
    }

    // 发送请求：https://u.daib.cn/connect.php?act=callback&appid={JUHE_Appid}&appkey={JUHE_Appkey}&type={type}&code={code}
    const targetUrl = `https://u.daib.cn/connect.php?act=callback&appid=${juheAppid}&appkey=${juheAppkey}&type=${type}&code=${code}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        success: false,
        error: errorText
      }, { status: response.status });
    }

    const userData = await response.json();

    // 检查返回数据完整性
    if (!userData.type || !userData.access_token || !userData.social_uid) {
      return NextResponse.json({ 
        success: false,
        error: '返回数据不完整'
      }, { status: 500 });
    }

    // 返回用户数据
    return NextResponse.json({ 
      success: true,
      userData: userData
    });
  } catch (error) {
    console.error('处理回调时发生错误:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}