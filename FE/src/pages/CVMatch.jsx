// src/pages/CVMatch.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, Upload, Sparkles, TrendingUp, MapPin, Building2, 
  DollarSign, Clock, Star, CheckCircle2, AlertCircle, Briefcase 
} from 'lucide-react';

function CVMatch() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [skillsText, setSkillsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-orange-100 dark:bg-orange-900/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-12">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">AI CV Matching</h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Tải CV lên và để AI tìm công việc phù hợp nhất cho bạn
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mb-6 shadow-lg">
          <div className="space-y-6">
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {file ? file.name : 'Kéo thả CV vào đây'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                hoặc click để chọn file (PDF, DOCX, TXT)
              </p>
              <Input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="max-w-xs mx-auto"
              />
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">File đã chọn: {file.name}</span>
                </div>
              )}
            </div>

            {/* Skills Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Kỹ năng của bạn (có thể chỉnh sửa sau khi phân tích)
              </label>
              <Input
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Ví dụ: Python, React, SQL, Machine Learning, Docker..."
                className="text-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleParse}
                disabled={!file || isLoading}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 gap-2 px-8 py-6 text-lg"
              >
                <FileText className="w-5 h-5" />
                {isLoading ? 'Đang phân tích...' : 'Phân tích CV'}
              </Button>
              <Button
                onClick={handleMatch}
                disabled={isLoading || (!file && !skillsText)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 gap-2 px-8 py-6 text-lg"
              >
                <Sparkles className="w-5 h-5" />
                {isLoading ? 'Đang tìm kiếm...' : 'Tìm việc phù hợp'}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Parsed CV Info */}
        {parsed && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800 mb-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Thông tin đã trích xuất</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Họ tên</div>
                <div className="font-semibold text-slate-900 dark:text-white">{parsed.name || '—'}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Email</div>
                <div className="font-semibold text-slate-900 dark:text-white">{parsed.email || '—'}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Số điện thoại</div>
                <div className="font-semibold text-slate-900 dark:text-white">{parsed.phone || '—'}</div>
              </div>
              <div className="md:col-span-3 bg-white dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Kỹ năng</div>
                <div className="flex flex-wrap gap-2">
                  {(parsed.skills || []).length > 0 ? (
                    parsed.skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-500">Không tìm thấy kỹ năng</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Matching Results */}
        {results && results.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Tìm thấy {results.length} việc làm phù hợp
                </h3>
                <p className="text-slate-600 dark:text-slate-400">Được sắp xếp theo độ phù hợp</p>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((job, idx) => (
                <Card
                  key={job.id}
                  className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-start gap-6">
                    {/* Match Score */}
                    <div className={`flex-shrink-0 w-24 h-24 rounded-xl ${getScoreBg(job.score)} flex flex-col items-center justify-center`}>
                      <div className={`text-3xl font-bold ${getScoreColor(job.score)}`}>
                        {job.score}%
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Phù hợp</div>
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-slate-600 dark:text-slate-400">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{job.company_name}</span>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          #{idx + 1}
                        </Badge>
                      </div>

                      {/* Match Progress */}
                      <div className="mb-4">
                        <Progress value={job.score} className="h-2" />
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span>{job.city || 'Không xác định'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.category || 'Khác'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.salary || 'Thỏa thuận'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span>{job.work_type || 'Full-time'}</span>
                        </div>
                      </div>

                      {/* Matching Skills */}
                      {job.matching_skills && job.matching_skills.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Kỹ năng phù hợp:</div>
                          <div className="flex flex-wrap gap-2">
                            {job.matching_skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !parsed && (
          <Card className="p-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-center">
            <Sparkles className="w-20 h-20 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Bắt đầu tìm việc với AI
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Tải CV của bạn lên và để AI phân tích, sau đó tìm những công việc phù hợp nhất với kỹ năng và kinh nghiệm của bạn
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CVMatch;
