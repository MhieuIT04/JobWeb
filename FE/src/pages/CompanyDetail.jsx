import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2, MapPin, Users, Briefcase, Globe, Mail, Phone,
  Star, TrendingUp, Award, Target, ArrowLeft, ExternalLink,
  Calendar, DollarSign, Clock
} from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        // Fetch company details
        const companyRes = await axiosClient.get(`/api/users/companies/${id}/`);
        setCompany(companyRes.data);

        // Fetch company jobs
        const jobsRes = await axiosClient.get(`/api/jobs/?company=${id}`);
        setJobs(jobsRes.data.results || jobsRes.data || []);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Không thể tải thông tin công ty');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <Building2 className="w-20 h-20 mx-auto mb-4 text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {error || 'Không tìm thấy công ty'}
          </h2>
          <Button onClick={() => navigate('/companies')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/companies')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16">
        {/* Company Header Card */}
        <Card className="p-8 bg-white dark:bg-slate-800 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {company.name}
                  </h1>
                  <div className="flex flex-wrap gap-3 text-slate-600 dark:text-slate-400">
                    {company.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{company.city}</span>
                      </div>
                    )}
                    {company.size && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{company.size} nhân viên</span>
                      </div>
                    )}
                    {company.industry && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{company.industry}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {jobs.length} việc làm
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mb-4">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{company.email}</span>
                  </a>
                )}
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{company.phone}</span>
                  </a>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {jobs.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Việc làm</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {company.rating || '4.5'}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Đánh giá</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {company.founded || '2020'}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Thành lập</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="about" className="gap-2">
              <Building2 className="w-4 h-4" />
              Giới thiệu
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Việc làm ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="culture" className="gap-2">
              <Star className="w-4 h-4" />
              Văn hóa
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <Card className="p-6 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Về chúng tôi
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {company.description || 'Chưa có mô tả về công ty.'}
                </p>
              </div>

              {company.benefits && company.benefits.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Phúc lợi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {company.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-slate-800">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Công ty hiện không có vị trí tuyển dụng
                  </p>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="p-6 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {job.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.city}</span>
                            </div>
                          )}
                          {job.work_type && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.work_type}</span>
                            </div>
                          )}
                          {job.salary && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Đang tuyển
                      </Badge>
                    </div>
                    {job.description && (
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {job.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>Đăng {new Date(job.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Culture Tab */}
          <TabsContent value="culture">
            <Card className="p-6 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Văn hóa công ty
              </h3>
              <div className="space-y-6">
                {/* Values */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Giá trị cốt lõi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(company.values || ['Đổi mới', 'Chất lượng', 'Hợp tác', 'Phát triển']).map((value, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Environment */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Môi trường làm việc</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {company.work_environment || 
                      'Môi trường làm việc chuyên nghiệp, năng động và sáng tạo. Chúng tôi khuyến khích sự đổi mới và phát triển cá nhân.'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
