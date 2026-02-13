'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('正在加载用户信息。。。');

  useEffect(() => {
    const handleReturn = async () => {
      // a. 检查是否同时拥有type和code参数及数据，没有则跳转/login?error="回调数据失败"
      const type = searchParams.get('type');
      const code = searchParams.get('code');

      if (!type || !code) {
        router.push('/login?error=回调数据失败');
        return;
      }

      try {
        // b. 获取vercel的2个环境变量的值（JUHE_Appkey和JUHE_Appid），内容异常（空/无变量）直接报错，跳转error为"环境变量异常"
        const juheAppkey = process.env.NEXT_PUBLIC_JUHE_Appkey;
        const juheAppid = process.env.NEXT_PUBLIC_JUHE_Appid;

        if (!juheAppkey || !juheAppid) {
          router.push('/login?error=环境变量异常');
          return;
        }

        // c. 发送请求：https://u.daib.cn/connect.php?act=callback&appid={JUHE_Appid}&appkey={JUHE_Appkey}&type={type}&code={code}
        const targetUrl = `https://u.daib.cn/connect.php?act=callback&appid=${juheAppid}&appkey=${juheAppkey}&type=${type}&code=${code}`;
        
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
          }
        });

        // d. 如果请求报错，直接原报错内容返回/login?error=
        if (!response.ok) {
          const errorText = await response.text();
          router.push(`/login?error=${encodeURIComponent(errorText)}`);
          return;
        }

        const userData = await response.json();

        // e. 如果没有报错，获取返回内容的数据（type，access_token，social_uid，faceimg，nickname，location，ip）
        if (!userData.type || !userData.access_token || !userData.social_uid) {
          router.push('/login?error=返回数据不完整');
          return;
        }

        // 获取用户信息
        const { type: userType, access_token, social_uid, faceimg, nickname, location, ip } = userData;

        setMessage('正在保存用户信息...');

        // f. 剩下的什么数据库传输数据，浏览器数据保存啥啥啥的，你就按照原来的程序逻辑补上去就行
        // 将用户信息保存到数据库
        try {
          const saveResponse = await fetch('/api/user/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              social_uid: social_uid,
              social_type: userType,  // 登录类型
              nickname: nickname,
              avatar_url: faceimg,
              gender: userData.gender || '',  // 如果有性别信息
              location: location || '',
              access_token: access_token,
              ip_address: ip
            }),
          });

          if (!saveResponse.ok) {
            console.error('保存用户信息到数据库失败');
          }
        } catch (error) {
          console.error('保存用户信息到数据库时发生错误:', error);
        }

        // 将用户信息保存到localStorage
        localStorage.setItem('social_uid', social_uid);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('login_type', userType);

        // 更新最后登录时间
        try {
          await fetch('/api/user/update-last-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              social_uid: social_uid,
              social_type: userType
            }),
          });
        } catch (error) {
          console.error('更新最后登录时间失败:', error);
        }

        // 跳转到首页
        router.push('/');
      } catch (error) {
        console.error('处理登录回调时发生错误:', error);
        router.push(`/login?error=${encodeURIComponent(error instanceof Error ? error.message : '未知错误')}`);
      }
    };

    handleReturn();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-cyan-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <svg className="animate-spin h-10 w-10 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-gray-700">{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
}