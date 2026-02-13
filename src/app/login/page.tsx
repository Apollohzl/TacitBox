'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);

  // 检查用户是否已登录
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      const storedSocialUid = localStorage.getItem('social_uid');
      
      if (storedIsLoggedIn === 'true' && storedSocialUid) {
        // 如果用户已登录，重定向到主页
        router.push('/');
        return;
      }
      setCheckingLogin(false);
    };
    
    checkLoginStatus();
  }, [router]);

  // 获取URL参数中的错误信息
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleLogin = async (type: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 请求/connect API并传递type参数
      const connectResponse = await fetch(`/api/connect?type=${type}`);
      
      if (!connectResponse.ok) {
        const errorData = await connectResponse.json();
        throw new Error(errorData.error || `请求失败: ${connectResponse.status}`);
      }
      
      const data = await connectResponse.json();
      
      if (data.url) {
        // 跳转到返回的URL
        window.location.href = data.url;
      } else {
        throw new Error('获取登录地址失败');
      }
    } catch (err: any) {
      console.error('登录请求失败:', err);
      setError(err.message || '登录请求失败');
    } finally {
      setLoading(false);
    }
  };

  if (checkingLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <p className="text-gray-700">检查登录状态中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">默契盒子</h1>
          <p className="text-gray-600">登录以开始体验</p>
        </div>

        <div className="space-y-4">
          <button
            id="sign_type"
            onClick={() => handleLogin('wx')}
            disabled={loading}
            className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold text-lg transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
            }`}
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                跳转中...
              </span>
            ) : (
              <span className="flex items-center">
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDYiIGhlaWdodD0iOTgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAzMDYgOTgiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik01Ny44MyAyOS45NGMtMi44MyAwLTUuMTMtMi4zMS01LjEzLTUuMTdzMi4zLTUuMTcgNS4xMy01LjE3IDUuMTMgMi4zMSA1LjEzIDUuMTctMi4zIDUuMTctNS4xMyA1LjE3bS0yOC45MSAwYy0yLjgzIDAtNS4xMy0yLjMxLTUuMTMtNS4xN3MyLjMtNS4xNyA1LjEzLTUuMTcgNS4xMyAyLjMxIDUuMTMgNS4xNy0yLjMgNS4xNy01LjEzIDUuMTdNNDMuMzcgMEMxOS40MiAwIDAgMTYuMzEgMCAzNi40M2MwIDEwLjk4IDUuODQgMjAuODYgMTQuOTkgMjcuNTQuNzMuNTMgMS4yMSAxLjM5IDEuMjEgMi4zOCAwIC4zMi0uMDcuNjItLjE1LjkzLS43MyAyLjc1LTEuOSA3LjE0LTEuOTUgNy4zNS0uMDkuMzUtLjIzLjctLjIzIDEuMDcgMCAuOC42NSAxLjQ2IDEuNDUgMS40Ni4zMSAwIC41Ny0uMTIuODMtLjI3bDkuNS01LjUzYy43MS0uNDEgMS40Ny0uNjcgMi4zLS42Ny40NCAwIC44Ny4wNyAxLjI4LjE5IDQuNDMgMS4yOCA5LjIxIDIgMTQuMTYgMiAuOCAwIDEuNTktLjAyIDIuMzgtLjA2LS45NC0yLjg0LTEuNDYtNS44My0xLjQ2LTguOTMgMC0xOC4zNSAxNy43MS0zMy4yMyAzOS41Ni0zMy4yMy43OSAwIC45OS4wMyAxLjc3LjA2QzgyLjM2IDEzLjMxIDY1LjAxIDAgNDMuMzcgMCIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik05NS45IDU4LjcxYy0yLjQ5IDAtNC41MS0yLjA0LTQuNTEtNC41NXMyLjAyLTQuNTUgNC41MS00LjU1IDQuNTEgMi4wNCA0LjUxIDQuNTUtMi4wMiA0LjU1LTQuNTEgNC41NW0tMjQuMSAwYy0yLjQ5IDAtNC41MS0yLjA0LTQuNTEtNC41NXMyLjAyLTQuNTUgNC41MS00LjU1IDQuNTEgMi4wNCA0LjUxIDQuNTUtMi4wMiA0LjU1LTQuNTEgNC41NW0zNS43IDI4LjExYzcuNjItNS41NyAxMi40OS0xMy44IDEyLjQ5LTIyLjk1IDAtMTYuNzctMTYuMTgtMzAuMzYtMzYuMTQtMzAuMzZTNDcuNyA0Ny4xIDQ3LjcgNjMuODdzMTYuMTggMzAuMzYgMzYuMTUgMzAuMzZjNC4xMiAwIDguMTEtLjU5IDExLjgtMS42Ni4zNC0uMS42OS0uMTYgMS4wNi0uMTYuNjkgMCAxLjMyLjIxIDEuOTIuNTZsNy45MSA0LjZjLjIyLjEzLjQ0LjIzLjcuMjMuNjcgMCAxLjIxLS41NCAxLjIxLTEuMjEgMC0uMy0uMTItLjYtLjE5LS44OS0uMDUtLjE3LTEuMDItMy44NC0xLjYzLTYuMTItLjA3LS4yNi0uMTMtLjUxLS4xMy0uNzcgMC0uODIuNC0xLjU0IDEuMDEtMS45OG0zNS4wMS00Mi41YzQuMjUtMy40IDguMTMtNy4xMSAxMS42NS0xMS4xMy43OS0uNjggMS42Mi0xLjAyIDIuNDctMS4wMnMxLjYuMjggMi4yNS44NS45OCAxLjI4Ljk4IDIuMTJ2NDcuNDNjMCAuNC0uMTEuNzEtLjM0Ljk0cy0uNDguMzQtLjc2LjM0aC00LjI1Yy0uMzQgMC0uNjItLjExLS44NS0uMzRzLS4zNC0uNTQtLjM0LS43OHMtLjU0LS4zNC0uNzgtLjM0aC00LjI1di00LjI1Yy0uMyAwLS41NC0uMTEtLjc4LS4zNHMtLjM0LS40OS0uMzQtLjc4di0xMi43NWMwLS4zLjExLS41NC4zNC0uNzhzLjQ5LS4zNC43OC0uMzRoNC4yNXYtNC4yNWMwLS4zLjExLS41NC4zNC0uNzhzLjQ5LS4zNC43OC0uMzRoMTIuNzVjLjMgMCAuNTQuMTEuNzguMzRzLjM0LjQ5LjM0Ljc4djQuMjVoNC4yNWMuMyAwIC41NC4xMS43OC4zNHMuMzQuNDkuMzQuNzh2MTIuNzVjMCAuMy0uMTEuNTQtLjM0Ljc4cy0uNDkuMzQtLjc4LjM0aC00LjI1di00LjI1Yy0uMyAwLS41NC0uMTEtLjc4LS4zNHMtLjM0LS40OS0uMzQtLjc4di00LjI1Yy0uMyAwLS41NC0uMTEtLjc4LS4zNHMtLjM0LS40OS0uMzQtLjc4di0xLjUyYzAtLjM4LjA4LS43MS4yMy0uOTkuMTUtLjI4LjM1LS41MS42MS0uNjkuMjYtLjE4LjU2LS4yOC45LS4yOC4zNCAwIC42NC4xLjksLjI4LjI2LjE4LjQ2LjQxLjYxLjY5LjE1LjI4LjIzLjYxLjIzLjk5djEuNTJjMCAuMy0uMTEuNTQtLjM0Ljc4cy0uNDkuMzQtLjc4LjM0aC00LjI1Yy0uMyAwLS41NC0uMTEtLjc4LS4zNHMtLjM0LS40OS0uMzQtLjc4di00LjI1Yy0uMyAwLS41NC0uMTEtLjc4LS4zNHMtLjM0LS40OS0uMzQtLjc4di00LjI1Yy0uMyAwLS41NC0uMTEtLjc4LS4zNHMtLjM0LS40OS0uMzQtLjc4di0xMi43NWMwLS4zLjExLS41NC4zNC0uNzhzLjQ5LS4zNC43OC0uMzRoNC4yNXY0LjI1YzAgLjM1LS4xMy42Ni0uMzguOTAuMjUuMjQuMzguNTUuMzguOTAiLz48L3N2Zz4="
                  alt="微信图标" 
                  className="w-6 h-6 mr-2" 
                />
                微信登录
              </span>
            )}
          </button>

          <button
            id="sign_type"
            onClick={() => handleLogin('qq')}
            disabled={loading}
            className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold text-lg transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            }`}
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
          >
            <span className="flex items-center">
              <Image 
                src="https://qq-web.cdn-go.cn/monorepo/f414dc61/zc.qq.com_v3/assets/qq-logo-t-50bcQd.svg" 
                alt="QQ图标" 
                width={24} 
                height={24} 
                className="w-6 h-6 mr-2" 
              />
              QQ登录
            </span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            {error}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          <p>登录即表示您同意我们的服务条款和隐私政策</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;