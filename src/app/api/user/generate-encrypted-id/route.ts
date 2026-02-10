import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const social_uid = searchParams.get('social_uid');

    if (!social_uid) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数 social_uid' 
      }, { status: 400 });
    }

    // 生成加密ID
    const timestamp = Date.now();
    const unicodeStr = `${timestamp}${social_uid}`;
    const encodedStr = encodeURIComponent(unicodeStr);
    
    // 使用环境变量中的Go_To_Key进行加密
    const go_to_key = process.env.GO_TO_KEY || 'default_key';
    const encryptedValue = btoa(encodedStr + go_to_key); // 使用base64编码

    return NextResponse.json({ 
      success: true, 
      encryptedId: encryptedValue 
    });
  } catch (error) {
    console.error('生成加密ID时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}