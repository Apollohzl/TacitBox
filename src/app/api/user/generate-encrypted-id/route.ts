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

    // 生成加密ID - 使用更安全的对称加密方式
    const timestamp = Date.now();
    const unicodeStr = `${timestamp}${social_uid}`;
    
    // 使用环境变量中的Go_To_Key进行加密 (简单示例，实际应使用crypto库)
    const go_to_key = process.env.GO_TO_KEY || 'default_key';
    
    // 简单的字符位移加密（实际项目中应使用crypto库进行AES等加密）
    let encryptedValue = '';
    for (let i = 0; i < unicodeStr.length; i++) {
      const charCode = unicodeStr.charCodeAt(i);
      const keyChar = go_to_key.charCodeAt(i % go_to_key.length);
      encryptedValue += String.fromCharCode(charCode + keyChar);
    }
    
    // 将加密后的字符串转换为十六进制表示
    let hexString = '';
    for (let i = 0; i < encryptedValue.length; i++) {
      hexString += encryptedValue.charCodeAt(i).toString(16).padStart(4, '0');
    }
    
    return NextResponse.json({ 
      success: true, 
      encryptedId: hexString 
    });
  } catch (error) {
    console.error('生成加密ID时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}