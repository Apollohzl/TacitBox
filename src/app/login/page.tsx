'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWechatLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: 获取跳转登录地址
      const response = await fetch(
        `https://u.daib.cn/connect.php?act=login&appid=2423&appkey=5182677ea009b870808053105a2ded54&type=wx&redirect_uri=${encodeURIComponent(window.location.origin + '/login/process')}`
      );

      const data = await response.json();

      if (data.code === 0) {
        // Step 2: 跳转到登录地址
        window.location.href = data.url;
      } else {
        setError(data.msg || '获取登录地址失败');
      }
    } catch (err) {
      console.error('登录请求失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">默契盒子</h1>
          <p className="text-gray-600">登录以开始体验</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleWechatLogin}
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
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDYiIGhlaWdodD0iOTgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAzMDYgOTgiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik01Ny44MyAyOS45NGMtMi44MyAwLTUuMTMtMi4zMS01LjEzLTUuMTdzMi4zLTUuMTcgNS4xMy01LjE3IDUuMTMgMi4zMSA1LjEzIDUuMTctMi4zIDUuMTctNS4xMyA1LjE3bS0yOC45MSAwYy0yLjgzIDAtNS4xMy0yLjMxLTUuMTMtNS4xN3MyLjMtNS4xNyA1LjEzLTUuMTcgNS4xMyAyLjMxIDUuMTMgNS4xNy0yLjMgNS4xNy01LjEzIDUuMTdNNDMuMzcgMEMxOS40MiAwIDAgMTYuMzEgMCAzNi40M2MwIDEwLjk4IDUuODQgMjAuODYgMTQuOTkgMjcuNTQuNzMuNTMgMS4yMSAxLjM5IDEuMjEgMi4zOCAwIC4zMi0uMDcuNjItLjE1LjkzLS43MyAyLjc1LTEuOSA3LjE0LTEuOTUgNy4zNS0uMDkuMzUtLjIzLjctLjIzIDEuMDcgMCAuOC42NSAxLjQ2IDEuNDUgMS40Ni4zMSAwIC41Ny0uMTIuODMtLjI3bDkuNS01LjUzYy43MS0uNDEgMS40Ny0uNjcgMi4zLS42Ny40NCAwIC44Ny4wNyAxLjI4LjE5IDQuNDMgMS4yOCA5LjIxIDIgMTQuMTYgMiAuOCAwIDEuNTktLjAyIDIuMzgtLjA2LS45NC0yLjg0LTEuNDYtNS44My0xLjQ2LTguOTMgMC0xOC4zNSAxNy43MS0zMy4yMyAzOS41Ni0zMy4yMy43OSAwIC45OS4wMyAxLjc3LjA2QzgyLjM2IDEzLjMxIDY1LjAxIDAgNDMuMzcgMCIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik05NS45IDU4LjcxYy0yLjQ5IDAtNC41MS0yLjA0LTQuNTEtNC41NXMyLjAyLTQuNTUgNC41MS00LjU1IDQuNTEgMi4wNCA0LjUxIDQuNTUtMi4wMiA0LjU1LTQuNTEgNC41NW0tMjQuMSAwYy0yLjQ5IDAtNC41MS0yLjA0LTQuNTEtNC41NXMyLjAyLTQuNTUgNC41MS00LjU1IDQuNTEgMi4wNCA0LjUxIDQuNTUtMi4wMiA0LjU1LTQuNTEgNC41NW0zNS43IDI4LjExYzcuNjItNS41NyAxMi40OS0xMy44IDEyLjQ5LTIyLjk1IDAtMTYuNzctMTYuMTgtMzAuMzYtMzYuMTQtMzAuMzZTNDcuNyA0Ny4xIDQ3LjcgNjMuODdzMTYuMTggMzAuMzYgMzYuMTUgMzAuMzZjNC4xMiAwIDguMTEtLjU5IDExLjgtMS42Ni4zNC0uMS42OS0uMTYgMS4wNi0uMTYuNjkgMCAxLjMyLjIxIDEuOTIuNTZsNy45MSA0LjZjLjIyLjEzLjQ0LjIzLjcuMjMuNjcgMCAxLjIxLS41NCAxLjIxLTEuMjEgMC0uMy0uMTItLjYtLjE5LS44OS0uMDUtLjE3LTEuMDItMy44NC0xLjYzLTYuMTItLjA3LS4yNi0uMTMtLjUxLS4xMy0uNzcgMC0uODIuNC0xLjU0IDEuMDEtMS45OG0zNS4wMS00Mi41YzQuMjUtMy40IDguMTMtNy4xMSAxMS42NS0xMS4xMy43OS0uNjggMS42Mi0xLjAyIDIuNDctMS4wMnMxLjYuMjggMi4yNS44NS45OCAxLjI4Ljk4IDIuMTJ2NDcuNDNjMCAuNC0uMTEuNzEtLjM0Ljk0cy0uNDguMzQtLjc2LjM0aC00LjI1Yy0uMzQgMC0uNjItLjExLS44NS0uMzRzLS4zNC0uNTQtLjM0LS45NFY0My4yM2MtMi42MSAyLjc4LTUuMSA1LjEzLTcuNDggNy4wNi0uMTEuMTEtLjIzLjE3LS4zNC4xN3EtLjI1NSAwLS41MS0uNTFsLTIuNjQtNC41Yy0uMjMtLjQ1LS4xNy0uODIuMTctMS4xem0xLjM2LTE3LjE3YzAtLjI4LjExLS41MS4zNC0uNjggNC45OS0zLjU3IDkuMzItNy42NSAxMy0xMi4yNC40NS0uNDUuODUtLjQ4IDEuMTktLjA4bDMuMjMgMy4xNWMuNC4zNC40NS43NC4xNyAxLjE5LTQuMDggNC45My04Ljc1IDkuMzgtMTQuMDIgMTMuMzQtLjIzLjExLS40LjE3LS41MS4xNy0uMjggMC0uNTEtLjE0LS42OC0uNDJsLTIuNTUtMy45MWMtLjExLS4yMy0uMTctLjQtLjE3LS41MXptMjQuNCAzNC4yNXYtNi4yOWMwLTEuODcuOTEtMi44IDIuNzItMi44aDEyLjgzYzEuNTMgMCAyLjY1LjMgMy4zNi44OS43MS42IDEuMDYgMS43NCAxLjA2IDMuNDR2MTEuODFsLjk0IDE0LjUzdi4xN2MwIC4yMy0uMDguNC0uMjUuNTFzLS4zNy4xNy0uNi4xN2gtNC4zM2MtLjU3IDAtLjg4LS4yNS0uOTQtLjc3bC0uOTMtMTQuNDV2LTkuNmMwLS41MS0uMjgtLjc3LS44NS0uNzdoLTYuMDRjLS4zNCAwLS41Ny4wNy0uNjguMjFzLS4xNy4zOC0uMTcuNzJ2My43NGMwIDUuNTUtMS4zIDEyLjI3LTMuOTEgMjAuMTQtLjE3LjUxLS41MS43Ny0xLjAyLjc3aC00LjY4Yy0uMjggMC0uNS0uMS0uNjQtLjNzLS4xNi0uNDQtLjA0LS43MnE0LjE3LTEzLjA5NSA0LjE3LTIxLjQyem0tMy4yMy00NC4yOWMwLS41Ny4yOC0uODUuODUtLjg1aDMuOTFjLjU3IDAgLjg1LjI4Ljg1Ljg1bC4wOCA5Ljk1YzAgLjQ1LjEuNzguMy45OHMuNTIuMy45OC4zaDMuNjZWMTMuMTRjMC0uNTcuMjUtLjg1Ljc2LS44NWg0LjE3Yy41MSAwIC43Ny4yOC43Ny44NXYxNS4yMWgzLjc0cS42IDAgLjgxLS4zYy4xNC0uMi4yMS0uNTIuMjEtLjk4di05Ljk1YzAtLjU3LjI4LS44NS44NS0uODVoMy43NGMuNTcgMCAuODUuMjguODUuODV2MTQuMTFjMCAuNzktLjIzIDEuNDItLjY4IDEuODdzLTEuMDguNjgtMS44Ny42OGgtMjEuNDJjLS43OSAwLTEuNDItLjIzLTEuODctLjY4cy0uNjgtMS4wOC0uNjgtMS44N1YxNy4xMnptMS4zNiAyMy4zOGMuMjMtLjIzLjUxLS4zNC44NS0uMzRoMjIuMzVjLjQgMCAuNzEuMTEuOTQuMzRzLjM0LjU0LjM0Ljk0djMuMzFjMCAuNC0uMTEuNzEtLjM0Ljk0cy0uNTQuMzQtLjk0LjM0aC0yMi4zNWMtLjM0IDAtLjYyLS4xMS0uODUtLjM0cy0uMzQtLjU0LS4zNC0uOTR2LTMuMzFjMC0uNC4xMS0uNzEuMzQtLjk0bTM2LjA0IDIzLjM4Yy0yLjYxLTUuODQtNC41OS0xMi44MS01Ljk1LTIwLjkxbC00LjQyLTIuMTJjLS41MS0uMjgtLjY1LS42NS0uNDItMS4xIDEuODEtMy42MyAzLjQtNy44NiA0Ljc2LTEyLjcxczIuMzUtOS4zMSAyLjk4LTEzLjM5Yy4wNi0uNC4yLS43MS40Mi0uOTQuMjMtLjIzLjU0LS4zMS45NC0uMjVsMy40LjM0Yy44NS4xMSAxLjI1LjU3IDEuMTkgMS4zNnEtLjc2NSA0LjQyNS0yLjA0IDEwLjJoMTUuODFjLjU3IDAgLjg1LjI4Ljg1Ljg1djQuNTVjMCAuNTctLjI4Ljg1LS44NS44NWgtMy40OGMtLjM0IDcuMTQtLjk5IDEzLjMtMS45NiAxOC40OS0uOTYgNS4xOC0yLjQ0IDkuOTktNC40MiAxNC40MSAzIDUuNSA3LjA4IDEwLjgyIDEyLjI0IDE1Ljk4LjE3LjE3LjI1LjM0LjI1LjUxIDAgLjI4LS4xNC41MS0uNDMuNjhsLTMuODIgMy40Yy0uMTEuMTEtLjI4LjE3LS41MS4xNy0uMjggMC0uNTEtLjExLS42OC0uMzQtNC40OC00LjgyLTcuOTYtOS4zOC0xMC40Ni0xMy42OS0yLjU1IDQuMjUtNS45MiA4Ljc4LTEwLjEyIDEzLjYtLjM0LjQ1LS43NC41MS0xLjE5LjE3bC0zLjk5LTMuMzFjLS40LS4zNC0uNDMtLjc0LS4wOS0xLjE5IDUuMjEtNS4wNCA5LjIxLTEwLjI2IDExLjk5LTE1LjY0em0zLjQtNy45OWMyLjEtNi41NyAzLjM3LTE0Ljk5IDMuODMtMjUuMjVoLTcuOTFsLTEuMDIgMy40OGMxLjE5IDguNTYgMi44OSAxNS44MSA1LjEgMjEuNzZ6bTQxLjA5IDI3LjYyYy0uMi4yMy0uNDcuMzQtLjgxLjM0aC00LjQyYy0uNjggMC0xLjAyLS40Mi0xLjAyLTEuMjd2LTQyLjVjLTIuMTUgMy42OC00LjE3IDYuNjktNi4wNCA5LjAxLS4xNy4yMy0uMzcuMzQtLjYuMzRzLS40Mi0uMDgtLjU5LS4yNWwtNC0yLjg5Yy0uMzQtLjM0LS4zNC0uNzQgMC0xLjE5IDMuNTEtNC40OCA2Ljc2LTkuNiA5LjczLTE1LjM5IDIuOTgtNS43OCA1LjM3LTExLjM5IDcuMTgtMTYuODMuMjMtLjUxLjYtLjY4IDEuMS0uNTFsNC43NiAxLjM2Yy41Ny4xNy43NC41NC41MSAxLjFxLTMuNjYgOC44MzUtNS41MiAxMi43NXY1NWMwIC40LS4xLjcxLS4zLjk0em03LjE4LTYyLjMxYzAtLjU3LjI4LS44NS44NS0uODVoMjEuMDhWMTMuM3EwLS4zNDUuMjEtLjZjLjE0LS4xNy4zLS4yNS40Ny0uMjVoNS40NGMuMTcgMCAuMzMuMDguNDcuMjVxLjIxLjI1NS4yMS42djcuMDVoMjEuNDJjLjU3IDAgLjg1LjI4Ljg1Ljg1djQuNWMwIC41Ny0uMjguODUtLjg1Ljg1aC00OS4zYy0uNTcgMC0uODUtLjI4LS44NS0uODV6bTMuNjYgNDAuMjFjMC0xLjM2LjM3LTIuNDEgMS4xLTMuMTVzMS43OS0xLjEgMy4xNS0xLjFoMzMuODNjMS4zNiAwIDIuNDEuMzcgMy4xNSAxLjEuNzQuNzQgMS4xIDEuNzkgMS4xIDMuMTV2MTcuNmMwIDEuMzYtLjM3IDIuNDEtMS4xIDMuMTUtLjc0Ljc0LTEuNzkgMS4xLTMuMTUgMS4xaC0zMy44M2MtMS4zNiAwLTIuNDEtLjM3LTMuMTUtMS4xLS43NC0uNzQtMS4xLTEuNzktMS4xLTMuMTV6bTEuMTktMjcuODhjMC0uNTcuMjgtLjg1Ljg1LS44NWgzOC4yNWMuNTcgMCAuODUuMjguODUuODV2NC4xN2MwIC41Ny0uMjguODUtLjg1Ljg1aC0zOC4yNWMtLjU3IDAtLjg1LS4yOC0uODUtLjg1em0wIDEyLjE1YzAtLjU3LjI4LS44NS44NS0uODVoMzguMjVjLjU3IDAgLjg1LjI4Ljg1Ljg1djQuMTdjMCAuNTctLjI4Ljg1LS44NS44NWgtMzguMjVjLS41NyAwLS44NS0uMjgtLjg1LS44NXptNi4yMSAzMS40NWgyNy40NmMuMjggMCAuNTEtLjA4LjY4LS4yNXMuMjUtLjM3LjI1LS42VjY0LjA0YzAtLjIzLS4wOC0uNDMtLjI1LS42cy0uNC0uMjUtLjY4LS4yNWgtMjcuMzdjLS4yOCAwLS41MS4wOC0uNjguMjVzLS4yNS4zNy0uMjUuNnYxMi4yNGMwIC41Ny4yOC44NS44NS44NXoiLz48L3N2Zz4=" 
                  alt="微信图标" 
                  className="w-6 h-6 mr-2" 
                />
                微信登录
              </span>
            )}
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