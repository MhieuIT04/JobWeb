import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CompanyMap from '../components/CompanyMap';
import {
  Building2, MapPin, Users, Briefcase, Globe, Mail, Phone,
  Star, TrendingUp, Award, Target, ArrowLeft, ExternalLink,
  Calendar, DollarSign, Clock, MessageSquare
} from 'lucide-react';

// Star Select Component for reviews
function StarSelect({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <Select value={String(value || 0)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="0" />
        </SelectTrigger>
        <SelectContent>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <SelectItem key={n} value={String(n)}>{n} ⭐</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ 
    culture_rating: 0, 
    salary_rating: 0, 
    process_rating: 0, 
    comment: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        
        // Fetch company jobs first
        const jobsRes = await axiosClient.get(`/api/jobs/?employer=${id}`);
        const jobsData = jobsRes.data.results || jobsRes.data || [];
        setJobs(jobsData);

        // Get company info from first job's employer data
        if (jobsData.length > 0 && jobsData[0].employer) {
          const emp = jobsData[0].employer;
          setCompany({
            id: emp.id,
            name: emp.company_name,
            logo: emp.logo,
            bio: emp.bio,
            website: emp.website,
            email: emp.email,
            phone: emp.phone_number,
            city: emp.city?.name,
            size: emp.company_size,
            industry: emp.industry,
            description: emp.bio,
            rating: jobsData[0].employer_avg_rating || 4.5,
            founded: emp.founded_year || '2020'
          });
        } else {
          // Fallback: try to fetch employer profile
          try {
            const empRes = await axiosClient.get(`/api/users/employers/${id}/`);
            const emp = empRes.data;
            setCompany({
              id: emp.id,
              name: emp.company_name,
              logo: emp.logo,
              bio: emp.bio,
              website: emp.website,
              email: emp.email,
              phone: emp.phone_number,
              city: emp.city?.name,
              size: emp.company_size,
              industry: emp.industry,
              description: emp.bio,
              rating: 4.5,
              founded: emp.founded_year || '2020'
            });
          } catch (err) {
            console.error('Cannot fetch employer:', err);
            setCompany({
              id: id,
              name: `Công ty #${id}`,
              description: 'Thông tin đang được cập nhật.'
            });
          }
        }

        // Fetch reviews
        try {
          const reviewsRes = await axiosClient.get(`/api/users/employers/${id}/reviews/`);
          setReviews(reviewsRes.data?.results || reviewsRes.data || []);
        } catch (err) {
          console.error('Cannot fetch reviews:', err);
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Không thể tải thông tin công ty');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const submitReview = async () => {
    setSubmitting(true);
    try {
      if (!(reviewForm.culture_rating > 0 || reviewForm.salary_rating > 0 || reviewForm.process_rating > 0)) {
        alert('Vui lòng chọn ít nhất một tiêu chí đánh giá > 0.');
        return;
      }
      await axiosClient.post(`/api/users/employers/${id}/reviews/`, reviewForm);
      setReviewForm({ culture_rating: 0, salary_rating: 0, process_rating: 0, comment: '' });
      // Refresh data
      const reviewsRes = await axiosClient.get(`/api/users/employers/${id}/reviews/`);
      setReviews(reviewsRes.data?.results || reviewsRes.data || []);
      alert('Đánh giá đã được gửi thành công!');
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.detail || e?.response?.data || 'Gửi đánh giá thất bại. Bạn cần đăng nhập và đã từng ứng tuyển công ty.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const calculateOverallRating = (review) => {
    const ratings = [review.culture_rating, review.salary_rating, review.process_rating].filter(r => r > 0);
    if (ratings.length === 0) return 0;
    return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  };

  const handleFollowCompany = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await axiosClient.delete(`/api/users/employers/${id}/follow/`);
        setIsFollowing(false);
        alert('Đã bỏ theo dõi công ty');
      } else {
        // Follow
        await axiosClient.post(`/api/users/employers/${id}/follow/`);
        setIsFollowing(true);
        alert('Đã theo dõi công ty thành công!');
      }
    } catch (err) {
      console.error('Error following company:', err);
      alert('Bạn cần đăng nhập để theo dõi công ty');
    } finally {
      setFollowLoading(false);
    }
  };

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
      {/* Header with Banner */}
      <div className="relative">
        {/* Banner Image */}
        <div 
          className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900"
          style={{
            backgroundImage: company?.banner ? `url(${company.banner})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container mx-auto px-4 h-full flex items-start pt-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/companies')}
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Company Header Card */}
        <Card className="p-8 bg-white dark:bg-slate-800 shadow-2xl mb-6 border-2 border-white dark:border-slate-700">
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
                <div className="flex-1">
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
                <div className="flex flex-col gap-2">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {jobs.length} việc làm
                  </Badge>
                  <Button
                    onClick={handleFollowCompany}
                    disabled={followLoading}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "" : "bg-blue-600 hover:bg-blue-700"}
                  >
                    <Star className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    {followLoading ? 'Đang xử lý...' : isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Button>
                </div>
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
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
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Đánh giá ({reviews.length})
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
                  {company.description || company.bio || `${company.name} là một công ty ${company.industry || 'công nghệ'} chuyên nghiệp tại ${company.city || 'Việt Nam'}. Chúng tôi đang tìm kiếm những ứng viên tài năng để gia nhập đội ngũ của mình.`}
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
                              <span>{typeof job.city === 'object' ? job.city.name : job.city}</span>
                            </div>
                          )}
                          {job.work_type && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{typeof job.work_type === 'object' ? job.work_type.name : job.work_type}</span>
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

                {/* Office Locations */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Văn phòng
                  </h4>
                  <div className="space-y-4">
                    {/* Main Office */}
                    <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-xl border border-blue-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-blue-600 rounded-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                            Trụ sở chính
                          </div>
                          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                            <div>
                              <div>{company.address || 'Đang cập nhật địa chỉ'}</div>
                              {company.city && (
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {company.city}, Việt Nam
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Google Maps Integration */}
                      <div className="mt-4">
                        <CompanyMap 
                          address={company.address || company.city} 
                          city={company.city || 'Hà Nội'} 
                        />
                      </div>

                      {/* Additional Info */}
                      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 grid grid-cols-2 gap-4 text-sm">
                        {company.phone && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Phone className="w-4 h-4 text-blue-600" />
                            <a href={`tel:${company.phone}`} className="hover:text-blue-600">
                              {company.phone}
                            </a>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <a href={`mailto:${company.email}`} className="hover:text-blue-600 truncate">
                              {company.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              {/* Review Form */}
              <Card className="p-6 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Đánh giá công ty
                </h3>
                <div className="space-y-4">
                  <StarSelect 
                    label="Văn hóa công ty" 
                    value={reviewForm.culture_rating} 
                    onChange={(v) => setReviewForm(f => ({ ...f, culture_rating: v }))} 
                  />
                  <StarSelect 
                    label="Mức lương & phúc lợi" 
                    value={reviewForm.salary_rating} 
                    onChange={(v) => setReviewForm(f => ({ ...f, salary_rating: v }))} 
                  />
                  <StarSelect 
                    label="Quy trình tuyển dụng" 
                    value={reviewForm.process_rating} 
                    onChange={(v) => setReviewForm(f => ({ ...f, process_rating: v }))} 
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nhận xét của bạn
                    </label>
                    <Textarea
                      placeholder="Chia sẻ trải nghiệm phỏng vấn, môi trường làm việc..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      rows={4}
                      className="dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <Button 
                    onClick={submitReview} 
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                </div>
              </Card>

              {/* Reviews List */}
              <Card className="p-6 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Đánh giá từ ứng viên ({reviews.length})
                </h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có đánh giá nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.round(calculateOverallRating(review))
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {calculateOverallRating(review).toFixed(1)}
                            </span>
                            {review.verified && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                Đã xác minh
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {review.reviewer_email}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                          {review.culture_rating > 0 && (
                            <div>
                              <span className="text-slate-600 dark:text-slate-400">Văn hóa: </span>
                              <span className="font-medium text-slate-900 dark:text-white">{review.culture_rating}/5</span>
                            </div>
                          )}
                          {review.salary_rating > 0 && (
                            <div>
                              <span className="text-slate-600 dark:text-slate-400">Lương: </span>
                              <span className="font-medium text-slate-900 dark:text-white">{review.salary_rating}/5</span>
                            </div>
                          )}
                          {review.process_rating > 0 && (
                            <div>
                              <span className="text-slate-600 dark:text-slate-400">Quy trình: </span>
                              <span className="font-medium text-slate-900 dark:text-white">{review.process_rating}/5</span>
                            </div>
                          )}
                        </div>

                        {review.comment && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
