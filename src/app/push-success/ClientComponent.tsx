'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function PushSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 获取传入的参数
  const kValue = searchParams.get('k');
  const rewardId = searchParams.get('rewardId');
  
  const [userData, setUserData] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 奖励图片映射
  const rewardImages: Record<string, string> = {
    'cofep': '/shareimages/cofep.png',
    'cinemap': '/shareimages/cinemap.png',
    'sharemimiq': '/shareimages/sharemimiq.png',
    'askp': '/shareimages/askp.png',
    'redbagp': '/shareimages/redbagp.png',
  };

  // 奖励名称映射
  const rewardNames: Record<string, string> = {
    'cofep': '咖啡券',
    'cinemap': '电影票',
    'sharemimiq': '分享秘密券',
    'askp': '提问券',
    'redbagp': '红包券',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 检查是否已登录
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        if (storedIsLoggedIn !== 'true') {
          router.push('/');
          return;
        }

        // 获取用户数据
        const socialUid = localStorage.getItem('social_uid');
        if (!socialUid) {
          throw new Error('用户未登录');
        }

        const loginType = localStorage.getItem('login_type') || 'wx';
        const userResponse = await fetch(`/api/user/detail?social_uid=${socialUid}&social_type=${loginType}`);
        const userDataResult = await userResponse.json();
        
        if (!userDataResult.success) {
          throw new Error('获取用户信息失败');
        }

        setUserData(userDataResult.data);

        // 生成二维码 - 使用完整URL
        if (kValue) {
          const fullUrl = `https://tb.vicral.cn/quiz/share?k=${kValue}`;
          const qrResponse = await fetch(`https://uapis.cn/api/v1/image/qrcode?text=${encodeURIComponent(fullUrl)}&size=204&format=json`);
          const qrResult = await qrResponse.json();
          
          if (qrResult.qrcode_base64) {
            setQrCodeData(qrResult.qrcode_base64);
          } else {
            throw new Error('生成二维码失败');
          }
        }

      } catch (err) {
        console.error('获取数据失败:', err);
        setError(err instanceof Error ? err.message : '获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleViewDetails = () => {
    if (kValue) {
      // 跳转到分享页面并传递k参数
      router.push(`/quiz/share?k=${kValue}`);
    } else {
      // 如果没有k参数，跳转到首页
      router.push('/');
    }
  };

  // 绘制合成图片
  useEffect(() => {
    if (!userData || !qrCodeData || !rewardId || !canvasRef.current) {
      return;
    }

    const drawCompositeImage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置画布尺寸 (根据底片尺寸)
      canvas.width = 800;
      canvas.height = 1200;

      try {
        // 创建图片加载函数
        const loadImage = (src: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            // 在浏览器中使用 Image 构造函数
            const img = typeof window !== 'undefined' ? new (window as any).Image() : ({} as HTMLImageElement);
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          });
        };

        // 加载所有需要的图片
        const promises = [
          loadImage('/shareimages/dipian.png'),
          loadImage(userData.avatar_url),
          loadImage(qrCodeData!)
        ];

        // 如果有奖励图片，也加载它
        if (rewardId && rewardImages[rewardId]) {
          promises.push(loadImage(rewardImages[rewardId]));
        }

        const [bgImg, avatarImg, qrImg, rewardImg] = await Promise.all(promises);

        // 设置画布尺寸为底片尺寸
        canvas.width = 1080;
        canvas.height = 1350;

        // 绘制底片 (位置: x=0,y=0 大=1080,h=1350)
        ctx.drawImage(bgImg, 0, 0, 1080, 1350);

        // 绘制奖励券图片 (位置: x=430,y=680 大=472,h=265.5)
        if (rewardImg && rewardImg instanceof HTMLImageElement) {
          ctx.drawImage(rewardImg, 430, 680, 472, 265.5);
        }

        // 绘制二维码 (位置: x=776,y=1051 大=204,h=204)
        ctx.drawImage(qrImg, 776, 1051, 204, 204);

        // 绘制头像圆形图片 (位置: x=414,y=22 大=250x250)
        ctx.save();
        ctx.beginPath();
        ctx.arc(414 + 125, 22 + 125, 125, 0, 2 * Math.PI); // 圆心x=539, 圆心y=147, 半径=125
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 414, 22, 250, 250);
        ctx.restore();



      } catch (err) {
        console.error('绘制合成图片失败:', err);
        setError('绘制合成图片失败: ' + (err as Error).message);
      }
    };

    drawCompositeImage();
  }, [userData, qrCodeData, rewardId]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `quiz-share-${kValue}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">题目发布成功！</h1>
            <p className="text-lg text-gray-600 mb-8">正在准备分享图片...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-4">错误</h1>
            <p className="text-lg text-gray-600 mb-8">{error}</p>
            <button
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
              onClick={() => router.push('/')}
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">题目发布成功！</h1>
          <p className="text-lg text-gray-600 mb-8">您的题目已成功发布，好友们现在可以尝试回答您的问题了。</p>
          
          {/* 生成的合成图片 */}
          <div className="mb-8 flex justify-center">
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto border border-gray-300 rounded-lg"
              style={{ maxHeight: '600px' }}
            />
          </div>
          
          {/* 下载按钮 */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-green-600 hover:to-teal-600 transition-all"
              onClick={handleDownload}
            >
              下载分享图片
            </button>
            <button
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
              onClick={() => {
                if (kValue) {
                  const shareUrl = `https://tb.vicral.cn/quiz/share?k=${kValue}`;
                  navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('分享链接已复制到剪贴板！');
                  }).catch(err => {
                    console.error('复制链接失败:', err);
                    alert('复制链接失败，请手动复制');
                  });
                }
              }}
            >
              试试链接分享吧
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
              onClick={handleViewDetails}
            >
              查看详情
            </button>
            <button
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
              onClick={() => router.push('/')}
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}