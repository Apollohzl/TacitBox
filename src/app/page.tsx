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
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#61f7c0' }}>
      {/* 电脑端装饰框 - 仅在检测到桌面端时显示 */}
      {deviceType === 'desktop' && (
        <div className="absolute" style={{ left: 'calc(50% - 150px)', top: 'calc(50% + 150px)' }}>
          <div 
            className="border-2 rounded-lg" 
            style={{ 
              borderColor: `#${Math.floor(Math.random()*16777215).toString(16)}`, // 随机彩色边框
              borderWidth: '3px',
              width: '300px',
              height: '200px'
            }}
          ></div>
        </div>
      )}
      
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
          >
            <button 
              className="px-8 py-4 text-2xl font-bold rounded-full border-2 border-transparent"
              style={{ backgroundColor: '#FF9F1C', color: 'white' }} // 橙色按钮
            >
              【去出题】
            </button>
          </motion.div>
        )}
        
        {/* 移动端和tablet按钮 - 直接显示 */}
        {deviceType !== 'desktop' && (
          <div className="w-full max-w-[500px] mt-4">
            <button 
              className="w-full py-4 text-xl font-bold rounded-full border-2 border-transparent"
              style={{ backgroundColor: '#FF9F1C', color: 'white' }} // 橙色按钮
            >
              【去出题】
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;