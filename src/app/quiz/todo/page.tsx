import { Suspense } from 'react';
import TodoContent from './TodoContent';

export default function TodoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">正在加载...</p>
        </div>
      </div>
    }>
      <TodoContent />
    </Suspense>
  );
}