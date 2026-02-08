'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// 设备检测函数
function detectDevice() {
  if (typeof window === 'undefined') {
    // 服务器端渲染时，默认返回桌面端
    return 'desktop';
  }
  
  const userAgent = navigator.userAgent || navigator.vendor;
  
  // 移动设备正则表达式
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  if (mobileRegex.test(userAgent)) {
    return 'mobile';
  }
  
  // 平板设备检测
  const tabletRegex = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i;
  if (tabletRegex.test(userAgent)) {
    return 'tablet';
  }
  
  return 'desktop';
}

const HomePage = () => {
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop'); // 默认为desktop
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const text = "测试你和朋友间的默契程度";
  const colors = [
    '#FF6B6B', // 红色
    '#4ECDC4', // 青色
    '#FFE66D', // 黄色
    '#1A535C', // 深青色
    '#FF9F1C', // 橙色
    '#6A0572', // 紫色
    '#06D6A0', // 绿松石色
    '#118AB2', // 蓝色
    '#EF476F', // 粉红色
    '#FFD166', // 浅黄色
    '#073B4C', // 深蓝色
    '#7209b7', // 紫色
    '#f15bb5', // 粉色
    '#fee440', // 亮黄色
  ];

  useEffect(() => {
    const detectedDevice = detectDevice();
    setDeviceType(detectedDevice);
    
    // 根据条件判断登录状态
    const checkLoginStatus = () => {
      const isLoggedInStorage = localStorage.getItem('isLoggedIn');
      const socialUidStorage = localStorage.getItem('social_uid');
      console.log("登录信息："+isLoggedInStorage+socialUidStorage);
      if (!isLoggedInStorage && !socialUidStorage) {
        // 条件1：2个都没有 -> 未登录
        setIsLoggedIn(false);
        setUserData(null);
      } else if (isLoggedInStorage === 'true' && socialUidStorage && socialUidStorage !== '') {
        // 条件2：isLoggedIn==true且social_uid内容不为空 -> 已登录
        // 通过social_uid获取用户信息
        fetchUserInfo(socialUidStorage);
        setIsLoggedIn(true);
      } else {
        // 条件3：其余结果 -> 清除变量，未登录
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('social_uid');
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    
    const fetchUserInfo = async (socialUid: string) => {
      try {
        const response = await fetch(
          `https://u.daib.cn/connect.php?act=query&appid=2423&appkey=${process.env.NEXT_PUBLIC_JUHE_Appkey || process.env.JUHE_Appkey}&type=wx&social_uid=${socialUid}`
        );
        
        const userData = await response.json();
        
        if (userData.code === 0) {
          setUserData({
            nickname: userData.nickname,
            avatar_url: userData.faceimg
          });
        } else {
          // 如果获取用户信息失败，也视为未登录
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('social_uid');
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 如果获取用户信息失败，也视为未登录
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('social_uid');
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('social_uid');
    setIsLoggedIn(true); // 临时设为true以触发重新渲染，然后马上设为false
    setTimeout(() => {
      setIsLoggedIn(false);
      setUserData(null);
      window.location.reload();
    }, 10);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#61f7c0' }}>
      {/* 右上角用户状态显示 */}
      <div className="absolute top-4 right-4">
        {isLoggedIn && userData ? (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Image 
                src={userData.avatar_url || '/images/logo-192x192.png'} 
                alt="用户头像" 
                width={40} 
                height={40} 
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            </div>
            <span className="hidden md:inline text-white font-bold text-lg" style={{ fontFamily: "'MaShanZheng', 'Xiaolai Mono SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
              {userData.nickname}
            </span>
            <button 
              onClick={handleLogout}
              className="ml-2 px-2 py-1 text-sm rounded"
              style={{ 
                backgroundColor: '#FF6B6B', 
                color: 'white',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: '#E55555'
              }}
            >
              退出
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: '#FF9F1C', 
              color: 'white',
              borderWidth: '3px',
              borderStyle: 'solid',
              borderColor: '#ff8c11'
            }}
          >
            登录
          </button>
        )}
      </div>
      
      <div className="w-full flex flex-col items-center p-4">
        {/* Logo - 在移动端占满屏幕宽度 */}
        <div className="w-full max-w-[500px] mb-4">
          <Image 
            src="https://tb.vicral.cn/logo.png" 
            alt="默契盒子 Logo" 
            width={150} 
            height={150} 
            quality={100}
            className="w-full h-auto object-contain mx-auto"
          />
        </div>
        
        {/* 动画文本 */}
        <div className="flex flex-wrap justify-center mb-6">
          {text.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ 
                opacity: 0, 
                y: 50,
                x: -20,
              }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1, // 每个字符延迟0.1秒
                type: "spring",
                stiffness: 100,
              }}
              className="text-3xl lg:text-4xl font-bold"
              style={{ color: colors[index % colors.length] }}
              onAnimationComplete={() => {
                if (index === text.length - 1) {
                  setTextAnimationComplete(true);
                }
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
        
        {/* 【去出题】按钮 - 仅在电脑端在文本动画完成后显示 */}
        {deviceType === 'desktop' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={textAnimationComplete ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <button 
              className="text-2xl font-bold rounded-lg mr-4"
              style={{ 
                backgroundColor: '#ff9f1c00', // 透明背景
                color: '#ff8c11', // 橙色文字
                width: '354px',
                height: '204px',
                borderWidth: '5px',
                borderStyle: 'solid',
                borderColor: '#ff8c11' // 统一边框颜色
              }}
            >
              【去出题】
            </button>
            
            {/* 电脑端其他按钮 - 放在【去出题】按钮右边 */}
            <div className="flex flex-col gap-4">
              <button 
                className="text-lg font-bold rounded-lg py-2"
                style={{ 
                  backgroundColor: '#4ECDC4', // 青色
                  color: 'white',
                  width: '170px',
                  height: '60px',
                  borderWidth: '5px',
                  borderStyle: 'solid',
                  borderColor: '#3AA89F' // 深青色边框
                }}
              >
                【出题记录】
              </button>
              <button 
                className="text-lg font-bold rounded-lg py-2"
                style={{ 
                  backgroundColor: '#FF6B6B', // 红色
                  color: 'white',
                  width: '170px',
                  height: '60px',
                  borderWidth: '5px',
                  borderStyle: 'solid',
                  borderColor: '#E55555' // 深红色边框
                }}
              >
                【答题记录】
              </button>
              <button 
                className="text-lg font-bold rounded-lg py-2"
                style={{ 
                  backgroundColor: '#FFE66D', // 黄色
                  color: '#333',
                  width: '170px',
                  height: '60px',
                  borderWidth: '5px',
                  borderStyle: 'solid',
                  borderColor: '#DCC55D' // 深黄色边框
                }}
              >
                【获得的奖励】
              </button>
              <button 
                className="text-lg font-bold rounded-lg py-2"
                style={{ 
                  backgroundColor: '#6A0572', // 紫色
                  color: 'white',
                  width: '170px',
                  height: '60px',
                  borderWidth: '5px',
                  borderStyle: 'solid',
                  borderColor: '#52045B' // 深紫色边框
                }}
              >
                【发出的奖励】
              </button>
            </div>
          </motion.div>
        )}
        
        {/* 移动端和平板按钮 - 直接显示 */}
        {deviceType !== 'desktop' && (
          <div className="w-full max-w-[500px] mt-4 flex flex-col items-center">
            <button 
              className="w-full text-xl font-bold rounded-lg mb-4"
              style={{ 
                backgroundColor: '#FF9F1C', 
                color: 'white',
                height: '100px', // 移动端高度100px
                borderWidth: '5px',
                borderStyle: 'solid',
                borderColor: '#ff8c11' // 统一边框颜色
              }}
            >
              【去出题】
            </button>
            
            {/* 移动端其他按钮 - 垂直排列 */}
            <button 
              className="w-full text-lg font-bold rounded-lg mb-3 py-3"
              style={{ 
                backgroundColor: '#4ECDC4', // 青色
                color: 'white',
                borderWidth: '5px',
                borderStyle: 'solid',
                borderColor: '#3AA89F' // 深青色边框
              }}
            >
              【出题记录】
            </button>
            <button 
              className="w-full text-lg font-bold rounded-lg mb-3 py-3"
              style={{ 
                backgroundColor: '#FF6B6B', // 红色
                color: 'white',
                borderWidth: '5px',
                borderStyle: 'solid',
                borderColor: '#E55555' // 深红色边框
              }}
            >
              【答题记录】
            </button>
            <button 
              className="w-full text-lg font-bold rounded-lg mb-3 py-3"
              style={{ 
                backgroundColor: '#FFE66D', // 黄色
                color: '#333',
                borderWidth: '5px',
                borderStyle: 'solid',
                borderColor: '#DCC55D' // 深黄色边框
              }}
            >
              【获得的奖励】
            </button>
            <button 
              className="w-full text-lg font-bold rounded-lg py-3"
              style={{ 
                backgroundColor: '#6A0572', // 紫色
                color: 'white',
                borderWidth: '5px',
                borderStyle: 'solid',
                borderColor: '#52045B' // 深紫色边框
              }}
            >
              【发出的奖励】
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;