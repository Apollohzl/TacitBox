'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const HomePage = () => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#61f7c0' }}>
      <div className="text-center p-8">
        <div className="mb-6">
          <Image 
            src="https://tb.vicral.cn/logo.png" 
            alt="默契盒子 Logo" 
            width={150} 
            height={150} 
            quality={100}
            className="mx-auto rounded-full object-cover"
          />
        </div>
        <div className="flex flex-wrap justify-center mt-8">
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
              className="text-3xl md:text-4xl font-bold"
              style={{ color: colors[index % colors.length] }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;