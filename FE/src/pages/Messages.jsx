import React, { useEffect, useState, useRef, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Paperclip, Search, MoreVertical, Image as ImageIcon, File, RefreshCw, Plus, X } from 'lucide-react';

export default function Messages() {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const pollingRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchThreads = useCallback(async () => {
    const res = await axiosClient.get('/api/users/chat/threads/');
    const list = res.data?.results || res.data || [];
    setThreads(list);
    if (!active && Array.isArray(list) && list.length) setActive(list[0]);
  }, [active]);

  const fetchMessages = async (threadId) => {
    if (!threadId) return;
    const res = await axiosClient.get(`/api/users/chat/threads/${threadId}/messages/`);
    setMessages(res.data?.results || res.data || []);
    await axiosClient.post(`/api/users/chat/threads/${threadId}/read/`);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { fetchThreads(); }, [fetchThreads]);
  useEffect(() => {
    if (!active) return;
    fetchMessages(active.id);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => fetchMessages(active.id), 4000);
    return () => pollingRef.current && clearInterval(pollingRef.current);
  }, [active]);

  const send = async () => {
    if (!active || (!text.trim() && !file)) return;
    setIsTyping(true);
    try {
      if (file) {
        const fd = new FormData();
        if (text.trim()) fd.append('text', text.trim());
        fd.append('file', file);
        await axiosClient.post(`/api/users/chat/threads/${active.id}/messages/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axiosClient.post(`/api/users/chat/threads/${active.id}/messages/`, { text: text.trim() });
      }
      setText('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMessages(active.id);
    } catch (e) {
      alert('Gửi tin nhắn thất bại.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const filteredThreads = threads.filter(t => 
    (t.other_user_email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateThread = async () => {
    const userId = recipientId.trim();
    if (!userId) {
      alert('Vui lòng nhập User ID người nhận');
      return;
    }

    // Validate it's a number
    if (!/^\d+$/.test(userId)) {
      alert('User ID phải là số');
      return;
    }

    setIsCreatingThread(true);
    try {
      const res = await axiosClient.post('/api/users/chat/threads/', { 
        user_id: parseInt(userId) 
      });
      const newThread = res.data;
      setShowNewMessageModal(false);
      setRecipientId('');
      await fetchThreads();
      setActive(newThread);
    } catch (e) {
      const errorMsg = e.response?.data?.detail || e.response?.data?.error || 'Không thể tạo hội thoại mới. Vui lòng kiểm tra User ID.';
      alert(errorMsg);
      console.error('Error creating thread:', e);
    } finally {
      setIsCreatingThread(false);
    }
  };

  const handleKeyPressModal = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateThread();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tin nhắn</h1>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Threads List */}
          <Card className="col-span-12 md:col-span-4 p-0 h-[calc(100vh-200px)] flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Hội thoại
                </h2>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setShowNewMessageModal(true)} className="gap-1">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={fetchThreads} className="gap-1">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="pl-10 bg-slate-50 dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có hội thoại nào</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredThreads.map(t => (
                    <li key={t.id}>
                      <button
                        onClick={() => setActive(t)}
                        className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          active?.id === t.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-600 text-white">
                              {(t.other_user_email || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 dark:text-white truncate">
                              {t.other_user_email || `Thread #${t.id}`}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {t.last_message || 'Bắt đầu trò chuyện'}
                            </div>
                          </div>
                          {t.unread_count > 0 && (
                            <Badge className="bg-blue-600">{t.unread_count}</Badge>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Messages Area */}
          <Card className="col-span-12 md:col-span-8 p-0 h-[calc(100vh-200px)] flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            {active ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {(active.other_user_email || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {active.other_user_email || `Thread #${active.id}`}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {isTyping ? 'Đang nhập...' : 'Đang hoạt động'}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                        <p>Chưa có tin nhắn nào</p>
                        <p className="text-sm mt-1">Gửi tin nhắn đầu tiên để bắt đầu</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isOwn = m.sender_email === active.other_user_email ? false : true;
                      return (
                        <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-2xl p-3 ${
                              isOwn 
                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm shadow-sm'
                            }`}>
                              {!isOwn && (
                                <div className="text-xs opacity-70 mb-1">{m.sender_email}</div>
                              )}
                              {m.text && <div className="break-words">{m.text}</div>}
                              {m.file && (
                                <div className="mt-2">
                                  {/\.(png|jpe?g|gif|webp)$/i.test(m.file) ? (
                                    <div className="relative group">
                                      <img src={m.file} alt="attachment" className="max-h-60 rounded-lg" />
                                      <a
                                        href={m.file}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                                      >
                                        <ImageIcon className="w-8 h-8 text-white" />
                                      </a>
                                    </div>
                                  ) : (
                                    <a
                                      href={m.file}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`flex items-center gap-2 p-2 rounded-lg ${
                                        isOwn ? 'bg-blue-700' : 'bg-slate-100 dark:bg-slate-700'
                                      }`}
                                    >
                                      <File className="w-5 h-5" />
                                      <span className="text-sm">Tệp đính kèm</span>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  {file && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <Paperclip className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{file.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                        ✕
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2 items-end">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1"
                    />
                    <Button
                      onClick={send}
                      disabled={!text.trim() && !file}
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Gửi
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Chọn một hội thoại để bắt đầu</p>
                  <p className="text-sm mt-2">Chọn từ danh sách bên trái</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewMessageModal(false)}>
            <Card className="w-full max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Tin nhắn mới</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowNewMessageModal(false);
                      setRecipientId('');
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      User ID người nhận
                    </label>
                    <Input
                      type="number"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      onKeyPress={handleKeyPressModal}
                      placeholder="Nhập User ID người bạn muốn nhắn tin..."
                      className="bg-slate-50 dark:bg-slate-900"
                      autoFocus
                      disabled={isCreatingThread}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Ví dụ: 2, 3, 4... (Bạn có thể tìm User ID trong danh sách công việc hoặc ứng viên)
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewMessageModal(false);
                        setRecipientId('');
                      }}
                      className="flex-1"
                      disabled={isCreatingThread}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleCreateThread}
                      disabled={!recipientId.trim() || isCreatingThread}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      {isCreatingThread ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Bắt đầu
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


