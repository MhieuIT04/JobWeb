import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    Upload, FileText, Brain, Star, MapPin, Building, 
    DollarSign, Clock, CheckCircle, AlertCircle, Zap,
    TrendingUp, Target, Award
} from 'lucide-react';
import { toast } from 'react-toastify';

const CVAnalysis = () => {
    const [cvFile, setCvFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');

    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setError('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
                setCvFile(null);
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                setError('Chỉ chấp nhận file PDF, DOC, DOCX.');
                setCvFile(null);
                return;
            }
            
            setCvFile(file);
            setError('');
        }
    };

    const handleAnalyze = async () => {
        if (!cvFile) {
            setError('Vui lòng chọn file CV để phân tích.');
            return;
        }

        setIsAnalyzing(true);
        setError('');

        const formData = new FormData();
        formData.append('cv_file', cvFile);

        try {
            const response = await axiosClient.post('/api/jobs/ai/analyze-cv/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setAnalysisResult(response.data);
            toast.success('Phân tích CV thành công!');
        } catch (err) {
            console.error('Lỗi khi phân tích CV:', err);
            const errorMsg = err.response?.data?.error || 'Đã có lỗi xảy ra khi phân tích CV.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getMatchColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600 bg-green-100';
        if (percentage >= 60) return 'text-blue-600 bg-blue-100';
        if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getMatchIcon = (percentage) => {
        if (percentage >= 80) return <Award className="w-4 h-4" />;
        if (percentage >= 60) return <Target className="w-4 h-4" />;
        if (percentage >= 40) return <TrendingUp className="w-4 h-4" />;
        return <AlertCircle className="w-4 h-4" />;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-amber-400 mb-2 flex items-center gap-3">
                    <Brain className="w-8 h-8" />
                    Phân tích CV thông minh
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Tải lên CV của bạn để phân tích kỹ năng và tìm công việc phù hợp
                </p>
            </div>

            {/* Upload Section */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Tải lên CV của bạn
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="cv-upload" className="text-sm font-medium">
                            Chọn file CV (PDF, DOC, DOCX)
                        </Label>
                        <Input
                            id="cv-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="mt-2"
                        />
                        {cvFile && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Đã chọn: {cvFile.name}</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button 
                        onClick={handleAnalyze}
                        disabled={!cvFile || isAnalyzing}
                        className="w-full md:w-auto flex items-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Đang phân tích...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                Phân tích CV
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
                <div className="space-y-6">
                    {/* CV Analysis Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Kết quả phân tích CV
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {analysisResult.cv_analysis.skills_count}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Kỹ năng được tìm thấy
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {analysisResult.recommended_jobs.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Công việc phù hợp
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {analysisResult.total_matches}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Tổng số kết quả
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-semibold mb-2">Kỹ năng trong CV của bạn:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.cv_analysis.skills_extracted.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="capitalize">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Alert>
                                <CheckCircle className="w-4 h-4" />
                                <AlertDescription>
                                    {analysisResult.cv_analysis.analysis_summary}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Recommended Jobs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                Công việc được đề xuất
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analysisResult.recommended_jobs.length > 0 ? (
                                <div className="space-y-4">
                                    {analysisResult.recommended_jobs.map((job) => (
                                        <Card key={job.id} className="hover:shadow-lg transition-shadow">
                                            <CardContent className="pt-6">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <RouterLink 
                                                                    to={`/jobs/${job.id}`}
                                                                    className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                                                >
                                                                    {job.title}
                                                                </RouterLink>
                                                                <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                                                                    <Building className="w-4 h-4" />
                                                                    <span>{job.employer?.company_name || 'Công ty'}</span>
                                                                </div>
                                                            </div>
                                                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(job.match_percentage)}`}>
                                                                {getMatchIcon(job.match_percentage)}
                                                                <span>{job.match_percentage}% phù hợp</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {job.city?.name || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <DollarSign className="w-4 h-4" />
                                                                {job.min_salary ? 
                                                                    `${new Intl.NumberFormat('vi-VN').format(job.min_salary)} - ${new Intl.NumberFormat('vi-VN').format(job.max_salary)} ${job.currency}` 
                                                                    : "Thương lượng"
                                                                }
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(job.created_at).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>

                                                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                                                            {job.description}
                                                        </p>

                                                        {job.skills && job.skills.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mb-3">
                                                                {job.skills.slice(0, 5).map(skill => (
                                                                    <Badge key={skill.id} variant="outline" className="text-xs">
                                                                        {skill.name}
                                                                    </Badge>
                                                                ))}
                                                                {job.skills.length > 5 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{job.skills.length - 5}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2 md:w-48">
                                                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                                {job.match_score}/5.0
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                Điểm phù hợp
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            asChild
                                                            className="w-full"
                                                        >
                                                            <RouterLink to={`/jobs/${job.id}`}>
                                                                Xem chi tiết
                                                            </RouterLink>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Không tìm thấy công việc phù hợp
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Hãy thử cập nhật CV với nhiều kỹ năng hơn hoặc xem tất cả công việc có sẵn.
                                    </p>
                                    <Button asChild className="mt-4">
                                        <RouterLink to="/jobs">
                                            Xem tất cả công việc
                                        </RouterLink>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CVAnalysis;