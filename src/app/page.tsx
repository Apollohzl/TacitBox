import React from 'react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#61f7c0' }}>
      <div className="text-center p-8">
        <div className="mb-6">
          <Image 
            src="/images/logo-512x512.png" 
            alt="默契盒子 Logo" 
            width={150} 
            height={150} 
            quality={100}
            className="mx-auto rounded-full object-cover"
          />
        </div>
        <p className="text-xl md:text-2xl text-white mt-4">测试你和朋友间的默契程度</p>
      </div>
    </div>
  );
}