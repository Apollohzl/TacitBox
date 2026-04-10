'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminPageProps {}

interface TableData {
  name: string;
  count: number;
}

interface TableContent {
  table: string;
  columns: string[];
  rows: any[];
  rowCount: number;
}

export default function AdminPage(props: AdminPageProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'database' | 'sql'>('database');
  
  // 数据库相关状态
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableContent, setTableContent] = useState<TableContent | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  
  // SQL相关状态
  const [sqlCommand, setSqlCommand] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);

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
            // 加载数据库表列表
            loadDatabaseTables();
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

  // 加载数据库表列表
  const loadDatabaseTables = async () => {
    try {
      const response = await fetch('/api/admin/database');
      const result = await response.json();
      
      if (result.success) {
        setTables(result.data.tables);
      }
    } catch (error) {
      console.error('加载数据库表失败:', error);
    }
  };

  // 加载表内容
  const loadTableContent = async (tableName: string) => {
    setSelectedTable(tableName);
    setTableLoading(true);
    
    try {
      const response = await fetch(`/api/admin/database?table=${encodeURIComponent(tableName)}`);
      const result = await response.json();
      
      if (result.success) {
        setTableContent(result.data);
      }
    } catch (error) {
      console.error('加载表内容失败:', error);
    } finally {
      setTableLoading(false);
    }
  };

  // 执行SQL命令
  const executeSql = async () => {
    if (!sqlCommand.trim()) {
      setSqlError('请输入SQL命令');
      return;
    }

    setSqlLoading(true);
    setSqlResult(null);
    setSqlError(null);

    try {
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: sqlCommand }),
      });

      const result = await response.json();

      if (result.success) {
        setSqlResult(result.data);
      } else {
        setSqlError(result.error);
      }
    } catch (error: any) {
      setSqlError(error.message);
    } finally {
      setSqlLoading(false);
    }
  };

  // 快捷SQL命令
  const quickSqlCommands = [
    { name: '用户总数', sql: 'SELECT COUNT(*) as total FROM users' },
    { name: '活动总数', sql: 'SELECT COUNT(*) as total FROM quiz_activities' },
    { name: '参与总数', sql: 'SELECT COUNT(*) as total FROM quiz_participations' },
    { name: '题目总数', sql: 'SELECT COUNT(*) as total FROM quiz_questions' },
    { name: '奖励总数', sql: 'SELECT COUNT(*) as total FROM quiz_reward' },
    { name: '分类总数', sql: 'SELECT COUNT(*) as total FROM quiz_categories' },
    { name: '最近10个用户', sql: 'SELECT id, social_uid, nickname, created_at FROM users ORDER BY created_at DESC LIMIT 10' },
    { name: '最近10个活动', sql: 'SELECT id, creator_user_id, reward_id, now_finish, created_at FROM quiz_activities ORDER BY created_at DESC LIMIT 10' },
    { name: '最近10次参与', sql: 'SELECT id, activity_id, participant_user_id, correct_count, participation_time FROM quiz_participations ORDER BY participation_time DESC LIMIT 10' },
    { name: '所有分类', sql: 'SELECT id, name FROM quiz_categories ORDER BY id' },
    { name: '所有奖励', sql: 'SELECT * FROM quiz_reward ORDER BY reward_id' },
    { name: '高难度题目', sql: 'SELECT id, question_text, category_id FROM quiz_questions WHERE difficulty = "hard" LIMIT 20' },
    { name: '简单题目', sql: 'SELECT id, question_text, category_id FROM quiz_questions WHERE difficulty = "easy" LIMIT 20' },
    { name: '活跃用户', sql: 'SELECT social_uid, nickname, last_login_at FROM users WHERE last_login_at > DATE_SUB(NOW(), INTERVAL 7 DAY)' },
    { name: '已发奖励', sql: 'SELECT COUNT(*) as rewarded FROM quiz_participations WHERE has_rewarded = 1' },
    { name: '待发奖励', sql: 'SELECT COUNT(*) as waiting FROM quiz_participations WHERE has_rewarded = 0 AND correct_count >= (SELECT min_correct FROM quiz_activities WHERE id = quiz_participations.activity_id)' },
    { name: '用户活动统计', sql: 'SELECT social_uid, JSON_LENGTH(published_activities) as published, JSON_LENGTH(participated_activities) as participated FROM users WHERE published_activities IS NOT NULL OR participated_activities IS NOT NULL' },
    { name: '活动完成情况', sql: 'SELECT id, creator_user_id, now_finish, max_reward_count, now_get_reward FROM quiz_activities ORDER BY created_at DESC LIMIT 20' },
    { name: '各分类题目数', sql: 'SELECT category_id, COUNT(*) as count FROM quiz_questions GROUP BY category_id ORDER BY count DESC' },
    { name: '今日新用户', sql: 'SELECT COUNT(*) as new_users FROM users WHERE DATE(created_at) = CURDATE()' },
    { name: '今日新活动', sql: 'SELECT COUNT(*) as new_activities FROM quiz_activities WHERE DATE(created_at) = CURDATE()' },
    { name: '今日参与次数', sql: 'SELECT COUNT(*) as today_participations FROM quiz_participations WHERE DATE(participation_time) = CURDATE()' },
    { name: '微信用户', sql: 'SELECT COUNT(*) as wx_users FROM users WHERE social_type = "wx"' },
    { name: 'QQ用户', sql: 'SELECT COUNT(*) as qq_users FROM users WHERE social_type = "qq"' },
    { name: '未登录7天', sql: 'SELECT COUNT(*) as inactive_users FROM users WHERE last_login_at < DATE_SUB(NOW(), INTERVAL 7 DAY)' },
  ];

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

        {/* Tab切换 */}
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('database')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'database'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📊 数据库浏览
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'sql'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💻 SQL命令
            </button>
          </div>
        </div>

        {/* 数据库浏览页面 */}
        {activeTab === 'database' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-300">📊 数据库浏览</h2>
            
            {/* 表列表 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 text-blue-300">数据表列表</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => loadTableContent(table.name)}
                    className={`p-4 rounded-lg transition-colors ${
                      selectedTable === table.name
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">{table.name}</div>
                    <div className="text-xs text-gray-400">{table.count} 行</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 表内容 */}
            {selectedTable && tableContent && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-300">
                    表: {selectedTable} ({tableContent.rowCount} 行)
                  </h3>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                  >
                    关闭
                  </button>
                </div>

                {tableLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-gray-400">加载数据中...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-700">
                          {tableContent.columns.map((col, index) => (
                            <th key={index} className="px-4 py-2 text-left">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableContent.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-700">
                            {tableContent.columns.map((col, colIndex) => (
                              <td key={colIndex} className="px-4 py-2">
                                {row[col] !== null && row[col] !== undefined ? (
                                  (() => {
                                    const value = row[col];
                                    // 检查是否是对象或数组（JSON类型）
                                    if (typeof value === 'object' && value !== null) {
                                      const jsonStr = JSON.stringify(value);
                                      return jsonStr.length > 100 
                                        ? jsonStr.substring(0, 100) + '...' 
                                        : jsonStr;
                                    }
                                    return String(value).substring(0, 100);
                                  })()
                                ) : 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SQL命令页面 */}
        {activeTab === 'sql' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-300">💻 SQL命令</h2>
            
            {/* 快捷命令 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 text-yellow-300">⚡ 快捷命令</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {quickSqlCommands.map((cmd, index) => (
                  <button
                    key={index}
                    onClick={() => setSqlCommand(cmd.sql)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {cmd.name}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL输入 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SQL命令
              </label>
              <textarea
                value={sqlCommand}
                onChange={(e) => setSqlCommand(e.target.value)}
                placeholder="SELECT * FROM users LIMIT 10"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={executeSql}
                  disabled={sqlLoading}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {sqlLoading ? '执行中...' : '执行'}
                </button>
                <button
                  onClick={() => {
                    setSqlCommand('');
                    setSqlResult(null);
                    setSqlError(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  清空
                </button>
              </div>
            </div>

            {/* SQL结果 */}
            {(sqlResult || sqlError) && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-purple-300">执行结果</h3>
                {sqlError && (
                  <div className="bg-red-900 border border-red-700 p-4 rounded-lg mb-4">
                    <p className="text-red-300 font-bold">错误:</p>
                    <p className="text-red-200 mt-2 font-mono text-sm">{sqlError}</p>
                  </div>
                )}
                {sqlResult && (
                  <div className="bg-black border border-gray-700 p-4 rounded-lg">
                    <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                      {JSON.stringify(sqlResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}