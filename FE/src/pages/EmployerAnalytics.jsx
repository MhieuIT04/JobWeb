// src/pages/EmployerAnalytics.jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Briefcase, Users, FileText, TrendingUp, Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-toastify';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function EmployerAnalytics() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchDashboardStats();
    }
  }, [startDate, endDate]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await axiosClient.get(`/api/jobs/dashboard/employer/stats/?${params}`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Không thể tải thống kê');
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportToCSV = () => {
    if (!stats) return;
    
    try {
      let csv = 'Báo cáo thống kê tuyển dụng\n\n';
      csv += `Từ ngày: ${startDate}\n`;
      csv += `Đến ngày: ${endDate}\n\n`;
      
      csv += 'Tổng quan\n';
      csv += 'Chỉ số,Giá trị\n';
      csv += `Tổng số tin,${stats.total_jobs}\n`;
      csv += `Tổng ứng viên,${stats.total_applications}\n`;
      csv += `Tin đã duyệt,${stats.jobs_by_status?.approved || 0}\n`;
      csv += `Chờ xử lý,${stats.applications_by_status?.pending || 0}\n\n`;
      
      csv += 'Top công việc\n';
      csv += 'Tiêu đề,Số ứng viên\n';
      (stats.top_jobs || []).forEach(job => {
        csv += `"${job.title}",${job.applications_count}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics_${startDate}_${endDate}.csv`;
      link.click();
      
      toast.success('Đã xuất báo cáo CSV!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Không thể xuất báo cáo');
    }
  };
  
  const exportToJSON = () => {
    if (!stats) return;
    
    try {
      const data = {
        period: { start: startDate, end: endDate },
        summary: {
          total_jobs: stats.total_jobs,
          total_applications: stats.total_applications,
          jobs_by_status: stats.jobs_by_status,
          applications_by_status: stats.applications_by_status
        },
        top_jobs: stats.top_jobs,
        timeline: stats.applications_timeline
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics_${startDate}_${endDate}.json`;
      link.click();
      
      toast.success('Đã xuất báo cáo JSON!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Không thể xuất báo cáo');
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

  // Prepare data for pie chart (jobs by status)
  const jobsStatusData = Object.entries(stats.jobs_by_status || {}).map(([status, count]) => ({
    name: status === 'approved' ? 'Đã duyệt' : status === 'pending' ? 'Chờ duyệt' : status,
    value: count
  }));

  // Prepare data for pie chart (applications by status)
  const appsStatusData = Object.entries(stats.applications_by_status || {}).map(([status, count]) => ({
    name: status === 'pending' ? 'Chờ xử lý' : status === 'accepted' ? 'Chấp nhận' : 'Từ chối',
    value: count
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pb-12">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-blue-300 mb-2">
                📊 Dashboard & Analytics
              </h1>
              <p className="text-gray-600 dark:text-blue-200">
                Tổng quan về hoạt động tuyển dụng của bạn
              </p>
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Xuất CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToJSON}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Xuất JSON
              </Button>
            </div>
          </div>
          
          {/* Date Range Picker */}
          <Card className="p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="start-date" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Từ ngày
                </Label>
                <Input 
                  id="start-date"
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>
              
              <div className="flex-1">
                <Label htmlFor="end-date" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Đến ngày
                </Label>
                <Input 
                  id="end-date"
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <Button 
                onClick={fetchDashboardStats}
                className="md:w-auto w-full"
              >
                Áp dụng
              </Button>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Jobs */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-blue-200 mb-1">Tổng số tin</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-blue-300">{stats.total_jobs}</p>
                <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                  {stats.this_month.jobs} tin trong tháng này
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Total Applications */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-blue-200 mb-1">Tổng ứng viên</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-blue-300">{stats.total_applications}</p>
                <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                  {stats.this_month.applications} trong tháng này
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          {/* Approved Jobs */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-blue-200 mb-1">Tin đã duyệt</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-blue-300">
                  {stats.jobs_by_status?.approved || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                  Đang hiển thị công khai
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          {/* Pending Applications */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-blue-200 mb-1">Chờ xử lý</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-blue-300">
                  {stats.applications_by_status?.pending || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-blue-300 mt-1">
                  Ứng viên chờ phản hồi
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Applications Timeline */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-blue-300">
              Ứng viên 7 ngày gần nhất
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.applications_timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
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
                  name="Số ứng viên"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Jobs by Status */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-blue-300">
              Phân bố tin tuyển dụng
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobsStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Jobs */}
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-blue-300">
              Top 5 tin có nhiều ứng viên nhất
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_jobs || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="title" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
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
                <Bar 
                  dataKey="applications_count" 
                  fill="#10b981"
                  name="Số ứng viên"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
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
                  data={appsStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EmployerAnalytics;


