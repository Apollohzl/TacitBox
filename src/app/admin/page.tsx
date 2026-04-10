'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminPageProps {}

export default function AdminPage(props: AdminPageProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<'gui' | 'cli'>('gui');
  const [cliCommand, setCliCommand] = useState('');
  const [cliOutput, setCliOutput] = useState('');
  const [loading, setLoading] = useState(true);

  // 验证管理员权限
  useEffect(() => {
    const verifyAdmin = async () => {
      const loginType = localStorage.getItem('login_type');
      const socialUid = localStorage.getItem('social_uid');

      if (!loginType || !socialUid) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            login_type: loginType,
            social_uid: socialUid
          }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          if (result.data.login_type === loginType && result.data.social_uid === socialUid) {
            setIsAdmin(true);
            setIsVerified(true);
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('管理员验证失败:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [router]);

  // 快捷操作按钮功能
  const handleQuickAction = async (action: string) => {
    try {
      const response = await fetch('/api/admin/quick-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${action} 操作成功`);
      } else {
        alert(`${action} 操作失败: ${result.error}`);
      }
    } catch (error: any) {
      alert(`${action} 操作失败: ${error.message}`);
    }
  };

  // 执行CLI命令
  const executeCliCommand = async () => {
    if (!cliCommand.trim()) {
      setCliOutput('请输入命令');
      return;
    }

    setCliOutput('执行中...');

    try {
      const response = await fetch('/api/admin/cli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: cliCommand }),
      });

      const result = await response.json();

      if (result.success) {
        setCliOutput(result.output || '命令执行成功');
      } else {
        setCliOutput(`错误: ${result.error}`);
      }
    } catch (error: any) {
      setCliOutput(`执行失败: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">验证管理员权限...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-bold text-xl mb-4">权限不足</p>
          <p className="text-gray-600 mb-4">您没有访问此页面的权限</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-400">🔐 管理员控制台</h1>
          <button
            onClick={() => router.push('/account')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            返回账户
          </button>
        </div>

        {/* 快捷操作按钮 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-green-300">⚡ 快捷操作</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction('get_all_users')}
              className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors"
            >
              📋 获取所有用户
            </button>
            <button
              onClick={() => handleQuickAction('get_all_activities')}
              className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg transition-colors"
            >
              📝 获取所有活动
            </button>
            <button
              onClick={() => handleQuickAction('get_all_participations')}
              className="bg-pink-600 hover:bg-pink-700 p-4 rounded-lg transition-colors"
            >
              👥 获取所有参与记录
            </button>
            <button
              onClick={() => handleQuickAction('get_all_questions')}
              className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg transition-colors"
            >
              ❓ 获取所有题目
            </button>
            <button
              onClick={() => handleQuickAction('get_all_rewards')}
              className="bg-green-600 hover:bg-green-700 p-4 rounded-lg transition-colors"
            >
              🎁 获取所有奖励
            </button>
            <button
              onClick={() => handleQuickAction('cleanup_expired_activities')}
              className="bg-red-600 hover:bg-red-700 p-4 rounded-lg transition-colors"
            >
              🧹 清理过期活动
            </button>
            <button
              onClick={() => handleQuickAction('get_system_stats')}
              className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-lg transition-colors"
            >
              📊 获取系统统计
            </button>
            <button
              onClick={() => handleQuickAction('backup_database')}
              className="bg-teal-600 hover:bg-teal-700 p-4 rounded-lg transition-colors"
            >
              💾 备份数据库
            </button>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('gui')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'gui'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🖥️ 图形化操作
            </button>
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'cli'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💻 命令行操作
            </button>
          </div>
        </div>

        {/* 图形化操作面板 */}
        {activeTab === 'gui' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-300">🖥️ 图形化操作面板</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 用户管理 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4 text-blue-300">👤 用户管理</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-left">
                    查看用户列表
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-left">
                    搜索用户
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-left">
                    删除用户
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-left">
                    修改用户信息
                  </button>
                </div>
              </div>

              {/* 活动管理 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4 text-purple-300">📝 活动管理</h3>
                <div className="space-y-2">
                  <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-left">
                    查看活动列表
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-left">
                    创建活动
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-left">
                    删除活动
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-left">
                    修改活动信息
                  </button>
                </div>
              </div>

              {/* 题目管理 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4 text-yellow-300">❓ 题目管理</h3>
                <div className="space-y-2">
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-left">
                    查看题目列表
                  </button>
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-left">
                    添加题目
                  </button>
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-left">
                    删除题目
                  </button>
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-left">
                    修改题目
                  </button>
                </div>
              </div>

              {/* 奖励管理 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4 text-green-300">🎁 奖励管理</h3>
                <div className="space-y-2">
                  <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-left">
                    查看奖励列表
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-left">
                    添加奖励
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-left">
                    删除奖励
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-left">
                    修改奖励
                  </button>
                </div>
              </div>

              {/* 数据统计 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4 text-indigo-300">📊 数据统计</h3>
                <div className="space-y-2">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-left">
                    用户统计
                  </button>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-left">
                    活动统计
                  </button>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-left">
                    参与统计
                  </button>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-left">
                    奖励统计
                  </button>
                </div>
              </div>

              {/* 系统管理 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4 text-red-300">⚙️ 系统管理</h3>
                <div className="space-y-2">
                  <button className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-left">
                    清理缓存
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-left">
                    备份数据
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-left">
                    恢复数据
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-left">
                    系统日志
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 命令行操作面板 */}
        {activeTab === 'cli' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-300">💻 命令行操作面板</h2>
            
            {/* 命令输入 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                输入命令
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cliCommand}
                  onChange={(e) => setCliCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeCliCommand()}
                  placeholder="例如: users:list, activities:delete --id=123"
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={executeCliCommand}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
                >
                  执行
                </button>
              </div>
            </div>

            {/* 命令输出 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                输出结果
              </label>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono min-h-[200px] max-h-[400px] overflow-y-auto">
                <pre>{cliOutput || '等待命令输入...'}</pre>
              </div>
            </div>

            {/* 常用命令提示 */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3 text-yellow-300">📖 常用命令</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">users:list</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">users:get --uid=xxx</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">users:delete --uid=xxx</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">activities:list</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">activities:get --id=xxx</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">activities:delete --id=xxx</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">questions:list</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">questions:delete --id=xxx</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">rewards:list</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">stats:all</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">backup:create</code>
                <code className="bg-gray-700 px-3 py-2 rounded text-sm">cleanup:expired</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}