import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import RatingStars from '../components/RatingStars';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function StarSelect({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-gray-600">{label}</span>
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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ culture_rating: 0, salary_rating: 0, process_rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/api/users/employers/${id}/reviews/`);
      setReviews(res.data?.results || res.data || []);
    } catch (e) {
      console.error(e);
      alert('Không tải được danh sách review.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [id]);

  const submit = async () => {
    setSubmitting(true);
    try {
      if (!(form.culture_rating > 0 || form.salary_rating > 0 || form.process_rating > 0)) {
        alert('Vui lòng chọn ít nhất một tiêu chí đánh giá > 0.');
        return;
      }
      await axiosClient.post(`/api/users/employers/${id}/reviews/`, form);
      setForm({ culture_rating: 0, salary_rating: 0, process_rating: 0, comment: '' });
      fetchReviews();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.detail || e?.response?.data || 'Gửi đánh giá thất bại. Bạn cần đăng nhập và đã từng ứng tuyển công ty.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setSubmitting(false); }
  };

  const overall = (r) => r.overall_rating || Math.round(((r.culture_rating||0)+(r.salary_rating||0)+(r.process_rating||0))/Math.max(1,[r.culture_rating,r.salary_rating,r.process_rating].filter(Boolean).length)*10)/10;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Công ty #{id}</h1>

      {/* Review form */}
      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">Đánh giá công ty</h2>
        <StarSelect label="Văn hoá" value={form.culture_rating} onChange={(v)=>setForm(f=>({...f, culture_rating: v}))} />
        <StarSelect label="Mức lương" value={form.salary_rating} onChange={(v)=>setForm(f=>({...f, salary_rating: v}))} />
        <StarSelect label="Quy trình" value={form.process_rating} onChange={(v)=>setForm(f=>({...f, process_rating: v}))} />
        <Textarea placeholder="Chia sẻ trải nghiệm phỏng vấn, môi trường làm việc..." value={form.comment} onChange={(e)=>setForm(f=>({...f, comment: e.target.value}))} />
        <Button disabled={submitting} onClick={submit}>Gửi đánh giá</Button>
      </Card>

      {/* Review list */}
      <div className="space-y-3">
        <h2 className="font-semibold">Review từ ứng viên</h2>
        {loading ? <p>Đang tải...</p> : (
          reviews.length === 0 ? <p>Chưa có review.</p> : (
            reviews.map(rv => (
              <Card key={rv.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RatingStars value={overall(rv)} />
                    {rv.verified && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Đã xác minh</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{rv.reviewer_email}</span>
                </div>
                {rv.comment && <p className="mt-2 text-sm text-gray-700">{rv.comment}</p>}
              </Card>
            ))
          )
        )}
      </div>
    </div>
  );
}


