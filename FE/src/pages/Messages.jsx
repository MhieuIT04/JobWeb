import React, { useEffect, useState, useRef, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Messages() {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const pollingRef = useRef(null);

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
    if (!active) return;
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
      fetchMessages(active.id);
    } catch (e) {
      alert('Gửi tin nhắn thất bại.');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-4 p-4 h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Hội thoại</h2>
          <Button size="sm" variant="outline" onClick={fetchThreads}>Làm mới</Button>
        </div>
        <ul className="space-y-2">
          {Array.isArray(threads) && threads.map(t => (
            <li key={t.id}>
              <button onClick={()=>setActive(t)} className={`w-full text-left p-2 rounded ${active?.id===t.id ? 'bg-primary/10' : 'hover:bg-muted'}`}>
                {t.other_user_email || `Thread #${t.id}`}
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="col-span-8 p-4 h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{active?.other_user_email ? `Chat với ${active.other_user_email}` : 'Chọn hội thoại'}</div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map(m => (
            <div key={m.id} className={`max-w-[70%] p-2 rounded bg-white`}> 
              <div className="text-xs text-muted-foreground">{m.sender_email}</div>
              {m.text && <div className="mt-1">{m.text}</div>}
              {m.file && (
                <div className="mt-2">
                  {/\.(png|jpe?g|gif|webp)$/i.test(m.file) ? (
                    <img src={m.file} alt="attachment" className="max-h-40 rounded border" />
                  ) : (
                    <a href={m.file} target="_blank" rel="noreferrer" className="text-blue-600 underline">Tải tệp đính kèm</a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2 items-center">
          <Input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} className="max-w-xs" />
          <Input value={text} onChange={e=>setText(e.target.value)} placeholder="Nhập tin nhắn..." />
          <Button onClick={send}>Gửi</Button>
        </div>
      </Card>
    </div>
  );
}


