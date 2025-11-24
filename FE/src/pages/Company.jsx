import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import RatingStars from '../components/RatingStars';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Star } from 'lucide-react';
import HomeFooter from '../components/HomeFooter';

function StarSelect({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <Select value={String(value||0)} onValueChange={(v)=>onChange(Number(v))}>
        <SelectTrigger className="w-32"><SelectValue placeholder="0" /></SelectTrigger>
        <SelectContent>
          {[0,1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Company() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ culture_rating: 0, salary_rating: 0, process_rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      // Fetch jobs by this employer first
      const jobsRes = await axiosClient.get(`/api/jobs/?employer=${id}`);
      const jobsData = jobsRes.data.results || jobsRes.data || [];
      setJobs(jobsData);

      // Get company info from first job's employer data
      if (jobsData.length > 0 && jobsData[0].employer) {
        setCompany({
          id: jobsData[0].employer.id,
          company_name: jobsData[0].employer.company_name,
          logo: jobsData[0].employer.logo,
          bio: jobsData[0].employer.bio,
          avg_rating: jobsData[0].employer_avg_rating || 0,
          review_count: 0
        });
      } else {
        // Try to fetch employer profile directly
        try {
          const companyRes = await axiosClient.get(`/api/users/employers/${id}/`);
          setCompany(companyRes.data);
        } catch (err) {
          console.error('Cannot fetch employer profile:', err);
          setCompany({
            id: id,
            company_name: `Công ty #${id}`,
            logo: null,
            bio: null,
            avg_rating: 0,
            review_count: 0
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
    } catch (e) {
      console.error('Error fetching company data:', e);
      alert('Không thể tải thông tin công ty. Vui lòng thử lại.');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchCompanyData(); }, [id]);

  const submit = async () => {
    setSubmitting(true);
    try {
      if (!(form.culture_rating > 0 || form.salary_rating > 0 || form.process_rating > 0)) {
        alert('Vui lòng chọn ít nhất một tiêu chí đánh giá > 0.');
        return;
      }
      await axiosClient.post(`/api/users/employers/${id}/reviews/`, form);
      setForm({ culture_rating: 0, salary_rating: 0, process_rating: 0, comment: '' });
      fetchCompanyData();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.detail || e?.response?.data || 'Gửi đánh giá thất bại. Bạn cần đăng nhập và đã từng ứng tuyển công ty.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setSubmitting(false); }
  };

  const overall = (r) => r.overall_rating || Math.round(((r.culture_rating||0)+(r.salary_rating||0)+(r.process_rating||0))/Math.max(1,[r.culture_rating,r.salary_rating,r.process_rating].filter(Boolean).length)*10)/10;

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Đang tải...</div>;
  }

  if (!company) {
    return <div className="container mx-auto px-4 py-8">Không tìm thấy công ty.</div>;
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Company Header */}
      <Card className="p-6 bg-white dark:bg-gray-900">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={company.logo} alt={company.company_name} />
            <AvatarFallback className="text-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-blue-300">
              {company.company_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-blue-300 mb-2">{company.company_name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{(company.avg_rating || 0).toFixed(1)}</span>
                <span>({company.review_count || 0} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{jobs.length} việc làm</span>
              </div>
            </div>
            {company.bio && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{company.bio}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Jobs Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-blue-300 mb-4">
          Việc làm tại {company.company_name}
        </h2>
        {jobs.length === 0 ? (
          <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
            Công ty chưa có việc làm nào.
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {job.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.city.name}</span>
                          </div>
                        )}
                        {job.work_type && (
                          <Badge variant="outline" className="text-xs">
                            {job.work_type.name}
                          </Badge>
                        )}
                      </div>
                      {job.min_salary && (
                        <div className="mt-2 text-green-600 dark:text-green-400 font-medium">
                          {new Intl.NumberFormat('vi-VN').format(job.min_salary)} - {new Intl.NumberFormat('vi-VN').format(job.max_salary)} {job.currency}
                        </div>
                      )}
                    </div>
                    {job.created_at && (new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24) < 7 && (
                      <Badge className="bg-blue-500 text-white">Mới</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Review form */}
      <Card className="p-6 space-y-4 bg-white dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-blue-300">Đánh giá công ty</h2>
        <StarSelect label="Văn hoá" value={form.culture_rating} onChange={(v)=>setForm(f=>({...f, culture_rating: v}))} />
        <StarSelect label="Mức lương" value={form.salary_rating} onChange={(v)=>setForm(f=>({...f, salary_rating: v}))} />
        <StarSelect label="Quy trình" value={form.process_rating} onChange={(v)=>setForm(f=>({...f, process_rating: v}))} />
        <Textarea 
          placeholder="Chia sẻ trải nghiệm phỏng vấn, môi trường làm việc..." 
          value={form.comment} 
          onChange={(e)=>setForm(f=>({...f, comment: e.target.value}))}
          className="dark:bg-gray-800 dark:text-gray-200"
        />
        <Button disabled={submitting} onClick={submit}>Gửi đánh giá</Button>
      </Card>

      {/* Review list */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-blue-300">Review từ ứng viên</h2>
        {reviews.length === 0 ? (
          <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
            Chưa có review nào.
          </Card>
        ) : (
          reviews.map(rv => (
            <Card key={rv.id} className="p-4 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RatingStars value={overall(rv)} />
                  {rv.verified && (
                    <Badge variant="default" className="text-xs bg-emerald-500">
                      Đã xác minh
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{rv.reviewer_email}</span>
              </div>
              {rv.comment && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rv.comment}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
    <HomeFooter />
    </>
  );
}
