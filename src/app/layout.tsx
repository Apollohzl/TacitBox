import type { Metadata } from 'next';
import './globals.css';
import { QuizProvider } from '../context/QuizContext';

export const metadata: Metadata = {
  title: '默契盒子 (TacitBox)',
  description: '通过出题和答题来测试朋友间的默契度',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="pb-12">
        <QuizProvider>
          {children}
          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 text-center z-50">
            <a 
              href="https://www.beianx.cn/search/vicral.cn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
            >
              赣ICP备2025077459号-9
            </a>
          </footer>
        </QuizProvider>
      </body>
    </html>
  );
}