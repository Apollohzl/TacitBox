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

// Toast通知组件
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-cyan-600' : 'bg-red-600';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in flex items-center gap-3 min-w-[300px]`}>
      <span className="text-xl font-bold">
        {type === 'success' ? '✓' : '✗'}
      </span>
      <span className="font-medium flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-80 transition-opacity text-2xl leading-none"
      >
        ×
      </button>
    </div>
  );
}

// JSON树形编辑器组件
interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  path?: string[];
}

function JsonEditor({ value, onChange, disabled = false, path = [] }: JsonEditorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const toggleExpand = (nodePath: string) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      return newSet;
    });
  };

  const isExpanded = (nodePath: string) => expanded.has(nodePath);

  const handleValueChange = (currentPath: string[], newValue: any) => {
    const newObject = value;
    let current = newObject;
    
    for (let i = 0; i < currentPath.length - 1; i++) {
      current = current[currentPath[i]];
    }
    
    if (currentPath.length === 0) {
      onChange(newValue);
    } else {
      const lastKey = currentPath[currentPath.length - 1];
      current[lastKey] = newValue;
      onChange(newObject);
    }
  };

  const startEdit = (nodePath: string, currentValue: any) => {
    setEditingPath(nodePath);
    setEditValue(typeof currentValue === 'object' ? JSON.stringify(currentValue) : String(currentValue));
  };

  const saveEdit = (nodePath: string) => {
    try {
      const parsed = JSON.parse(editValue);
      const pathParts = nodePath.split('.').filter(p => p);
      handleValueChange(pathParts, parsed);
    } catch {
      // 如果解析失败，作为字符串处理
      const pathParts = nodePath.split('.').filter(p => p);
      handleValueChange(pathParts, editValue);
    }
    setEditingPath(null);
    setEditValue('');
  };

  const addItem = (nodePath: string, isArray: boolean) => {
    const pathParts = nodePath.split('.').filter(p => p);
    const newObject = value;
    let current = newObject;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    if (pathParts.length === 0) {
      if (Array.isArray(newObject)) {
        newObject.push(null);
      } else {
        current['newKey'] = '';
      }
      onChange(newObject);
    } else {
      const lastKey = pathParts[pathParts.length - 1];
      const target = lastKey ? current[lastKey] : current;
      
      if (Array.isArray(target)) {
        target.push(null);
      } else {
        target['newKey'] = '';
      }
      onChange(newObject);
    }
    
    setExpanded(prev => new Set(Array.from(prev).concat(nodePath)));
  };

  const deleteItem = (nodePath: string, indexOrKey: string | number) => {
    const pathParts = nodePath.split('.').filter(p => p);
    const newObject = value;
    let current = newObject;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    if (pathParts.length === 0) {
      if (Array.isArray(newObject)) {
        newObject.splice(Number(indexOrKey), 1);
      } else {
        delete newObject[indexOrKey];
      }
      onChange(newObject);
    } else {
      const lastKey = pathParts[pathParts.length - 1];
      const target = current[lastKey];
      
      if (Array.isArray(target)) {
        target.splice(Number(indexOrKey), 1);
      } else {
        delete target[indexOrKey];
      }
      onChange(newObject);
    }
  };

  const getNodePath = (key: string | number) => [...path, String(key)].join('.');

  const isComplex = (val: any) => typeof val === 'object' && val !== null;

  const renderValue = (val: any, key: string | number, nodePath: string, index: number) => {
    const isObj = isComplex(val);
    const expanded = isExpanded(nodePath);

    if (editingPath === nodePath) {
      return (
        <div key={index} className="flex items-center gap-2 py-1 hover:bg-gray-700 px-2">
          <span className="text-yellow-400">{key}: </span>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit(nodePath);
              if (e.key === 'Escape') {
                setEditingPath(null);
                setEditValue('');
              }
            }}
            className="flex-1 bg-gray-700 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-sm"
            autoFocus
          />
          <button
            onClick={() => saveEdit(nodePath)}
            className="text-green-400 hover:text-green-300 text-xs"
          >
            ✓
          </button>
          <button
            onClick={() => {
              setEditingPath(null);
              setEditValue('');
            }}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            ✗
          </button>
        </div>
      );
    }

    return (
      <div key={index} className="hover:bg-gray-700 px-2">
        <div className="flex items-center gap-2 py-1">
          {isObj && (
            <button
              onClick={() => toggleExpand(nodePath)}
              className="text-gray-400 hover:text-white select-none"
            >
              {expanded ? '▼' : '▶'}
            </button>
          )}
          {!isObj && <span className="w-4"></span>}
          <span className="text-yellow-400">{key}: </span>
          {!isObj && (
            <span 
              className="text-green-400 cursor-pointer hover:underline"
              onClick={() => !disabled && startEdit(nodePath, val)}
            >
              {typeof val === 'string' ? `"${val}"` : String(val)}
            </span>
          )}
          {isObj && (
            <span className="text-gray-400">
              {Array.isArray(val) ? `Array(${val.length})` : `Object{${Object.keys(val).length}}`}
            </span>
          )}
          {!disabled && (
            <button
              onClick={() => deleteItem(nodePath, key)}
              className="text-red-400 hover:text-red-300 text-xs ml-auto"
            >
              删除
            </button>
          )}
        </div>
        {isObj && expanded && (
          <div className="ml-4 pl-2 border-l border-gray-600">
            {Array.isArray(val) ? (
              val.map((item, idx) => renderValue(item, idx, getNodePath(idx), idx))
            ) : (
              Object.entries(val).map(([k, v], idx) => renderValue(v, k, getNodePath(k), idx))
            )}
          </div>
        )}
      </div>
    );
  };

  if (value === null) {
    return <span className="text-gray-500">null</span>;
  }

  if (typeof value !== 'object') {
    return (
      <div className="border border-gray-600 rounded-lg p-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">
            {typeof value === 'string' ? `"${value}"` : String(value)}
          </span>
          {!disabled && (
            <button
              onClick={() => startEdit('', value)}
              className="text-blue-400 hover:text-blue-300 text-xs"
            >
              编辑
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentPath = path.join('.');

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      <div className="bg-gray-700 px-3 py-2 flex items-center justify-between">
        <span className="text-gray-300 text-sm">
          {Array.isArray(value) ? `Array [${value.length}]` : `Object {${Object.keys(value).length}}`}
        </span>
        <button
          onClick={() => !disabled && addItem(currentPath, Array.isArray(value))}
          disabled={disabled}
          className="text-green-400 hover:text-green-300 text-xs disabled:opacity-50"
        >
          + 添加
        </button>
      </div>
      <div className="p-2">
        {Array.isArray(value) ? (
          value.length === 0 ? (
            <span className="text-gray-500 text-sm">空数组</span>
          ) : (
            value.map((item, idx) => renderValue(item, idx, getNodePath(idx), idx))
          )
        ) : (
          Object.keys(value).length === 0 ? (
            <span className="text-gray-500 text-sm">空对象</span>
          ) : (
            Object.entries(value).map(([k, v], idx) => renderValue(v, k, getNodePath(k), idx))
          )
        )}
      </div>
    </div>
  );
}

export default function AdminPage(props: AdminPageProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'database' | 'sql' | 'quick-add'>('database');
  
  // 数据库相关状态
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableContent, setTableContent] = useState<TableContent | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // SQL相关状态
  const [sqlCommand, setSqlCommand] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [quickCommandSearch, setQuickCommandSearch] = useState('');
  
  // Toast通知状态
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // 快捷配置状态
  const [quickAddType, setQuickAddType] = useState<'reward' | 'question' | 'category' | null>(null);
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  
  // 奖励表单
  const [rewardForm, setRewardForm] = useState({
    reward_id: '',
    reward_message: '',
    name: ''
  });
  
  // 分类表单
  const [categoryForm, setCategoryForm] = useState({
    name: ''
  });
  
  // 题目表单
  const [questionForm, setQuestionForm] = useState({
    category_id: '',
    question_text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_answer: 'A',
    difficulty: 'easy'
  });
  const [categories, setCategories] = useState<any[]>([]);

  // 显示Toast通知
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/database?table=quiz_categories');
      const result = await response.json();
      if (result.success && result.data) {
        setCategories(result.data.rows || []);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  // 快捷配置处理
  const handleQuickAdd = async () => {
    const loginType = localStorage.getItem('login_type');
    const socialUid = localStorage.getItem('social_uid');

    if (!loginType || !socialUid) {
      showToast('未登录，无法执行操作', 'error');
      return;
    }

    setQuickAddLoading(true);

    try {
      let data: any = {
        login_type: loginType,
        social_uid: socialUid
      };

      if (quickAddType === 'reward') {
        if (!rewardForm.reward_id.trim() || !rewardForm.name.trim()) {
          showToast('请输入奖励ID和名称', 'error');
          setQuickAddLoading(false);
          return;
        }
        data.type = 'reward';
        data.reward_id = rewardForm.reward_id.trim();
        data.reward_message = rewardForm.reward_message.trim();
        data.name = rewardForm.name.trim();
      } else if (quickAddType === 'category') {
        if (!categoryForm.name.trim()) {
          showToast('请输入分类名称', 'error');
          setQuickAddLoading(false);
          return;
        }
        data.type = 'category';
        data.name = categoryForm.name.trim();
      } else if (quickAddType === 'question') {
        if (!questionForm.category_id || !questionForm.question_text.trim() || !questionForm.optionA.trim() || !questionForm.optionB.trim() || !questionForm.optionC.trim() || !questionForm.optionD.trim()) {
          showToast('请填写所有必填字段', 'error');
          setQuickAddLoading(false);
          return;
        }
        data.type = 'question';
        data.category_id = questionForm.category_id;
        data.question_text = questionForm.question_text.trim();
        data.options = {
          A: questionForm.optionA.trim(),
          B: questionForm.optionB.trim(),
          C: questionForm.optionC.trim(),
          D: questionForm.optionD.trim()
        };
        data.correct_answer = questionForm.correct_answer;
        data.difficulty = questionForm.difficulty;
      }

      const response = await fetch('/api/admin/quick-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showToast('添加成功');
        // 清空表单
        if (quickAddType === 'reward') {
          setRewardForm({ reward_id: '', reward_message: '', name: '' });
        } else if (quickAddType === 'category') {
          setCategoryForm({ name: '' });
          loadCategories(); // 重新加载分类
        } else if (quickAddType === 'question') {
          setQuestionForm({ category_id: '', question_text: '', optionA: '', optionB: '', optionC: '', optionD: '', correct_answer: 'A', difficulty: 'easy' });
        }
      } else {
        showToast(`添加失败: ${result.error}`, 'error');
      }
    } catch (error: any) {
      showToast(`添加失败: ${error.message}`, 'error');
    } finally {
      setQuickAddLoading(false);
    }
  };

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
            // 加载分类列表
            loadCategories();
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

  // 打开编辑模态框
  const openEditModal = (row: any) => {
    setEditingRow(row);
    setEditData({...row});
    setShowEditModal(true);
  };

  // 关闭编辑模态框
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRow(null);
    setEditData({});
  };

  // 保存编辑
  const saveEdit = async () => {
    if (!selectedTable || !editingRow) return;

    setSaving(true);
    
    try {
      // 获取主键列名
      const primaryKey = tableContent?.columns[0]; // 假设第一列是主键
      const primaryKeyValue = editingRow[primaryKey];

      // 构建UPDATE语句和参数
      const updateFields = [];
      const updateValues = [];
      
      Object.keys(editData).forEach(key => {
        if (key !== primaryKey && key !== 'created_at' && key !== 'updated_at') {
          const value = editData[key];
          // 如果是对象，转换为JSON字符串
          const paramValue = typeof value === 'object' ? JSON.stringify(value) : value;
          updateFields.push(`${key} = ?`);
          updateValues.push(paramValue);
        }
      });

      if (updateFields.length === 0) {
        showToast('没有可更新的字段', 'error');
        setSaving(false);
        return;
      }

      const sql = `UPDATE ${selectedTable} SET ${updateFields.join(', ')} WHERE ${primaryKey} = ?`;
      updateValues.push(primaryKeyValue);

      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params: updateValues }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('更新成功');
        closeEditModal();
        loadTableContent(selectedTable); // 重新加载数据
      } else {
        showToast(`更新失败: ${result.error}`, 'error');
      }
    } catch (error: any) {
      showToast(`更新失败: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 打开删除确认对话框
  const openDeleteModal = (row: any) => {
    setDeletingRow(row);
    setShowDeleteModal(true);
  };

  // 关闭删除确认对话框
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingRow(null);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!selectedTable || !deletingRow) return;

    setDeleting(true);
    
    try {
      const primaryKey = tableContent?.columns[0]; // 假设第一列是主键
      const primaryKeyValue = deletingRow[primaryKey];

      const sql = `DELETE FROM ${selectedTable} WHERE ${primaryKey} = ?`;

      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params: [primaryKeyValue] }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('删除成功');
        closeDeleteModal();
        loadTableContent(selectedTable); // 重新加载数据
      } else {
        showToast(`删除失败: ${result.error}`, 'error');
      }
    } catch (error: any) {
      showToast(`删除失败: ${error.message}`, 'error');
    } finally {
      setDeleting(false);
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

  // 快捷命令处理
  const handleQuickCommand = async (sql: string) => {
    setSqlCommand(sql);
    setSqlLoading(true);
    setSqlResult(null);
    setSqlError(null);

    try {
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
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
    { name: '用户活动统计', sql: 'SELECT social_uid, JSON_LENGTH(published_activities) as published, JSON_LENGTH(participated_activities) as participated FROM users WHERE published_activities IS NOT NULL OR participated_activities IS NOT NULL' },
    { name: '活动完成情况', sql: 'SELECT id, creator_user_id, now_finish, max_reward_count, now_get_reward FROM quiz_activities ORDER BY created_at DESC LIMIT 20' },
    { name: '各分类题目数', sql: 'SELECT category_id, COUNT(*) as count FROM quiz_questions GROUP BY category_id ORDER BY count DESC' },
    { name: '今日新用户', sql: 'SELECT COUNT(*) as new_users FROM users WHERE DATE(created_at) = CURDATE()' },
    { name: '今日新活动', sql: 'SELECT COUNT(*) as new_activities FROM quiz_activities WHERE DATE(created_at) = CURDATE()' },
    { name: '今日参与次数', sql: 'SELECT COUNT(*) as today_participations FROM quiz_participations WHERE DATE(participation_time) = CURDATE()' },
    { name: '微信用户', sql: 'SELECT id, social_uid, social_type, nickname, avatar_url, created_at, last_login_at, published_activities, participated_activities FROM users WHERE social_type = "wx" ORDER BY created_at DESC' },
    { name: 'QQ用户', sql: 'SELECT id, social_uid, social_type, nickname, avatar_url, created_at, last_login_at, published_activities, participated_activities FROM users WHERE social_type = "qq" ORDER BY created_at DESC' },
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
            <button
              onClick={() => setActiveTab('quick-add')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'quick-add'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⚡ 快捷配置
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
                          <th className="px-4 py-2 text-left">操作</th>
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
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditModal(row)}
                                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs transition-colors"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => openDeleteModal(row)}
                                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs transition-colors"
                                >
                                  删除
                                </button>
                              </div>
                            </td>
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
              <div className="mb-4">
                <input
                  type="text"
                  value={quickCommandSearch}
                  onChange={(e) => setQuickCommandSearch(e.target.value)}
                  placeholder="搜索快捷命令..."
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {quickSqlCommands
                  .filter(cmd => cmd.name.toLowerCase().includes(quickCommandSearch.toLowerCase()))
                  .map((cmd, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickCommand(cmd.sql)}
                    disabled={sqlLoading}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sqlLoading && sqlCommand === cmd.sql ? '执行中...' : cmd.name}
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

        {/* 快捷配置页面 */}
        {activeTab === 'quick-add' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-300">⚡ 快捷配置</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => {
                  setQuickAddType('reward');
                  setRewardForm({ reward_id: '', reward_message: '', name: '' });
                }}
                className={`p-6 rounded-lg transition-colors ${
                  quickAddType === 'reward'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-4xl mb-2">🎁</div>
                <div className="text-lg font-bold">新增奖励</div>
                <div className="text-sm text-gray-400 mt-1">添加新的quiz_reward</div>
              </button>
              
              <button
                onClick={() => {
                  setQuickAddType('category');
                  setCategoryForm({ name: '' });
                }}
                className={`p-6 rounded-lg transition-colors ${
                  quickAddType === 'category'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-4xl mb-2">📂</div>
                <div className="text-lg font-bold">新增分类</div>
                <div className="text-sm text-gray-400 mt-1">添加新的quiz_categories</div>
              </button>
              
              <button
                onClick={() => {
                  setQuickAddType('question');
                  setQuestionForm({ category_id: '', question_text: '', optionA: '', optionB: '', optionC: '', optionD: '', correct_answer: 'A', difficulty: 'easy' });
                  loadCategories();
                }}
                className={`p-6 rounded-lg transition-colors ${
                  quickAddType === 'question'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-4xl mb-2">❓</div>
                <div className="text-lg font-bold">新增题目</div>
                <div className="text-sm text-gray-400 mt-1">添加新的quiz_questions</div>
              </button>
            </div>
            
            {/* 奖励表单 */}
            {quickAddType === 'reward' && (
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">🎁 新增奖励</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      奖励ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={rewardForm.reward_id}
                      onChange={(e) => setRewardForm({...rewardForm, reward_id: e.target.value})}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="请输入奖励ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      奖励消息
                    </label>
                    <input
                      type="text"
                      value={rewardForm.reward_message}
                      onChange={(e) => setRewardForm({...rewardForm, reward_message: e.target.value})}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="请输入奖励消息"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      奖励名称 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="请输入奖励名称"
                    />
                  </div>
                  <button
                    onClick={handleQuickAdd}
                    disabled={quickAddLoading}
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {quickAddLoading ? '添加中...' : '添加奖励'}
                  </button>
                </div>
              </div>
            )}
            
            {/* 分类表单 */}
            {quickAddType === 'category' && (
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">📂 新增分类</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      分类名称 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="请输入分类名称"
                    />
                  </div>
                  <button
                    onClick={handleQuickAdd}
                    disabled={quickAddLoading}
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {quickAddLoading ? '添加中...' : '添加分类'}
                  </button>
                </div>
              </div>
            )}
            
            {/* 题目表单 */}
            {quickAddType === 'question' && (
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">❓ 新增题目</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      所属分类 <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={questionForm.category_id}
                      onChange={(e) => setQuestionForm({...questionForm, category_id: e.target.value})}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">请选择分类</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      题目内容 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={questionForm.question_text}
                      onChange={(e) => {
                        if (e.target.value.length <= 20) {
                          setQuestionForm({...questionForm, question_text: e.target.value});
                        }
                      }}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="请输入题目内容（最多20个字符）"
                      maxLength={20}
                    />
                    <p className="text-gray-400 text-sm mt-1">{questionForm.question_text.length}/20</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      选项 <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div key={option} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setQuestionForm({...questionForm, correct_answer: option})}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${
                              questionForm.correct_answer === option
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            {option}
                          </button>
                          <input
                            type="text"
                            value={questionForm[`option${option}` as keyof typeof questionForm] as string}
                            onChange={(e) => setQuestionForm({...questionForm, [`option${option}`]: e.target.value})}
                            className={`flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                              questionForm.correct_answer === option ? 'ring-green-500' : 'ring-gray-500'
                            }`}
                            placeholder={`选项${option}`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">点击左侧按钮设置正确答案</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      难度
                    </label>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="easy">简单</option>
                      <option value="medium">中等</option>
                      <option value="hard">困难</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleQuickAdd}
                    disabled={quickAddLoading}
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {quickAddLoading ? '添加中...' : '添加题目'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 编辑模态框 */}
        {showEditModal && editingRow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-300">编辑数据</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-y-auto flex-grow">
                {tableContent?.columns.map((col, index) => {
                  const isPrimaryKey = col === tableContent.columns[0];
                  const isTimestamp = col === 'created_at' || col === 'updated_at';
                  const isDisabled = isPrimaryKey || isTimestamp;
                  
                  return (
                    <div key={index} className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {col}
                        {isPrimaryKey && <span className="text-red-400 ml-2">(主键)</span>}
                        {isTimestamp && <span className="text-yellow-400 ml-2">(自动)</span>}
                      </label>
                      {typeof editingRow[col] === 'object' && editingRow[col] !== null ? (
                        <JsonEditor
                          value={editData[col]}
                          onChange={(value) => setEditData({...editData, [col]: value})}
                          disabled={isDisabled}
                        />
                      ) : (
                        <input
                          type="text"
                          value={editData[col] || ''}
                          onChange={(e) => setEditData({...editData, [col]: e.target.value})}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isDisabled}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认模态框 */}
        {showDeleteModal && deletingRow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-red-400 mb-4">确认删除</h3>
              <p className="text-gray-300 mb-6">您确定要删除这条数据吗？此操作不可恢复。</p>
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? '删除中...' : '确认删除'}
                </button>
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast通知 */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}