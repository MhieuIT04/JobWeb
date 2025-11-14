// src/pages/CVMatch.jsx
import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CVMatch() {
  const [file, setFile] = useState(null);
  const [skillsText, setSkillsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleParse = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('cv', file);
      const res = await axiosClient.post('/api/users/cv/parse/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setParsed(res.data);
      setSkillsText((res.data.skills || []).join(', '));
    } catch (err) {
      setError('Không thể phân tích CV');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const form = new FormData();
      if (file) form.append('cv', file);
      if (skillsText) form.append('skills', skillsText);
      const res = await axiosClient.post('/api/users/cv/match-jobs/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setParsed(res.data.parsed || null);
      setResults(res.data.results || []);
    } catch (err) {
      setError('Không thể gợi ý công việc');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pb-12">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-blue-300 mb-6">Gợi ý việc làm từ CV</h1>

        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-blue-200">Upload CV (pdf/docx/txt)</label>
              <Input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 dark:text-blue-200">Kỹ năng (có thể chỉnh sửa)</label>
              <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Ví dụ: Python, React, SQL" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleParse} disabled={!file || isLoading} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Phân tích CV</Button>
            <Button onClick={handleMatch} disabled={isLoading} variant="outline" className="dark:border-gray-700 dark:text-blue-300">Gợi ý việc làm</Button>
          </div>
          {error && <p className="text-red-500 mt-3">{error}</p>}
        </Card>

        {parsed && (
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-blue-300">Thông tin trích xuất</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-blue-200">
              <div><span className="font-semibold">Họ tên:</span> {parsed.name || '—'}</div>
              <div><span className="font-semibold">Email:</span> {parsed.email || '—'}</div>
              <div><span className="font-semibold">SĐT:</span> {parsed.phone || '—'}</div>
              <div className="md:col-span-3"><span className="font-semibold">Kỹ năng:</span> {(parsed.skills || []).join(', ') || '—'}</div>
            </div>
          </Card>
        )}

        {results && results.length > 0 && (
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-blue-300">Việc làm phù hợp</h3>
            <div className="space-y-3">
              {results.map(job => (
                <div key={job.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-blue-300">{job.title}</div>
                    <div className="text-sm text-gray-600 dark:text-blue-200">{job.company_name} • {job.city || '—'} • {job.category || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-blue-200">Độ phù hợp</div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">{job.score}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CVMatch;
