import { Suspense } from 'react';
import ConfirmQuizClient from './ClientComponent';

export default function ConfirmQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100"><p className="text-lg">正在加载...</p></div>}>
      <ConfirmQuizClient />
    </Suspense>
  );
}