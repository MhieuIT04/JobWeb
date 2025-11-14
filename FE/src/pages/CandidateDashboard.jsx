// src/pages/CandidateDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FileText, Heart, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';

const COLORS = {
  pending: '#f59e0b',
  accepted: '#10b981',
  rejected: '#ef4444'
};

function CandidateDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get('/api/jobs/dashboard/candidate/stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Không thể tải thống kê');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Prepare data for pie chart
  const statusData = Object.entries(stats.applications_by_status || {}).map(([status, count]) => ({
    name: status === 'pending' ? 'Chờ xử lý' : status === 'accepted' ? 'Đã chấp nhận' : 'Bị từ chối',
    value: count,
    status: status
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pb-12">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-blue-300 mb-2">
            📊 Dashboard của tôi
          </h1>
          <p className="text-gray-600 dark:text-blue-200">
            Theo dõi quá trình ứng tuyển của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Applications */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-blue-200 mb-1">Đã ứng tuyển</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-blue-300">{stats.total_applications}</p>
                <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                  {stats.this_month_applications} trong tháng này
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Saved Jobs */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-blue-200 mb-1">Đã lưu</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-blue-300">{stats.total_saved_jobs}</p>
                <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                  Công việc yêu thích
                </p>
              </div>
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </Card>

          {/* Accepted */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-blue-200 mb-1">Đã chấp nhận</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.applications_by_status?.accepted || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                  Tỷ lệ: {stats.success_rate}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          {/* Pending */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-blue-200 mb-1">Chờ xử lý</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.applications_by_status?.pending || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                  Đang chờ phản hồi
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Applications Timeline */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-blue-300">
              Lịch sử ứng tuyển (30 ngày)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.applications_timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    color: '#f3f4f6'
                  }}
                />
                <Legend wrapperStyle={{ color: '#6b7280' }} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Số đơn ứng tuyển"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Applications by Status */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-blue-300">
              Trạng thái ứng tuyển
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600 dark:text-blue-200">Chờ xử lý</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-blue-200">Đã chấp nhận</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600 dark:text-blue-200">Bị từ chối</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-blue-300">
            Ứng tuyển gần đây
          </h3>
          <div className="space-y-4">
            {stats.recent_applications && stats.recent_applications.length > 0 ? (
              stats.recent_applications.map((app) => (
                <div 
                  key={app.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => navigate(`/jobs/${app.job_id}`)}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-blue-300">{app.job_title}</h4>
                    <p className="text-sm text-gray-600 dark:text-blue-200">{app.company_name}</p>
                    <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                      Ứng tuyển: {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === 'accepted' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : app.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {app.status === 'accepted' ? 'Đã chấp nhận' : app.status === 'pending' ? 'Chờ xử lý' : 'Bị từ chối'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-blue-200 py-8">
                Bạn chưa ứng tuyển công việc nào.
              </p>
            )}
          </div>
          
          {stats.recent_applications && stats.recent_applications.length > 0 && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/applications')}
                className="dark:border-gray-700 dark:text-blue-300"
              >
                Xem tất cả ứng tuyển
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default CandidateDashboard;


