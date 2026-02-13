import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // a. 检查是否有type参数值，没有则报错
    if (!type) {
      return NextResponse.json({ 
        error: '缺少type参数' 
      }, { status: 400 });
    }

    // b. 获取vercel的2个环境变量的值（JUHE_Appkey和JUHE_Appid），内容异常（空/无变量）直接报错，传回error为"环境变量异常"
    const juheAppkey = process.env.JUHE_Appkey;
    const juheAppid = process.env.JUHE_Appid;

    if (!juheAppkey || !juheAppid) {
      return NextResponse.json({ 
        error: '环境变量异常' 
      }, { status: 500 });
    }

    // c. 发送请求：https://u.daib.cn/connect.php?act=login&appid={JUHE_Appid}&appkey={JUHE_Appkey}&type={type}&redirect_uri=https://tb.vicral.cn/return
    const targetUrl = `https://u.daib.cn/connect.php?act=login&appid=${juheAppid}&appkey=${juheAppkey}&type=${type}&redirect_uri=${encodeURIComponent('https://tb.vicral.cn/return')}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://tb.vicral.cn/'
      }
    });

    // d. 如果请求报错，直接原报错内容返回过去
    if (!response.ok) {
      return NextResponse.json({ 
        error: `请求失败: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }

    const data = await response.json();

    // e. 如果没有报错，获取结果中的"url"值
    if (!data.url) {
      return NextResponse.json({ 
        error: '返回数据中缺少URL' 
      }, { status: 500 });
    }

    // f. 直接在本页面跳转到这个"url"的值。
    return NextResponse.json({ 
      url: data.url 
    });
  } catch (error) {
    // 如果请求过程中出现错误，返回错误信息
    console.error('连接请求失败:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '连接请求失败' 
    }, { status: 500 });
  }
}